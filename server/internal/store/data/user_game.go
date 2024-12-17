package data

import (
	"context"
	"fmt"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"

	"github.com/goofr-group/gaming-store/server/internal/domain"
)

// ListUserLibraryGames executes a query to return the user library games for the specified filter.
func (s *store) ListUserLibraryGames(ctx context.Context, tx pgx.Tx, userID uuid.UUID, filter domain.UserLibraryGamesPaginatedFilter) (domain.PaginatedResponse[domain.Game], error) {
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

	var domainSortField domain.UserLibraryGamePaginatedSort
	if filter.Sort != nil {
		domainSortField = filter.Sort.Field()
	}

	sortField := "g.title"

	switch domainSortField {
	case domain.UserLibraryGamePaginatedSortGameTitle:
		sortField = "g.title"
	case domain.UserLibraryGamePaginatedSortGamePrice:
		sortField = "g.price"
	case domain.UserLibraryGamePaginatedSortGameReleaseDate:
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
