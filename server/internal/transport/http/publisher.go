package http

import (
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"

	"golang.org/x/text/language"

	"github.com/goofr-group/gaming-store/server/api"
	"github.com/goofr-group/gaming-store/server/internal/domain"
	"github.com/goofr-group/gaming-store/server/internal/logging"
)

const (
	codePublisherNotFound           = "publisher_not_found"
	codePublisherEmailAlreadyExists = "publisher_email_already_exists"
	codePublisherVatinAlreadyExists = "publisher_vatin_already_exists"

	errPublisherNotFound           = "publisher not found"
	errPublisherEmailAlreadyExists = "email already exists"
	errPublisherVatinAlreadyExists = "vatin already exists"
)

// CreatePublisher handles the http request to create a publisher.
func (h *handler) CreatePublisher(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	requestBody, err := io.ReadAll(r.Body)
	if err != nil {
		badRequest(w, codeRequestBodyInvalid, errRequestBodyInvalid)
		return
	}

	var publisherPost api.PublisherPost

	err = json.Unmarshal(requestBody, &publisherPost)
	if err != nil {
		badRequest(w, codeRequestBodyInvalid, errRequestBodyInvalid)
		return
	}

	domainEditablePublisher, err := publisherPostToDomain(publisherPost)
	if err != nil {
		var domainFieldValueInvalidError *domain.FieldValueInvalidError

		switch {
		case errors.As(err, &domainFieldValueInvalidError):
			badRequest(w, codeFieldValueInvalid, fmt.Sprintf("%s: %s", errFieldValueInvalid, domainFieldValueInvalidError.FieldName))
		default:
			internalServerError(w)
		}

		return
	}

	domainPublisher, err := h.service.CreatePublisher(ctx, domainEditablePublisher)
	if err != nil {
		var domainFieldValueInvalidError *domain.FieldValueInvalidError

		switch {
		case errors.As(err, &domainFieldValueInvalidError):
			badRequest(w, codeFieldValueInvalid, fmt.Sprintf("%s: %s", errFieldValueInvalid, domainFieldValueInvalidError.FieldName))
		case errors.Is(err, domain.ErrPublisherEmailAlreadyExists):
			conflict(w, codePublisherEmailAlreadyExists, errPublisherEmailAlreadyExists)
		case errors.Is(err, domain.ErrPublisherVatinAlreadyExists):
			conflict(w, codePublisherVatinAlreadyExists, errPublisherVatinAlreadyExists)
		case errors.Is(err, domain.ErrMultimediaNotFound):
			conflict(w, codeMultimediaNotFound, errMultimediaNotFound)
		default:
			internalServerError(w)
		}

		return
	}

	publisher := publisherFromDomain(domainPublisher)

	responseBody, err := json.Marshal(publisher)
	if err != nil {
		logging.Logger.ErrorContext(ctx, descriptionFailedToMarshalResponseBody, logging.Error(err))
		internalServerError(w)

		return
	}

	writeResponseJSON(w, http.StatusCreated, responseBody)
}

// GetPublisherByID handles the http request to get a publisher by ID.
func (h *handler) GetPublisherByID(w http.ResponseWriter, r *http.Request, publisherId api.PublisherIdPathParam) {
	ctx := r.Context()

	domainPublisher, err := h.service.GetPublisherByID(ctx, publisherId)
	if err != nil {
		switch {
		case errors.Is(err, domain.ErrPublisherNotFound):
			notFound(w, codePublisherNotFound, errPublisherNotFound)
		default:
			internalServerError(w)
		}

		return
	}

	publisher := publisherFromDomain(domainPublisher)

	responseBody, err := json.Marshal(publisher)
	if err != nil {
		logging.Logger.ErrorContext(ctx, descriptionFailedToMarshalResponseBody, logging.Error(err))
		internalServerError(w)

		return
	}

	writeResponseJSON(w, http.StatusOK, responseBody)
}

