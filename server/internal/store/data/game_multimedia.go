package data

import (
	"context"
	"fmt"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"

	"github.com/goofr-group/gaming-store/server/internal/domain"
)

const (
	constraintGamesMultimediaPkey              = "games_multimedia_pkey"
	constraintGamesMultimediaGameIDFkey        = "games_multimedia_game_id_fkey"
	constraintGamesMultimediaMultimediaIDFkey  = "games_multimedia_multimedia_id_fkey"
	constraintGamesMultimediaGameIDPositionKey = "games_multimedia_game_id_position_key"
)

// CreateGameMultimedia executes a query to create a game multimedia association with the specified identifiers.
func (s *store) CreateGameMultimedia(ctx context.Context, tx pgx.Tx, gameID, multimediaID uuid.UUID, editableGameMultimedia domain.EditableGameMultimedia) error {
	_, err := tx.Exec(ctx, `
		INSERT INTO games_multimedia (game_id, multimedia_id, position)
		VALUES ($1, $2, $3)
	`,
		gameID,
		multimediaID,
		editableGameMultimedia.Position,
	)
	if err != nil {
		switch constraintNameFromError(err) {
		case constraintGamesMultimediaPkey:
			return fmt.Errorf("%s: %w", descriptionFailedExec, domain.ErrGameMultimediaAlreadyExists)
		case constraintGamesMultimediaGameIDFkey:
			return fmt.Errorf("%s: %w", descriptionFailedExec, domain.ErrGameNotFound)
		case constraintGamesMultimediaMultimediaIDFkey:
			return fmt.Errorf("%s: %w", descriptionFailedExec, domain.ErrMultimediaNotFound)
		case constraintGamesMultimediaGameIDPositionKey:
			return fmt.Errorf("%s: %w", descriptionFailedExec, domain.ErrGameMultimediaPositionAlreadyExists)
		}

		return fmt.Errorf("%s: %w", descriptionFailedExec, err)
	}

	return nil
}

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

// DeleteGameMultimedia executes a query to delete the game multimedia association with the specified identifiers.
func (s *store) DeleteGameMultimedia(ctx context.Context, tx pgx.Tx, gameID, multimediaID uuid.UUID) error {
	commandTag, err := tx.Exec(ctx, `
		DELETE FROM games_multimedia
		WHERE game_id = $1 AND multimedia_id = $2
	`,
		gameID,
		multimediaID,
	)
	if err != nil {
		return fmt.Errorf("%s: %w", descriptionFailedExec, err)
	}

	if commandTag.RowsAffected() == 0 {
		return fmt.Errorf("%s: %w", descriptionFailedExec, domain.ErrGameMultimediaNotFound)
	}

	return nil
}
