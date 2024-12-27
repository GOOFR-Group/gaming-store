package data

import (
	"context"
	"fmt"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"

	"github.com/goofr-group/gaming-store/server/internal/domain"
)

const (
	constraintUsersCartsPkey       = "users_carts_pkey"
	constraintUsersCartsUserIDFkey = "users_carts_user_id_fkey"
	constraintUsersCartsGameIDFkey = "users_carts_game_id_fkey"
)

// CreateUserCartGame executes a query to create a user cart game association with the specified identifiers.
func (s *store) CreateUserCartGame(ctx context.Context, tx pgx.Tx, userID, gameID uuid.UUID) error {
	_, err := tx.Exec(ctx, `
		INSERT INTO users_carts (user_id, game_id)
		VALUES ($1, $2)
	`,
		userID,
		gameID,
	)
	if err != nil {
		switch constraintNameFromError(err) {
		case constraintUsersCartsPkey:
			return fmt.Errorf("%s: %w", descriptionFailedExec, domain.ErrUserCartGameAlreadyExists)
		case constraintUsersCartsUserIDFkey:
			return fmt.Errorf("%s: %w", descriptionFailedExec, domain.ErrUserNotFound)
		case constraintUsersCartsGameIDFkey:
			return fmt.Errorf("%s: %w", descriptionFailedExec, domain.ErrGameNotFound)
		}

		return fmt.Errorf("%s: %w", descriptionFailedExec, err)
	}

	return nil
}

// ListUserCart executes a query to return the user cart for the specified filter.
func (s *store) ListUserCart(ctx context.Context, tx pgx.Tx, userID uuid.UUID, filter domain.UserCartPaginatedFilter) (domain.PaginatedResponse[domain.Game], error) {
	sqlWhere := "WHERE uc.user_id = $1"

	row := tx.QueryRow(ctx, `
		SELECT count(uc.game_id) 
		FROM users_carts uc 
	`+sqlWhere,
		userID,
	)

	var total int

	err := row.Scan(&total)
	if err != nil {
		return domain.PaginatedResponse[domain.Game]{}, fmt.Errorf("%s: %w", descriptionFailedScanRow, err)
	}

	var domainSortField domain.UserCartPaginatedSort
	if filter.Sort != nil {
		domainSortField = filter.Sort.Field()
	}

	sortField := "uc.created_at"

	switch domainSortField {
	case domain.UserCartPaginatedSortCreatedAt:
		sortField = "uc.created_at"
	case domain.UserCartPaginatedSortGameTitle:
		sortField = "g.title"
	}

	rows, err := tx.Query(ctx, `
		SELECT g.id, g.title, g.price, g.is_active, g.release_date, g.description, g.age_rating, g.features, g.languages, g.requirements, g.created_at, g.modified_at,
			p.id, p.email, p.name, p.address, p.country, p.vatin, p.created_at, p.modified_at,
			pm.id, pm.checksum, pm.media_type, pm.url, pm.created_at,
			gpm.id, gpm.checksum, gpm.media_type, gpm.url, gpm.created_at,
			gdm.id, gdm.checksum, gdm.media_type, gdm.url, gdm.created_at
		FROM users_carts uc
		INNER JOIN games g
			ON g.id = uc.game_id
		INNER JOIN publishers p
			ON p.id = g.publisher_id
		LEFT JOIN multimedia pm
			ON pm.id = p.picture_multimedia_id
		INNER JOIN multimedia gpm
			ON gpm.id = g.preview_multimedia_id
		LEFT JOIN multimedia gdm
			ON gdm.id = g.download_multimedia_id 
 	`+sqlWhere+listSQLOrder(sortField, filter.Order, nil)+listSQLLimitOffset(filter.Limit, filter.Offset),
		userID,
	)
	if err != nil {
		return domain.PaginatedResponse[domain.Game]{}, fmt.Errorf("%s: %w", descriptionFailedQuery, err)
	}
	defer rows.Close()

	games, err := getGamesFromRows(rows)
	if err != nil {
		return domain.PaginatedResponse[domain.Game]{}, fmt.Errorf("%s: %w", descriptionFailedScanRows, err)
	}

	for i, game := range games {
		game.Multimedia, err = s.GetGameMultimedia(ctx, tx, game.ID)
		if err != nil {
			return domain.PaginatedResponse[domain.Game]{}, err
		}

		game.Tags, err = s.GetGameTags(ctx, tx, game.ID)
		if err != nil {
			return domain.PaginatedResponse[domain.Game]{}, err
		}

		games[i] = game
	}

	return domain.PaginatedResponse[domain.Game]{
		Total:   total,
		Results: games,
	}, nil
}

// DeleteUserCartGame executes a query to delete the user cart game association with the specified identifiers.
func (s *store) DeleteUserCartGame(ctx context.Context, tx pgx.Tx, userID, gameID uuid.UUID) error {
	commandTag, err := tx.Exec(ctx, `
		DELETE FROM users_carts
		WHERE user_id = $1 AND game_id = $2
	`,
		userID,
		gameID,
	)
	if err != nil {
		return fmt.Errorf("%s: %w", descriptionFailedExec, err)
	}

	if commandTag.RowsAffected() == 0 {
		return fmt.Errorf("%s: %w", descriptionFailedExec, domain.ErrUserCartGameNotFound)
	}

	return nil
}

// PurchaseUserCart executes a query to delete all the user cart games and insert them in the user library with the
// specified identifier. It also stores an invoice for the purchased games.
func (s *store) PurchaseUserCart(ctx context.Context, tx pgx.Tx, userID uuid.UUID, tax float64) error {
	_, err := tx.Exec(ctx, `
		WITH purchasing_user AS (
			SELECT id, vatin
			FROM users
			WHERE id = $1
		), purchased_games AS (
			DELETE FROM users_carts
			WHERE user_id = (SELECT id FROM purchasing_user)
			RETURNING user_id, game_id
		), user_library AS (
			INSERT INTO users_libraries (user_id, game_id)
			SELECT user_id, game_id
			FROM purchased_games
		), invoice AS (
			INSERT INTO invoices (user_id, user_vatin)
			SELECT id, vatin
			FROM purchasing_user
			RETURNING id
		)
		INSERT INTO invoices_games (invoice_id, game_id, price, tax, publisher_vatin)
		SELECT 
			(SELECT id FROM invoice),
			game_id,
			(SELECT price FROM games WHERE id = game_id),
			$2,
			(SELECT vatin FROM publishers WHERE id = (SELECT publisher_id FROM games WHERE id = game_id))
		FROM purchased_games
	`,
		userID,
		tax,
	)
	if err != nil {
		switch constraintNameFromError(err) {
		case constraintUsersLibrariesPkey:
			return fmt.Errorf("%s: %w", descriptionFailedExec, domain.ErrUserLibraryGameAlreadyExists)
		case constraintUsersLibrariesUserIDFkey:
			return fmt.Errorf("%s: %w", descriptionFailedExec, domain.ErrUserNotFound)
		case constraintUsersLibrariesGameIDFkey:
			return fmt.Errorf("%s: %w", descriptionFailedExec, domain.ErrGameNotFound)
		}

		return fmt.Errorf("%s: %w", descriptionFailedExec, err)
	}

	return nil
}