// PatchPublisherByID handles the http request to modify a publisher by ID.
func (h *handler) PatchPublisherByID(w http.ResponseWriter, r *http.Request, publisherID api.PublisherIdPathParam) {
	ctx := r.Context()

	requestBody, err := io.ReadAll(r.Body)
	if err != nil {
		badRequest(w, codeRequestBodyInvalid, errRequestBodyInvalid)
		return
	}

	var publisherPatch api.PublisherPatch

	err = json.Unmarshal(requestBody, &publisherPatch)
	if err != nil {
		badRequest(w, codeRequestBodyInvalid, errRequestBodyInvalid)
		return
	}

	domainEditablePublisher, err := publisherPatchToDomain(publisherPatch)
	if err != nil {
		var domainFieldValueInvalidError *domain.FieldValueInvalidError

		switch {
		case errors.As(err, &domainFieldValueInvalidError):
			badRequest(w, codeFieldValueInvalid, fmt.Sprintf("%s: %s", errFieldValueInvalid, domainFieldValueInvalidError.FieldName))
		default:
			internalServerError(w)
		}

		return
	}

	domainPublisher, err := h.service.PatchPublisher(ctx, publisherID, domainEditablePublisher)
	if err != nil {
		var domainFieldValueInvalidError *domain.FieldValueInvalidError

		switch {
		case errors.As(err, &domainFieldValueInvalidError):
			badRequest(w, codeFieldValueInvalid, fmt.Sprintf("%s: %s", errFieldValueInvalid, domainFieldValueInvalidError.FieldName))
		case errors.Is(err, domain.ErrPublisherNotFound):
			notFound(w, codePublisherNotFound, errPublisherNotFound)
		case errors.Is(err, domain.ErrPublisherEmailAlreadyExists):
			conflict(w, codePublisherEmailAlreadyExists, errPublisherEmailAlreadyExists)
		case errors.Is(err, domain.ErrPublisherVatinAlreadyExists):
			conflict(w, codePublisherVatinAlreadyExists, errPublisherVatinAlreadyExists)
		case errors.Is(err, domain.ErrMultimediaNotFound):
			conflict(w, codeMultimediaNotFound, errMultimediaNotFound)
		default:
			internalServerError(w)
		}

		return
	}

	publisher := publisherFromDomain(domainPublisher)

	responseBody, err := json.Marshal(publisher)
	if err != nil {
		logging.Logger.ErrorContext(ctx, descriptionFailedToMarshalResponseBody, logging.Error(err))
		internalServerError(w)

		return
	}

	writeResponseJSON(w, http.StatusOK, responseBody)
}

// SignInPublisher handles the http request to sign in a publisher.
func (h *handler) SignInPublisher(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	requestBody, err := io.ReadAll(r.Body)
	if err != nil {
		badRequest(w, codeRequestBodyInvalid, errRequestBodyInvalid)
		return
	}

	var signIn api.SignInPublisher

	err = json.Unmarshal(requestBody, &signIn)
	if err != nil {
		badRequest(w, codeRequestBodyInvalid, errRequestBodyInvalid)
		return
	}

	var email domain.Email
	if signIn.Email != nil {
		email = domain.Email(*signIn.Email)
	}

	token, err := h.service.SignInPublisher(ctx, email, domain.Password(signIn.Password))
	if err != nil {
		switch {
		case errors.Is(err, domain.ErrCredentialsIncorrect):
			unauthorized(w, codeCredentialsIncorrect, errCredentialsIncorrect)
		default:
			internalServerError(w)
		}

		return
	}

	jwt := jwtFromJWTToken(token)

	responseBody, err := json.Marshal(jwt)
	if err != nil {
		logging.Logger.ErrorContext(ctx, descriptionFailedToMarshalResponseBody, logging.Error(err))
		internalServerError(w)

		return
	}

	writeResponseJSON(w, http.StatusOK, responseBody)
}

// publisherPostToDomain returns a domain editable publisher with password based on the standardized publisher post.
func publisherPostToDomain(publisherPost api.PublisherPost) (domain.EditablePublisherWithPassword, error) {
	country, err := language.Parse(publisherPost.Country)
	if err != nil {
		return domain.EditablePublisherWithPassword{}, &domain.FieldValueInvalidError{FieldName: domain.FieldCountry}
	}

	return domain.EditablePublisherWithPassword{
		EditablePublisher: domain.EditablePublisher{
			Email:               domain.Email(publisherPost.Email),
			Name:                domain.Name(publisherPost.Name),
			Address:             domain.Address(publisherPost.Address),
			Country:             domain.Country{Tag: country},
			Vatin:               domain.Vatin(publisherPost.Vatin),
			PictureMultimediaID: publisherPost.PictureMultimediaId,
		},
		Password: domain.Password(publisherPost.Password),
	}, nil
}

// publisherPatchToDomain returns a domain patchable publisher based on the standardized publisher patch.
func publisherPatchToDomain(publisherPatch api.PublisherPatch) (domain.EditablePublisherPatch, error) {

	var country *domain.Country

	if publisherPatch.Country != nil {
		temp, err := language.Parse(*publisherPatch.Country)
		if err != nil {
			return domain.EditablePublisherPatch{}, &domain.FieldValueInvalidError{FieldName: domain.FieldCountry}
		}

		country = &domain.Country{Tag: temp}
	}

	return domain.EditablePublisherPatch{
		Email:               (*domain.Email)(publisherPatch.Email),
		Name:                (*domain.Name)(publisherPatch.name),
		Address:             (*domain.Address)(publisherPatch.Address),
		Country:             country,
		Vatin:               (*domain.Vatin)(publisherPatch.Vatin),
		PictureMultimediaID: publisherPatch.PictureMultimediaId,
	}, nil
}

// publisherFromDomain returns a standardized publisher based on the domain model.
func publisherFromDomain(publisher domain.Publisher) api.Publisher {
	return api.Publisher{
		Id:                  publisher.ID,
		Email:               string(publisher.Email),
		Name:                string(publisher.Name),
		Address:             string(publisher.Address),
		Country:             publisher.Country.String(),
		Vatin:               string(publisher.Vatin),
		PictureMultimediaId: publisher.PictureMultimediaID,
		CreatedAt:           publisher.CreatedAt,
		ModifiedAt:          publisher.ModifiedAt,
	}
}
