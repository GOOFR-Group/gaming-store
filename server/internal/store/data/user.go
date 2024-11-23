package data

import (
	"context"
	"errors"
	"fmt"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"

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

// GetUserByEmail executes a query to return the user with the specified email.
func (s *store) GetUserByEmail(ctx context.Context, tx pgx.Tx, email domain.Email) (domain.User, error) {
	row := tx.QueryRow(ctx, `
		SELECT id, username, email, display_name, date_of_birth, address, country, vatin, balance, picture_multimedia_id, created_at, modified_at 
		FROM users 
		WHERE email = $1 
	`,
		email,
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

// GetUserSignIn executes a query to return the sign-in of the user with the specified username or email.
func (s *store) GetUserSignIn(ctx context.Context, tx pgx.Tx, username domain.Username, email domain.Email) (domain.SignIn, error) {
	row := tx.QueryRow(ctx, `
		SELECT username, email, password 
		FROM users 
		WHERE username = $1 OR email = $2
		LIMIT 1
	`,
		username,
		email,
	)

	var signIn domain.SignIn

	err := row.Scan(
		&signIn.Username,
		&signIn.Email,
		&signIn.Password,
	)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return domain.SignIn{}, fmt.Errorf("%s: %w", descriptionFailedScanRow, domain.ErrUserNotFound)
		}

		return domain.SignIn{}, fmt.Errorf("%s: %w", descriptionFailedScanRow, err)
	}

	return signIn, nil
}

// PatchUser executes a query to patch a user with the specified identifier and data.
func (s *store) PatchUser(ctx context.Context, tx pgx.Tx, id uuid.UUID, editableUser domain.EditableUserPatch) error {
	commandTag, err := tx.Exec(ctx, `
		UPDATE users SET
			username = coalesce($2, username),
			email = coalesce($3, email),
			display_name = coalesce($4, display_name),
			date_of_birth = coalesce($5, date_of_birth),
			address = coalesce($6, address),
			country = coalesce($7, country),
			vatin = coalesce($8, vatin),
			balance = coalesce($9, balance),
			picture_multimedia_id = coalesce($10, picture_multimedia_id)
		WHERE id = $1
	`,
		id,
		editableUser.Username,
		editableUser.Email,
		editableUser.DisplayName,
		editableUser.DateOfBirth,
		editableUser.Address,
		editableUser.Country,
		editableUser.Vatin,
		editableUser.Balance,
		editableUser.PictureMultimediaID,
	)
	if err != nil {
		switch constraintNameFromError(err) {
		case constraintUsersUsernameKey:
			return fmt.Errorf("%s: %w", descriptionFailedExec, domain.ErrUserUsernameAlreadyExists)
		case constraintUsersEmailKey:
			return fmt.Errorf("%s: %w", descriptionFailedExec, domain.ErrUserEmailAlreadyExists)
		case constraintUsersVatinKey:
			return fmt.Errorf("%s: %w", descriptionFailedExec, domain.ErrUserVatinAlreadyExists)
		case constraintUsersPictureMultimediaIDFkey:
			return fmt.Errorf("%s: %w", descriptionFailedExec, domain.ErrMultimediaNotFound)
		default:
			return fmt.Errorf("%s: %w", descriptionFailedExec, err)
		}
	}

	if commandTag.RowsAffected() == 0 {
		return fmt.Errorf("%s: %w", descriptionFailedExec, domain.ErrUserNotFound)
	}

	return nil
}

// getUserFromRow returns the user by scanning the given row.
func getUserFromRow(row pgx.Row) (domain.User, error) {
	var user domain.User

	err := row.Scan(
		&user.ID,
		&user.Username,
		&user.Email,
		&user.DisplayName,
		&user.DateOfBirth,
		&user.Address,
		&user.Country,
		&user.Vatin,
		&user.Balance,
		&user.PictureMultimediaID,
		&user.CreatedAt,
		&user.ModifiedAt,
	)
	if err != nil {
		return domain.User{}, err
	}

	return user, nil
}
