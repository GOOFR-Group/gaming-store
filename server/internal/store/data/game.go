package data

import (
	"context"
	"errors"
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"

	"github.com/goofr-group/gaming-store/server/internal/domain"
)

const (
	constraintGamesPublisherIDFkey          = "games_publisher_id_fkey"
	constraintGamesPreviewMultimediaIDFkey  = "games_preview_multimedia_id_fkey"
	constraintGamesDownloadMultimediaIDFkey = "games_download_multimedia_id_fkey"
)

// CreateGame executes a query to create a game with the specified data.
func (s *store) CreateGame(ctx context.Context, tx pgx.Tx, publisherID uuid.UUID, editableGame domain.EditableGame) (uuid.UUID, error) {
	row := tx.QueryRow(ctx, `
		INSERT INTO games (publisher_id, title, price, is_active, release_date, description, age_rating, features, languages, requirements, preview_multimedia_id, download_multimedia_id)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
		RETURNING id
	`,
		publisherID,
		editableGame.Title,
		editableGame.Price,
		editableGame.IsActive,
		editableGame.ReleaseDate,
		editableGame.Description,
		editableGame.AgeRating,
		editableGame.Features,
		editableGame.Languages,
		editableGame.Requirements,
		editableGame.PreviewMultimediaID,
		editableGame.DownloadMultimediaID,
	)

	var id uuid.UUID

	err := row.Scan(&id)
	if err != nil {
		switch constraintNameFromError(err) {
		case constraintGamesPublisherIDFkey:
			return uuid.UUID{}, fmt.Errorf("%s: %w", descriptionFailedScanRow, domain.ErrPublisherNotFound)
		case constraintGamesPreviewMultimediaIDFkey:
			return uuid.UUID{}, fmt.Errorf("%s: %w", descriptionFailedScanRow, domain.ErrGamePreviewMultimediaNotFound)
		case constraintGamesDownloadMultimediaIDFkey:
			return uuid.UUID{}, fmt.Errorf("%s: %w", descriptionFailedScanRow, domain.ErrGameDownloadMultimediaNotFound)
		default:
			return uuid.UUID{}, fmt.Errorf("%s: %w", descriptionFailedScanRow, err)
		}
	}

	return id, nil
}

// GetGameByID executes a query to return the game with the specified identifier.
func (s *store) GetGameByID(ctx context.Context, tx pgx.Tx, id uuid.UUID) (domain.Game, error) {
	row := tx.QueryRow(ctx, `
		SELECT g.id, g.title, g.price, g.is_active, g.release_date, g.description, g.age_rating, g.features, g.languages, g.requirements, g.created_at, g.modified_at,
			p.id, p.email, p.name, p.address, p.country, p.vatin, p.created_at, p.modified_at,
			pm.id, pm.checksum, pm.media_type, pm.url, pm.created_at,
			gpm.id, gpm.checksum, gpm.media_type, gpm.url, gpm.created_at,
			gdm.id, gdm.checksum, gdm.media_type, gdm.url, gdm.created_at
		FROM games g
		INNER JOIN publishers p
			ON p.id = g.publisher_id
		LEFT JOIN multimedia pm
			ON pm.id = p.picture_multimedia_id
		INNER JOIN multimedia gpm
			ON gpm.id = g.preview_multimedia_id
		LEFT JOIN multimedia gdm
			ON gdm.id = g.download_multimedia_id
		WHERE g.id = $1
	`,
		id,
	)

	game, err := getGameFromRow(row)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return domain.Game{}, fmt.Errorf("%s: %w", descriptionFailedScanRow, domain.ErrGameNotFound)
		}

		return domain.Game{}, fmt.Errorf("%s: %w", descriptionFailedScanRow, err)
	}

	game.Multimedia, err = s.GetGameMultimedia(ctx, tx, id)
	if err != nil {
		return domain.Game{}, err
	}

	game.Tags, err = s.GetGameTags(ctx, tx, id)
	if err != nil {
		return domain.Game{}, err
	}

	return game, nil
}

