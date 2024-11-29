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
	descriptionFailedCreatePublisher     = "service: failed to create publisher"
	descriptionFailedGetPublisherByID    = "service: failed to get publisher by id"
	descriptionFailedGetPublisherByEmail = "service: failed to get publisher by email"
	descriptionFailedGetPublisherSignIn  = "service: failed to get publisher sign-in"
)

// CreatePublisher creates a new publisher with the specified data.
func (s *service) CreatePublisher(ctx context.Context, editablePublisher domain.EditablePublisherWithPassword) (domain.Publisher, error) {
	logAttrs := []any{
		slog.String(logging.ServiceMethod, "CreatePublisher"),
		slog.String(logging.PublisherEmail, string(editablePublisher.Email)),
		slog.String(logging.PublisherName, string(editablePublisher.Name)),
		slog.String(logging.PublisherAddress, string(editablePublisher.Address)),
		slog.String(logging.PublisherCountry, string(editablePublisher.Country)),
		slog.String(logging.PublisherVatin, string(editablePublisher.Vatin)),
	}

	editablePublisher.Name = domain.Name(replaceSpacesWithHyphen(string(editablePublisher.Name)))
	editablePublisher.Name = domain.Name(strings.ToLower(string(editablePublisher.Name)))
	editablePublisher.Email = domain.Email(strings.ToLower(string(editablePublisher.Email)))
	editablePublisher.Name = domain.Name(removeExtraSpaces(string(editablePublisher.Name)))
	editablePublisher.Address = domain.Address(removeExtraSpaces(string(editablePublisher.Address)))

	if !editablePublisher.Email.Valid() {
		return domain.Publisher{}, logInfoAndWrapError(ctx, &domain.FieldValueInvalidError{FieldName: domain.FieldEmail}, descriptionInvalidFieldValue, logAttrs...)
	}

	if !s.authnService.ValidPassword([]byte(editablePublisher.Password)) {
		return domain.Publisher{}, logInfoAndWrapError(ctx, &domain.FieldValueInvalidError{FieldName: domain.FieldPassword}, descriptionInvalidFieldValue, logAttrs...)
	}

	if !editablePublisher.Name.Valid() {
		return domain.Publisher{}, logInfoAndWrapError(ctx, &domain.FieldValueInvalidError{FieldName: domain.FieldName}, descriptionInvalidFieldValue, logAttrs...)
	}

	if !editablePublisher.Address.Valid() {
		return domain.Publisher{}, logInfoAndWrapError(ctx, &domain.FieldValueInvalidError{FieldName: domain.FieldAddress}, descriptionInvalidFieldValue, logAttrs...)
	}

	if !editablePublisher.Country.Valid() {
		return domain.Publisher{}, logInfoAndWrapError(ctx, &domain.FieldValueInvalidError{FieldName: domain.FieldCountry}, descriptionInvalidFieldValue, logAttrs...)
	}

	if !editablePublisher.Vatin.Valid() {
		return domain.Publisher{}, logInfoAndWrapError(ctx, &domain.FieldValueInvalidError{FieldName: domain.FieldVatin}, descriptionInvalidFieldValue, logAttrs...)
	}

	hashedPassword, err := s.authnService.HashPassword([]byte(editablePublisher.Password))
	if err != nil {
		return domain.Publisher{}, logAndWrapError(ctx, err, descriptionFailedHashPassword, logAttrs...)
	}

	editablePublisher.Password = domain.Password(hashedPassword)

	var publisher domain.Publisher

	err = s.readWriteTx(ctx, func(tx pgx.Tx) error {
		id, err := s.dataStore.CreatePublisher(ctx, tx, editablePublisher)
		if err != nil {
			return err
		}

		publisher, err = s.dataStore.GetPublisherByID(ctx, tx, id)
		if err != nil {
			return err
		}

		return nil
	})
	if err != nil {
		switch {
		case errors.Is(err, domain.ErrPublisherEmailAlreadyExists),
			errors.Is(err, domain.ErrPublisherVatinAlreadyExists),
			errors.Is(err, domain.ErrMultimediaNotFound):
			return domain.Publisher{}, logInfoAndWrapError(ctx, err, descriptionFailedCreatePublisher, logAttrs...)
		default:
			return domain.Publisher{}, logAndWrapError(ctx, err, descriptionFailedCreatePublisher, logAttrs...)
		}
	}

	return publisher, nil
}

// GetPublisherByID returns the publisher with the specified identifier.
func (s *service) GetPublisherByID(ctx context.Context, id uuid.UUID) (domain.Publisher, error) {
	logAttrs := []any{
		slog.String(logging.ServiceMethod, "GetPublisherByID"),
		slog.String(logging.PublisherID, id.String()),
	}

	var (
		publisher domain.Publisher
		err       error
	)

	err = s.readOnlyTx(ctx, func(tx pgx.Tx) error {
		publisher, err = s.dataStore.GetPublisherByID(ctx, tx, id)
		return err
	})
	if err != nil {
		switch {
		case errors.Is(err, domain.ErrPublisherNotFound):
			return domain.Publisher{}, logInfoAndWrapError(ctx, err, descriptionFailedGetPublisherByID, logAttrs...)
		default:
			return domain.Publisher{}, logAndWrapError(ctx, err, descriptionFailedGetPublisherByID, logAttrs...)
		}
	}

	return publisher, nil
}

