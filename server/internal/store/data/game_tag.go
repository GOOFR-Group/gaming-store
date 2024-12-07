package data

import (
	"context"
	"fmt"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"

	"github.com/goofr-group/gaming-store/server/internal/domain"
)

const (
	constraintGamesTagsPkey       = "games_tags_pkey"
	constraintGamesTagsGameIDFkey = "games_tags_game_id_fkey"
	constraintGamesTagsTagIDFkey  = "games_tags_tag_id_fkey"
)

// CreateGameTag executes a query to create a game tag association with the specified identifiers.
func (s *store) CreateGameTag(ctx context.Context, tx pgx.Tx, gameID, tagID uuid.UUID) error {
	_, err := tx.Exec(ctx, `
		INSERT INTO games_tags (game_id, tag_id)
		VALUES ($1, $2)
	`,
		gameID,
		tagID,
	)
	if err != nil {
		switch constraintNameFromError(err) {
		case constraintGamesTagsPkey:
			return fmt.Errorf("%s: %w", descriptionFailedExec, domain.ErrGameTagAlreadyExists)
		case constraintGamesTagsGameIDFkey:
			return fmt.Errorf("%s: %w", descriptionFailedExec, domain.ErrGameNotFound)
		case constraintGamesTagsTagIDFkey:
			return fmt.Errorf("%s: %w", descriptionFailedExec, domain.ErrTagNotFound)
		}

		return fmt.Errorf("%s: %w", descriptionFailedExec, err)
	}

	return nil
}

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

// DeleteGameTag executes a query to delete the game tag association with the specified identifiers.
func (s *store) DeleteGameTag(ctx context.Context, tx pgx.Tx, gameID, tagID uuid.UUID) error {
	commandTag, err := tx.Exec(ctx, `
		DELETE FROM games_tags
		WHERE game_id = $1 AND tag_id = $2
	`,
		gameID,
		tagID,
	)
	if err != nil {
		return fmt.Errorf("%s: %w", descriptionFailedExec, err)
	}

	if commandTag.RowsAffected() == 0 {
		return fmt.Errorf("%s: %w", descriptionFailedExec, domain.ErrGameTagNotFound)
	}

	return nil
}