// PatchGame executes a query to patch a game with the specified identifier and data.
func (s *store) PatchGame(ctx context.Context, tx pgx.Tx, id uuid.UUID, editableGame domain.EditableGamePatch) error {
	commandTag, err := tx.Exec(ctx, `
		UPDATE games SET
			title = coalesce($2, title),
			price = coalesce($3, price),
			is_active = coalesce($4, is_active),
			release_date = coalesce($5, release_date),
			description = coalesce($6, description),
			age_rating = coalesce($7, age_rating),
			features = coalesce($8, features),
			languages = coalesce($9, languages),
			requirements = coalesce($10, requirements),
			preview_multimedia_id = coalesce($11, preview_multimedia_id),
			download_multimedia_id = coalesce($12, download_multimedia_id)
		WHERE id = $1
	`,
		id,
		editableGame.Title,
		editableGame.Price,
		editableGame.IsActive,
		editableGame.ReleaseDate,
		editableGame.Description,
		editableGame.AgeRating,
		editableGame.Features,
		editableGame.Languages,
		editableGame.Requirements,
		editableGame.PreviewMultimediaID,
		editableGame.DownloadMultimediaID,
	)
	if err != nil {
		switch constraintNameFromError(err) {
		case constraintGamesPreviewMultimediaIDFkey:
			return fmt.Errorf("%s: %w", descriptionFailedExec, domain.ErrGamePreviewMultimediaNotFound)
		case constraintGamesDownloadMultimediaIDFkey:
			return fmt.Errorf("%s: %w", descriptionFailedExec, domain.ErrGameDownloadMultimediaNotFound)
		default:
			return fmt.Errorf("%s: %w", descriptionFailedExec, err)
		}
	}

	if commandTag.RowsAffected() == 0 {
		return fmt.Errorf("%s: %w", descriptionFailedExec, domain.ErrGameNotFound)
	}

	return nil
}

// getGameFromRow returns the game by scanning the given row.
func getGameFromRow(row pgx.Row) (domain.Game, error) {
	var (
		game domain.Game

		publisherPictureMultimediaID        *uuid.UUID
		publisherPictureMultimediaChecksum  *uint32
		publisherPictureMultimediaMediaType *string
		publisherPictureMultimediaURL       *string
		publisherPictureMultimediaCreatedAt *time.Time

		gameDownloadMultimediaID        *uuid.UUID
		gameDownloadMultimediaChecksum  *uint32
		gameDownloadMultimediaMediaType *string
		gameDownloadMultimediaURL       *string
		gameDownloadMultimediaCreatedAt *time.Time
	)

	err := row.Scan(
		&game.ID,
		&game.Title,
		&game.Price,
		&game.IsActive,
		&game.ReleaseDate,
		&game.Description,
		&game.AgeRating,
		&game.Features,
		&game.Languages,
		&game.Requirements,
		&game.CreatedAt,
		&game.ModifiedAt,

		&game.Publisher.ID,
		&game.Publisher.Email,
		&game.Publisher.Name,
		&game.Publisher.Address,
		&game.Publisher.Country,
		&game.Publisher.Vatin,
		&game.Publisher.CreatedAt,
		&game.Publisher.ModifiedAt,

		&publisherPictureMultimediaID,
		&publisherPictureMultimediaChecksum,
		&publisherPictureMultimediaMediaType,
		&publisherPictureMultimediaURL,
		&publisherPictureMultimediaCreatedAt,

		&game.PreviewMultimedia.ID,
		&game.PreviewMultimedia.Checksum,
		&game.PreviewMultimedia.MediaType,
		&game.PreviewMultimedia.URL,
		&game.PreviewMultimedia.CreatedAt,

		&gameDownloadMultimediaID,
		&gameDownloadMultimediaChecksum,
		&gameDownloadMultimediaMediaType,
		&gameDownloadMultimediaURL,
		&gameDownloadMultimediaCreatedAt,
	)
	if err != nil {
		return domain.Game{}, err
	}

	if publisherPictureMultimediaID != nil {
		game.Publisher.PictureMultimedia = &domain.Multimedia{
			MultimediaObject: domain.MultimediaObject{
				Checksum:  *publisherPictureMultimediaChecksum,
				MediaType: *publisherPictureMultimediaMediaType,
				URL:       *publisherPictureMultimediaURL,
			},
			ID:        *publisherPictureMultimediaID,
			CreatedAt: *publisherPictureMultimediaCreatedAt,
		}
	}

	if gameDownloadMultimediaID != nil {
		game.DownloadMultimedia = &domain.Multimedia{
			MultimediaObject: domain.MultimediaObject{
				Checksum:  *gameDownloadMultimediaChecksum,
				MediaType: *gameDownloadMultimediaMediaType,
				URL:       *gameDownloadMultimediaURL,
			},
			ID:        *gameDownloadMultimediaID,
			CreatedAt: *gameDownloadMultimediaCreatedAt,
		}
	}

	return game, nil
}