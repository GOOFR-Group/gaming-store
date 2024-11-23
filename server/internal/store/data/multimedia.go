package data

import (
	"context"
	"errors"
	"fmt"

	"github.com/goofr-group/gaming-store/server/internal/domain"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
)

// CreateMultimedia executes a query to create a multimedia with the specified data.
func (s *store) CreateMultimedia(ctx context.Context, tx pgx.Tx, multimedia domain.MultimediaObject) (uuid.UUID, error) {
	row := tx.QueryRow(ctx, `
		INSERT INTO multimedia (checksum, media_type, url)
		VALUES ($1, $2, $3) 
		RETURNING id
	`,
		multimedia.Checksum,
		multimedia.MediaType,
		multimedia.URL,
	)

	var id uuid.UUID

	err := row.Scan(&id)
	if err != nil {
		return uuid.UUID{}, fmt.Errorf("%s: %w", descriptionFailedScanRow, err)
	}

	return id, nil
}

// GetMultimediaByID executes a query to return the multimedia with the specified identifier.
func (s *store) GetMultimediaByID(ctx context.Context, tx pgx.Tx, id uuid.UUID) (domain.Multimedia, error) {
	row := tx.QueryRow(ctx, `
		SELECT id, checksum, media_type, url, created_at
		FROM multimedia 
		WHERE id = $1
	`,
		id,
	)

	multimedia, err := getMultimediaFromRow(row)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return domain.Multimedia{}, fmt.Errorf("%s: %w", descriptionFailedScanRow, domain.ErrMultimediaNotFound)
		}

		return domain.Multimedia{}, fmt.Errorf("%s: %w", descriptionFailedScanRow, err)
	}

	return multimedia, nil
}

// GetMultimediaByChecksumAndMediaType executes a query to return the multimedia with the specified checksum and media
// type.
func (s *store) GetMultimediaByChecksumAndMediaType(ctx context.Context, tx pgx.Tx, checksum uint32, mediaType string) (domain.Multimedia, error) {
	row := tx.QueryRow(ctx, `
		SELECT id, checksum, media_type, url, created_at
		FROM multimedia 
		WHERE checksum = $1 AND media_type = $2
	`,
		checksum,
		mediaType,
	)

	multimedia, err := getMultimediaFromRow(row)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return domain.Multimedia{}, fmt.Errorf("%s: %w", descriptionFailedScanRow, domain.ErrMultimediaNotFound)
		}

		return domain.Multimedia{}, fmt.Errorf("%s: %w", descriptionFailedScanRow, err)
	}

	return multimedia, nil
}

// getMultimediaFromRow returns the multimedia by scanning the given row.
func getMultimediaFromRow(row pgx.Row) (domain.Multimedia, error) {
	var multimedia domain.Multimedia

	err := row.Scan(
		&multimedia.ID,
		&multimedia.Checksum,
		&multimedia.MediaType,
		&multimedia.URL,
		&multimedia.CreatedAt,
	)
	if err != nil {
		return domain.Multimedia{}, err
	}

	return multimedia, nil
}
