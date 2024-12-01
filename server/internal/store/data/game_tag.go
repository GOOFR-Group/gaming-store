package data

import (
	"context"
	"fmt"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"

	"github.com/goofr-group/gaming-store/server/internal/domain"
)

// GetGameTags executes a query to return the tags associated with the game with the specified identifier.
func (s *store) GetGameTags(ctx context.Context, tx pgx.Tx, id uuid.UUID) ([]domain.Tag, error) {
	rows, err := tx.Query(ctx, `
		SELECT t.id, t.name, t.description, t.created_at, t.modified_at
		FROM tags t
		INNER JOIN games_tags gt
			ON gt.tag_id = t.id
		INNER JOIN games g
			ON g.id = gt.game_id
		WHERE g.id = $1
		ORDER BY t.name ASC
	`,
		id,
	)
	if err != nil {
		return nil, fmt.Errorf("%s: %w", descriptionFailedQuery, err)
	}
	defer rows.Close()

	tags, err := getTagsFromRows(rows)
	if err != nil {
		return nil, fmt.Errorf("%s: %w", descriptionFailedScanRows, err)
	}

	return tags, nil
}
