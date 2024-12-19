package service

import (
	"context"
	"errors"
	"log/slog"
	"strings"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"

	"github.com/goofr-group/gaming-store/server/internal/authn"
	"github.com/goofr-group/gaming-store/server/internal/domain"
	"github.com/goofr-group/gaming-store/server/internal/logging"
)

const (
	descriptionFailedCreateUser     = "service: failed to create user"
	descriptionFailedGetUserByID    = "service: failed to get user by id"
	descriptionFailedGetUserByEmail = "service: failed to get user by email"
	descriptionFailedGetUserSignIn  = "service: failed to get user sign-in"
	descriptionFailedPatchUser      = "service: failed to patch user"
)

// CreateUser creates a new user with the specified data.
func (s *service) CreateUser(ctx context.Context, editableUser domain.EditableUserWithPassword) (domain.User, error) {
	logAttrs := []any{
		slog.String(logging.ServiceMethod, "CreateUser"),
		slog.String(logging.UserUsername, string(editableUser.Username)),
		slog.String(logging.UserEmail, string(editableUser.Email)),
		slog.String(logging.UserDisplayName, string(editableUser.DisplayName)),
		slog.Time(logging.UserDateOfBirth, editableUser.DateOfBirth.Time()),
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

	if !editableUser.DateOfBirth.Valid() {
		return domain.User{}, logInfoAndWrapError(ctx, &domain.FieldValueInvalidError{FieldName: domain.FieldDateOfBirth}, descriptionInvalidFieldValue, logAttrs...)
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
		id, err := s.dataStore.CreateUser(ctx, tx, editableUser)
		if err != nil {
			return err
		}

		user, err = s.dataStore.GetUserByID(ctx, tx, id)
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

// GetUserByID returns the user with the specified identifier.
func (s *service) GetUserByID(ctx context.Context, id uuid.UUID) (domain.User, error) {
	logAttrs := []any{
		slog.String(logging.ServiceMethod, "GetUserByID"),
		slog.String(logging.UserID, id.String()),
	}

	var (
		user domain.User
		err  error
	)

	err = s.readOnlyTx(ctx, func(tx pgx.Tx) error {
		user, err = s.dataStore.GetUserByID(ctx, tx, id)
		return err
	})
	if err != nil {
		switch {
		case errors.Is(err, domain.ErrUserNotFound):
			return domain.User{}, logInfoAndWrapError(ctx, err, descriptionFailedGetUserByID, logAttrs...)
		default:
			return domain.User{}, logAndWrapError(ctx, err, descriptionFailedGetUserByID, logAttrs...)
		}
	}

	return user, nil
}

// PatchUser modifies the user with the specified identifier.
func (s *service) PatchUser(ctx context.Context, id uuid.UUID, editableUser domain.EditableUserPatch) (domain.User, error) {
	logAttrs := []any{
		slog.String(logging.ServiceMethod, "PatchUser"),
		slog.String(logging.UserID, id.String()),
	}

	if editableUser.Username != nil {
		username := domain.Username(replaceSpacesWithHyphen(string(*editableUser.Username)))
		username = domain.Username(strings.ToLower(string(username)))
		editableUser.Username = &username
	}

	if editableUser.Email != nil {
		email := domain.Email(strings.ToLower(string(*editableUser.Email)))
		editableUser.Email = &email
	}

	if editableUser.DisplayName != nil {
		displayName := domain.Name(removeExtraSpaces(string(*editableUser.DisplayName)))
		editableUser.DisplayName = &displayName
	}

	if editableUser.Address != nil {
		address := domain.Address(removeExtraSpaces(string(*editableUser.Address)))
		editableUser.Address = &address
	}

	if editableUser.Username != nil && !editableUser.Username.Valid() {
		return domain.User{}, logInfoAndWrapError(ctx, &domain.FieldValueInvalidError{FieldName: domain.FieldUsername}, descriptionInvalidFieldValue, logAttrs...)
	}

	if editableUser.Email != nil && !editableUser.Email.Valid() {
		return domain.User{}, logInfoAndWrapError(ctx, &domain.FieldValueInvalidError{FieldName: domain.FieldEmail}, descriptionInvalidFieldValue, logAttrs...)
	}

	if editableUser.DisplayName != nil && !editableUser.DisplayName.Valid() {
		return domain.User{}, logInfoAndWrapError(ctx, &domain.FieldValueInvalidError{FieldName: domain.FieldDisplayName}, descriptionInvalidFieldValue, logAttrs...)
	}

	if editableUser.DateOfBirth != nil && !editableUser.DateOfBirth.Valid() {
		return domain.User{}, logInfoAndWrapError(ctx, &domain.FieldValueInvalidError{FieldName: domain.FieldDateOfBirth}, descriptionInvalidFieldValue, logAttrs...)
	}

	if editableUser.Address != nil && !editableUser.Address.Valid() {
		return domain.User{}, logInfoAndWrapError(ctx, &domain.FieldValueInvalidError{FieldName: domain.FieldAddress}, descriptionInvalidFieldValue, logAttrs...)
	}

	if editableUser.Country != nil && !editableUser.Country.Valid() {
		return domain.User{}, logInfoAndWrapError(ctx, &domain.FieldValueInvalidError{FieldName: domain.FieldCountry}, descriptionInvalidFieldValue, logAttrs...)
	}

	if editableUser.Vatin != nil && !editableUser.Vatin.Valid() {
		return domain.User{}, logInfoAndWrapError(ctx, &domain.FieldValueInvalidError{FieldName: domain.FieldVatin}, descriptionInvalidFieldValue, logAttrs...)
	}

	var (
		user domain.User
		err  error
	)

	err = s.readWriteTx(ctx, func(tx pgx.Tx) error {
		err = s.dataStore.PatchUser(ctx, tx, id, editableUser)
		if err != nil {
			return err
		}

		user, err = s.dataStore.GetUserByID(ctx, tx, id)
		if err != nil {
			return err
		}

		return nil
	})
	if err != nil {
		switch {
		case errors.Is(err, domain.ErrUserNotFound),
			errors.Is(err, domain.ErrUserUsernameAlreadyExists),
			errors.Is(err, domain.ErrUserEmailAlreadyExists),
			errors.Is(err, domain.ErrUserVatinAlreadyExists),
			errors.Is(err, domain.ErrMultimediaNotFound):
			return domain.User{}, logInfoAndWrapError(ctx, err, descriptionFailedPatchUser, logAttrs...)
		default:
			return domain.User{}, logAndWrapError(ctx, err, descriptionFailedPatchUser, logAttrs...)
		}
	}

	return user, nil
}

// SignInUser returns a JSON Web Token for the specified username or email and password.
func (s *service) SignInUser(ctx context.Context, username domain.Username, email domain.Email, password domain.Password) (string, error) {
	logAttrs := []any{
		slog.String(logging.ServiceMethod, "SignInUser"),
		slog.String(logging.UserUsername, string(username)),
		slog.String(logging.UserEmail, string(email)),
	}

	username = domain.Username(strings.ToLower(string(username)))
	email = domain.Email(strings.ToLower(string(email)))

	var (
		signIn domain.SignInUser
		err    error
	)

	err = s.readOnlyTx(ctx, func(tx pgx.Tx) error {
		signIn, err = s.dataStore.GetUserSignIn(ctx, tx, username, email)
		return err
	})
	if err != nil {
		switch {
		case errors.Is(err, domain.ErrUserNotFound):
			return "", logInfoAndWrapError(ctx, domain.ErrCredentialsIncorrect, descriptionFailedGetUserSignIn, logAttrs...)
		default:
			return "", logAndWrapError(ctx, err, descriptionFailedGetUserSignIn, logAttrs...)
		}
	}

	valid, err := s.authnService.CheckPasswordHash([]byte(password), []byte(signIn.Password))
	if err != nil {
		return "", logAndWrapError(ctx, err, descriptionFailedCheckPasswordHash, logAttrs...)
	}

	if !valid {
		return "", logInfoAndWrapError(ctx, domain.ErrCredentialsIncorrect, descriptionFailedCheckPasswordHash, logAttrs...)
	}

	var user domain.User

	err = s.readOnlyTx(ctx, func(tx pgx.Tx) error {
		user, err = s.dataStore.GetUserByEmail(ctx, tx, signIn.Email)
		return err
	})
	if err != nil {
		return "", logAndWrapError(ctx, err, descriptionFailedGetUserByEmail, logAttrs...)
	}

	role := authn.SubjectRoleUser

	token, err := s.authnService.NewJWT(user.ID.String(), []authn.SubjectRole{role})
	if err != nil {
		return "", logAndWrapError(ctx, err, descriptionFailedCreateJWT, logAttrs...)
	}

	return token, nil
}
