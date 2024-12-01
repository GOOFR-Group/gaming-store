package data

import (
	"context"
	"fmt"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"

	"github.com/goofr-group/gaming-store/server/internal/domain"
)

// GetGameMultimedia executes a query to return the multimedia associated with the game with the specified identifier.
func (s *store) GetGameMultimedia(ctx context.Context, tx pgx.Tx, id uuid.UUID) ([]domain.Multimedia, error) {
	rows, err := tx.Query(ctx, `
		SELECT m.id, m.checksum, m.media_type, m.url, m.created_at
		FROM multimedia m
		INNER JOIN games_multimedia gm
			ON gm.multimedia_id = m.id
		INNER JOIN games g
			ON g.id = gm.game_id
		WHERE g.id = $1
		ORDER BY gm.position ASC
	`,
		id,
	)
	if err != nil {
		return nil, fmt.Errorf("%s: %w", descriptionFailedQuery, err)
	}
	defer rows.Close()

	multimedia, err := getMultimediaFromRows(rows)
	if err != nil {
		return nil, fmt.Errorf("%s: %w", descriptionFailedScanRows, err)
	}

	return multimedia, nil
}
