package data

import (
	"context"
	"fmt"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"

	"github.com/goofr-group/gaming-store/server/internal/domain"
)

// ListUserLibrary executes a query to return the user library for the specified filter.
func (s *store) ListUserLibrary(ctx context.Context, tx pgx.Tx, userID uuid.UUID, filter domain.UserLibraryPaginatedFilter) (domain.PaginatedResponse[domain.Game], error) {
	sqlWhere := "WHERE ul.user_id = $1"

	row := tx.QueryRow(ctx, `
		SELECT count(ul.game_id) 
		FROM users_libraries ul 
	`+sqlWhere,
		userID,
	)

	var total int

	err := row.Scan(&total)
	if err != nil {
		return domain.PaginatedResponse[domain.Game]{}, fmt.Errorf("%s: %w", descriptionFailedScanRow, err)
	}

	var domainSortField domain.UserLibraryPaginatedSort
	if filter.Sort != nil {
		domainSortField = filter.Sort.Field()
	}

	sortField := "g.title"

	switch domainSortField {
	case domain.UserLibraryPaginatedSortGameTitle:
		sortField = "g.title"
	case domain.UserLibraryPaginatedSortGamePrice:
		sortField = "g.price"
	case domain.UserLibraryPaginatedSortGameReleaseDate:
		sortField = "g.release_date"
	}

	rows, err := tx.Query(ctx, `
		SELECT g.id, g.title, g.price, g.is_active, g.release_date, g.description, g.age_rating, g.features, g.languages, g.requirements, g.created_at, g.modified_at,
			p.id, p.email, p.name, p.address, p.country, p.vatin, p.created_at, p.modified_at,
			pm.id, pm.checksum, pm.media_type, pm.url, pm.created_at,
			gpm.id, gpm.checksum, gpm.media_type, gpm.url, gpm.created_at,
			gdm.id, gdm.checksum, gdm.media_type, gdm.url, gdm.created_at
		FROM users_libraries ul
		INNER JOIN games g
			ON g.id = ul.game_id
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

// ExistsUserLibraryGame executes a query to return whether a game exists in a user library with the specified identifiers.
func (s *store) ExistsUserLibraryGame(ctx context.Context, tx pgx.Tx, userID, gameID uuid.UUID) (bool, error) {
	row := tx.QueryRow(ctx, `
		SELECT EXISTS (
			SELECT 1 
			FROM users_libraries
			WHERE user_id = $1 AND game_id = $2
		)
	`,
		userID,
		gameID,
	)

	var ok bool

	err := row.Scan(&ok)
	if err != nil {
		return false, fmt.Errorf("%s: %w", descriptionFailedScanRow, err)
	}

	return ok, nil
}
