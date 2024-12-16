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
	constraintPublishersEmailKey                = "publishers_email_key"
	constraintPublishersVatinKey                = "publishers_vatin_key"
	constraintPublishersPictureMultimediaIDFkey = "publishers_picture_multimedia_id_fkey"
)

// CreatePublisher executes a query to create a publisher with the specified data.
func (s *store) CreatePublisher(ctx context.Context, tx pgx.Tx, editablePublisher domain.EditablePublisherWithPassword) (uuid.UUID, error) {
	row := tx.QueryRow(ctx, `
		INSERT INTO publishers (email, password, name, address, country, vatin, picture_multimedia_id)
		VALUES ($1, $2, $3, $4, $5, $6, $7) 
		RETURNING id
	`,
		editablePublisher.Email,
		editablePublisher.Password,
		editablePublisher.Name,
		editablePublisher.Address,
		editablePublisher.Country,
		editablePublisher.Vatin,
		editablePublisher.PictureMultimediaID,
	)

	var id uuid.UUID

	err := row.Scan(&id)
	if err != nil {
		switch constraintNameFromError(err) {
		case constraintPublishersEmailKey:
			return uuid.UUID{}, fmt.Errorf("%s: %w", descriptionFailedScanRow, domain.ErrPublisherEmailAlreadyExists)
		case constraintPublishersVatinKey:
			return uuid.UUID{}, fmt.Errorf("%s: %w", descriptionFailedScanRow, domain.ErrPublisherVatinAlreadyExists)
		case constraintPublishersPictureMultimediaIDFkey:
			return uuid.UUID{}, fmt.Errorf("%s: %w", descriptionFailedScanRow, domain.ErrMultimediaNotFound)
		default:
			return uuid.UUID{}, fmt.Errorf("%s: %w", descriptionFailedScanRow, err)
		}
	}

	return id, nil
}

// GetPublisherByID executes a query to return the publisher with the specified identifier.
func (s *store) GetPublisherByID(ctx context.Context, tx pgx.Tx, id uuid.UUID) (domain.Publisher, error) {
	row := tx.QueryRow(ctx, `
		SELECT p.id, p.email, p.name, p.address, p.country, p.vatin, p.created_at, p.modified_at,
			m.id, m.checksum, m.media_type, m.url, m.created_at 
		FROM publishers p
		LEFT JOIN multimedia m
			ON m.id = p.picture_multimedia_id
		WHERE p.id = $1 
	`,
		id,
	)

	publisher, err := getPublisherFromRow(row)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return domain.Publisher{}, fmt.Errorf("%s: %w", descriptionFailedScanRow, domain.ErrPublisherNotFound)
		}

		return domain.Publisher{}, fmt.Errorf("%s: %w", descriptionFailedScanRow, err)
	}

	return publisher, nil
}

// GetPublisherByEmail executes a query to return the publisher with the specified email.
func (s *store) GetPublisherByEmail(ctx context.Context, tx pgx.Tx, email domain.Email) (domain.Publisher, error) {
	row := tx.QueryRow(ctx, `
		SELECT p.id, p.email, p.name, p.address, p.country, p.vatin, p.created_at, p.modified_at,
			m.id, m.checksum, m.media_type, m.url, m.created_at
		FROM publishers p
		LEFT JOIN multimedia m
			ON m.id = p.picture_multimedia_id
		WHERE p.email = $1 
	`,
		email,
	)

	publisher, err := getPublisherFromRow(row)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return domain.Publisher{}, fmt.Errorf("%s: %w", descriptionFailedScanRow, domain.ErrPublisherNotFound)
		}

		return domain.Publisher{}, fmt.Errorf("%s: %w", descriptionFailedScanRow, err)
	}

	return publisher, nil
}

// GetPublisherSignIn executes a query to return the sign-in of the publisher with the specified email.
func (s *store) GetPublisherSignIn(ctx context.Context, tx pgx.Tx, email domain.Email) (domain.SignInPublisher, error) {
	row := tx.QueryRow(ctx, `
		SELECT email, password 
		FROM publishers 
		WHERE email = $1
		LIMIT 1
	`,
		email,
	)

	var signIn domain.SignInPublisher

	err := row.Scan(
		&signIn.Email,
		&signIn.Password,
	)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return domain.SignInPublisher{}, fmt.Errorf("%s: %w", descriptionFailedScanRow, domain.ErrPublisherNotFound)
		}

		return domain.SignInPublisher{}, fmt.Errorf("%s: %w", descriptionFailedScanRow, err)
	}

	return signIn, nil
}

// PatchPublisher executes a query to patch a publisher with the specified identifier and data.
func (s *store) PatchPublisher(ctx context.Context, tx pgx.Tx, id uuid.UUID, editablePublisher domain.EditablePublisherPatch) error {
	commandTag, err := tx.Exec(ctx, `
		UPDATE publishers SET
			email = coalesce($2, email),
			name = coalesce($3, name),
			address = coalesce($4, address),
			country = coalesce($5, country),
			vatin = coalesce($6, vatin),
			picture_multimedia_id = coalesce($7, picture_multimedia_id)
		WHERE id = $1
	`,
		id,
		editablePublisher.Email,
		editablePublisher.Name,
		editablePublisher.Address,
		editablePublisher.Country,
		editablePublisher.Vatin,
		editablePublisher.PictureMultimediaID,
	)
	if err != nil {
		switch constraintNameFromError(err) {
		case constraintPublishersEmailKey:
			return fmt.Errorf("%s: %w", descriptionFailedExec, domain.ErrPublisherEmailAlreadyExists)
		case constraintPublishersVatinKey:
			return fmt.Errorf("%s: %w", descriptionFailedExec, domain.ErrPublisherVatinAlreadyExists)
		case constraintPublishersPictureMultimediaIDFkey:
			return fmt.Errorf("%s: %w", descriptionFailedExec, domain.ErrMultimediaNotFound)
		default:
			return fmt.Errorf("%s: %w", descriptionFailedExec, err)
		}
	}

	if commandTag.RowsAffected() == 0 {
		return fmt.Errorf("%s: %w", descriptionFailedExec, domain.ErrPublisherNotFound)
	}

	return nil
}

// getPublisherFromRow returns the publisher by scanning the given row.
func getPublisherFromRow(row pgx.Row) (domain.Publisher, error) {
	var (
		publisher domain.Publisher

		pictureMultimediaID        *uuid.UUID
		pictureMultimediaChecksum  *uint32
		pictureMultimediaMediaType *string
		pictureMultimediaURL       *string
		pictureMultimediaCreatedAt *time.Time
	)

	err := row.Scan(
		&publisher.ID,
		&publisher.Email,
		&publisher.Name,
		&publisher.Address,
		&publisher.Country,
		&publisher.Vatin,
		&publisher.CreatedAt,
		&publisher.ModifiedAt,

		&pictureMultimediaID,
		&pictureMultimediaChecksum,
		&pictureMultimediaMediaType,
		&pictureMultimediaURL,
		&pictureMultimediaCreatedAt,
	)
	if err != nil {
		return domain.Publisher{}, err
	}

	if pictureMultimediaID != nil {
		publisher.PictureMultimedia = &domain.Multimedia{
			MultimediaObject: domain.MultimediaObject{
				Checksum:  *pictureMultimediaChecksum,
				MediaType: *pictureMultimediaMediaType,
				URL:       *pictureMultimediaURL,
			},
			ID:        *pictureMultimediaID,
			CreatedAt: *pictureMultimediaCreatedAt,
		}
	}

	return publisher, nil
}
