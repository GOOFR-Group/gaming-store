package http

import (
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"

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

	domainEditablePublisher := publisherPostToDomain(publisherPost)

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
func (h *handler) GetPublisherByID(w http.ResponseWriter, r *http.Request, publisherID api.PublisherIdPathParam) {
	ctx := r.Context()

	domainPublisher, err := h.service.GetPublisherByID(ctx, publisherID)
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

	domainEditablePublisher := publisherPatchToDomain(publisherPatch)

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

	var signIn api.PublisherSignIn

	err = json.Unmarshal(requestBody, &signIn)
	if err != nil {
		badRequest(w, codeRequestBodyInvalid, errRequestBodyInvalid)
		return
	}

	token, err := h.service.SignInPublisher(ctx, domain.Email(signIn.Email), domain.Password(signIn.Password))
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
func publisherPostToDomain(publisherPost api.PublisherPost) domain.EditablePublisherWithPassword {
	return domain.EditablePublisherWithPassword{
		EditablePublisher: domain.EditablePublisher{
			Email:               domain.Email(publisherPost.Email),
			Name:                domain.Name(publisherPost.Name),
			Address:             domain.Address(publisherPost.Address),
			Country:             domain.Country(publisherPost.Country),
			Vatin:               domain.Vatin(publisherPost.Vatin),
			PictureMultimediaID: publisherPost.PictureMultimediaId,
		},
		Password: domain.Password(publisherPost.Password),
	}
}

// publisherPatchToDomain returns a domain patchable publisher based on the standardized publisher patch.
func publisherPatchToDomain(publisherPatch api.PublisherPatch) domain.EditablePublisherPatch {
	return domain.EditablePublisherPatch{
		Email:               (*domain.Email)(publisherPatch.Email),
		Name:                (*domain.Name)(publisherPatch.Name),
		Address:             (*domain.Address)(publisherPatch.Address),
		Country:             (*domain.Country)(publisherPatch.Country),
		Vatin:               (*domain.Vatin)(publisherPatch.Vatin),
		PictureMultimediaID: publisherPatch.PictureMultimediaId,
	}
}

// publisherFromDomain returns a standardized publisher based on the domain model.
func publisherFromDomain(publisher domain.Publisher) api.Publisher {
	var pictureMultimedia *api.Multimedia

	if publisher.PictureMultimedia != nil {
		multimedia := multimediaFromDomain(*publisher.PictureMultimedia)
		pictureMultimedia = &multimedia
	}

	return api.Publisher{
		Id:                publisher.ID,
		Email:             string(publisher.Email),
		Name:              string(publisher.Name),
		Address:           string(publisher.Address),
		Country:           string(publisher.Country),
		Vatin:             string(publisher.Vatin),
		PictureMultimedia: pictureMultimedia,
		CreatedAt:         publisher.CreatedAt,
		ModifiedAt:        publisher.ModifiedAt,
	}
}