// PatchUser modifies the user with the specified identifier.
func (s *service) PatchPublisher(ctx context.Context, id uuid.UUID, editablePublisher domain.EditablePublisherPatch) (domain.Publisher, error) {
	logAttrs := []any{
		slog.String(logging.ServiceMethod, "PatchUser"),
		slog.String(logging.UserID, id.String()),
	}

	if editablePublisher.Name != nil {
		name := domain.Name(replaceSpacesWithHyphen(string(*editablePublisher.Name)))
		name = domain.Name(strings.ToLower(string(name)))
		editablePublisher.Name = &name
	}

	if editablePublisher.Email != nil {
		email := domain.Email(strings.ToLower(string(*editablePublisher.Email)))
		editablePublisher.Email = &email
	}

	if editablePublisher.Address != nil {
		address := domain.Address(removeExtraSpaces(string(*editablePublisher.Address)))
		editablePublisher.Address = &address
	}

	if editablePublisher.Name != nil && !editablePublisher.Name.Valid() {
		return domain.Publisher{}, logInfoAndWrapError(ctx, &domain.FieldValueInvalidError{FieldName: domain.FieldUsername}, descriptionInvalidFieldValue, logAttrs...)
	}

	if editablePublisher.Email != nil && !editablePublisher.Email.Valid() {
		return domain.Publisher{}, logInfoAndWrapError(ctx, &domain.FieldValueInvalidError{FieldName: domain.FieldEmail}, descriptionInvalidFieldValue, logAttrs...)
	}

	if editablePublisher.Address != nil && !editablePublisher.Address.Valid() {
		return domain.Publisher{}, logInfoAndWrapError(ctx, &domain.FieldValueInvalidError{FieldName: domain.FieldAddress}, descriptionInvalidFieldValue, logAttrs...)
	}

	if editablePublisher.Country != nil && !editablePublisher.Country.Valid() {
		return domain.Publisher{}, logInfoAndWrapError(ctx, &domain.FieldValueInvalidError{FieldName: domain.FieldCountry}, descriptionInvalidFieldValue, logAttrs...)
	}

	if editablePublisher.Vatin != nil && !editablePublisher.Vatin.Valid() {
		return domain.Publisher{}, logInfoAndWrapError(ctx, &domain.FieldValueInvalidError{FieldName: domain.FieldVatin}, descriptionInvalidFieldValue, logAttrs...)
	}

	var (
		publisher domain.Publisher
		err       error
	)

	err = s.readWriteTx(ctx, func(tx pgx.Tx) error {
		err = s.dataStore.PatchPublisher(ctx, tx, id, editablePublisher)
		if err != nil {
			return err
		}

		publisher, err = s.dataStore.GetPublisherByID(ctx, tx, id)
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
			return domain.Publisher{}, logInfoAndWrapError(ctx, err, descriptionFailedPatchUser, logAttrs...)
		default:
			return domain.Publisher{}, logAndWrapError(ctx, err, descriptionFailedPatchUser, logAttrs...)
		}
	}

	return publisher, nil
}

// SignInPublisher returns a JSON Web Token for the specified email and password.
func (s *service) SignInPublisher(ctx context.Context, email domain.Email, password domain.Password) (string, error) {
	logAttrs := []any{
		slog.String(logging.ServiceMethod, "SignInPublisher"),
		slog.String(logging.PublisherEmail, string(email)),
	}

	email = domain.Email(strings.ToLower(string(email)))

	var (
		signIn domain.SignIn
		err    error
	)

	err = s.readOnlyTx(ctx, func(tx pgx.Tx) error {
		signIn, err = s.dataStore.GetPublisherSignIn(ctx, tx, email)
		return err
	})
	if err != nil {
		switch {
		case errors.Is(err, domain.ErrPublisherNotFound):
			return "", logInfoAndWrapError(ctx, domain.ErrCredentialsIncorrect, descriptionFailedGetPublisherSignIn, logAttrs...)
		default:
			return "", logAndWrapError(ctx, err, descriptionFailedGetPublisherSignIn, logAttrs...)
		}
	}

	valid, err := s.authnService.CheckPasswordHash([]byte(password), []byte(signIn.Password))
	if err != nil {
		return "", logAndWrapError(ctx, err, descriptionFailedCheckPasswordHash, logAttrs...)
	}

	if !valid {
		return "", logInfoAndWrapError(ctx, domain.ErrCredentialsIncorrect, descriptionFailedCheckPasswordHash, logAttrs...)
	}

	var publisher domain.Publisher

	err = s.readOnlyTx(ctx, func(tx pgx.Tx) error {
		publisher, err = s.dataStore.GetPublisherByEmail(ctx, tx, signIn.Email)
		return err
	})
	if err != nil {
		return "", logAndWrapError(ctx, err, descriptionFailedGetPublisherByEmail, logAttrs...)
	}

	role := authn.SubjectRolePublisher

	token, err := s.authnService.NewJWT(publisher.ID.String(), []authn.SubjectRole{role})
	if err != nil {
		return "", logAndWrapError(ctx, err, descriptionFailedCreateJWT, logAttrs...)
	}

	return token, nil
}
