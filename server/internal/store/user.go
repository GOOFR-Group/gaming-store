package store

import (
	"context"
	"errors"
	"fmt"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"golang.org/x/text/language"

	"github.com/goofr-group/gaming-store/server/internal/domain"
)

const (
	constraintUsersUsernameKey             = "users_username_key"
	constraintUsersEmailKey                = "users_email_key"
	constraintUsersVatinKey                = "users_vatin_key"
	constraintUsersPictureMultimediaIDFkey = "users_picture_multimedia_id_fkey"
)

// CreateUser executes a query to create a user with the specified data.
func (s *store) CreateUser(ctx context.Context, tx pgx.Tx, editableUser domain.EditableUserWithPassword) (uuid.UUID, error) {
	row := tx.QueryRow(ctx, `
		INSERT INTO users (username, email, password, display_name, date_of_birth, address, country, vatin, picture_multimedia_id)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
		RETURNING id
	`,
		editableUser.Username,
		editableUser.Email,
		editableUser.Password,
		editableUser.DisplayName,
		editableUser.DateOfBirth,
		editableUser.Address,
		editableUser.Country,
		editableUser.Vatin,
		editableUser.PictureMultimediaID,
	)

	var id uuid.UUID

	err := row.Scan(&id)
	if err != nil {
		switch constraintNameFromError(err) {
		case constraintUsersUsernameKey:
			return uuid.UUID{}, fmt.Errorf("%s: %w", descriptionFailedScanRow, domain.ErrUserUsernameAlreadyExists)
		case constraintUsersEmailKey:
			return uuid.UUID{}, fmt.Errorf("%s: %w", descriptionFailedScanRow, domain.ErrUserEmailAlreadyExists)
		case constraintUsersVatinKey:
			return uuid.UUID{}, fmt.Errorf("%s: %w", descriptionFailedScanRow, domain.ErrUserVatinAlreadyExists)
		case constraintUsersPictureMultimediaIDFkey:
			return uuid.UUID{}, fmt.Errorf("%s: %w", descriptionFailedScanRow, domain.ErrMultimediaNotFound)
		default:
			return uuid.UUID{}, fmt.Errorf("%s: %w", descriptionFailedScanRow, err)
		}
	}

	return id, nil
}

// GetUserByID executes a query to return the user with the specified identifier.
func (s *store) GetUserByID(ctx context.Context, tx pgx.Tx, id uuid.UUID) (domain.User, error) {
	row := tx.QueryRow(ctx, `
		SELECT id, username, email, display_name, date_of_birth, address, country, vatin, balance, picture_multimedia_id, created_at, modified_at 
		FROM users 
		WHERE id = $1 
	`,
		id,
	)

	user, err := getUserFromRow(row)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return domain.User{}, fmt.Errorf("%s: %w", descriptionFailedScanRow, domain.ErrUserNotFound)
		}

		return domain.User{}, fmt.Errorf("%s: %w", descriptionFailedScanRow, err)
	}

	return user, nil
}

// getUserFromRow returns the user by scanning the given row.
func getUserFromRow(row pgx.Row) (domain.User, error) {
	var (
		user    domain.User
		country string
	)

	err := row.Scan(
		&user.ID,
		&user.Username,
		&user.Email,
		&user.DisplayName,
		&user.DateOfBirth,
		&user.Address,
		&country,
		&user.Vatin,
		&user.Balance,
		&user.PictureMultimediaID,
		&user.CreatedAt,
		&user.ModifiedAt,
	)
	if err != nil {
		return domain.User{}, err
	}

	user.Country.Tag, err = language.Parse(country)
	if err != nil {
		return domain.User{}, fmt.Errorf("%s: %w", descriptionFailedParseLanguageTag, err)
	}

	return user, nil
}
