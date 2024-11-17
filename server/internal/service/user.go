package service

import (
	"context"
	"errors"
	"log/slog"
	"strings"

	"github.com/jackc/pgx/v5"

	"github.com/goofr-group/gaming-store/server/internal/domain"
	"github.com/goofr-group/gaming-store/server/internal/logging"
)

const (
	descriptionFailedCreateUser         = "service: failed to create user"
	descriptionFailedListUsers          = "service: failed to list users"
	descriptionFailedGetUserByID        = "service: failed to get user by id"
	descriptionFailedGetUserByUsername  = "service: failed to get user by username"
	descriptionFailedGetUserSignIn      = "service: failed to get user sign-in"
	descriptionFailedPatchUser          = "service: failed to patch user"
	descriptionFailedUpdateUserPassword = "service: failed to update user password"
	descriptionFailedDeleteUserByID     = "service: failed to delete user by id"
)

// CreateUser creates a new user with the specified data.
func (s *service) CreateUser(ctx context.Context, editableUser domain.EditableUserWithPassword) (domain.User, error) {
	logAttrs := []any{
		slog.String(logging.ServiceMethod, "CreateUser"),
		slog.String(logging.UserUsername, string(editableUser.Username)),
		slog.String(logging.UserEmail, string(editableUser.Email)),
		slog.String(logging.UserDisplayName, string(editableUser.DisplayName)),
		slog.Time(logging.UserDateOfBirth, editableUser.DateOfBirth),
		slog.String(logging.UserAddress, string(editableUser.Address)),
		slog.String(logging.UserCountry, editableUser.Country.String()),
		slog.String(logging.UserVatin, string(editableUser.Vatin)),
	}

	editableUser.Username = domain.Username(replaceSpacesWithHyphen(string(editableUser.Username)))
	editableUser.Username = domain.Username(strings.ToLower(string(editableUser.Username)))
	editableUser.Email = domain.Email(strings.ToLower(string(editableUser.Email)))
	editableUser.DisplayName = domain.Name(removeExtraSpaces(string(editableUser.DisplayName)))
	editableUser.Address = domain.Address(removeExtraSpaces(string(editableUser.Address)))

	if !editableUser.Username.Valid() {
		return domain.User{}, logInfoAndWrapError(ctx, &domain.FieldValueInvalidError{FieldName: domain.FieldUsername}, descriptionInvalidFieldValue, logAttrs...)
	}

	if !editableUser.Email.Valid() {
		return domain.User{}, logInfoAndWrapError(ctx, &domain.FieldValueInvalidError{FieldName: domain.FieldEmail}, descriptionInvalidFieldValue, logAttrs...)
	}

	if !s.authnService.ValidPassword([]byte(editableUser.Password)) {
		return domain.User{}, logInfoAndWrapError(ctx, &domain.FieldValueInvalidError{FieldName: domain.FieldPassword}, descriptionInvalidFieldValue, logAttrs...)
	}

	if !editableUser.DisplayName.Valid() {
		return domain.User{}, logInfoAndWrapError(ctx, &domain.FieldValueInvalidError{FieldName: domain.FieldDisplayName}, descriptionInvalidFieldValue, logAttrs...)
	}

	if !editableUser.Address.Valid() {
		return domain.User{}, logInfoAndWrapError(ctx, &domain.FieldValueInvalidError{FieldName: domain.FieldAddress}, descriptionInvalidFieldValue, logAttrs...)
	}

	if !editableUser.Country.Valid() {
		return domain.User{}, logInfoAndWrapError(ctx, &domain.FieldValueInvalidError{FieldName: domain.FieldCountry}, descriptionInvalidFieldValue, logAttrs...)
	}

	if !editableUser.Vatin.Valid() {
		return domain.User{}, logInfoAndWrapError(ctx, &domain.FieldValueInvalidError{FieldName: domain.FieldVatin}, descriptionInvalidFieldValue, logAttrs...)
	}

	hashedPassword, err := s.authnService.HashPassword([]byte(editableUser.Password))
	if err != nil {
		return domain.User{}, logAndWrapError(ctx, err, descriptionFailedHashPassword, logAttrs...)
	}

	editableUser.Password = domain.Password(hashedPassword)

	var user domain.User

	err = s.readWriteTx(ctx, func(tx pgx.Tx) error {
		id, err := s.store.CreateUser(ctx, tx, editableUser)
		if err != nil {
			return err
		}

		user, err = s.store.GetUserByID(ctx, tx, id)
		if err != nil {
			return err
		}

		return nil
	})
	if err != nil {
		switch {
		case errors.Is(err, domain.ErrUserUsernameAlreadyExists),
			errors.Is(err, domain.ErrUserEmailAlreadyExists),
			errors.Is(err, domain.ErrUserVatinAlreadyExists),
			errors.Is(err, domain.ErrMultimediaNotFound):
			return domain.User{}, logInfoAndWrapError(ctx, err, descriptionFailedCreateUser, logAttrs...)
		default:
			return domain.User{}, logAndWrapError(ctx, err, descriptionFailedCreateUser, logAttrs...)
		}
	}

	return user, nil
}
