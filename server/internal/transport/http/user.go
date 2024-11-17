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
	codeUserUsernameAlreadyExists = "user_username_already_exists"
	codeUserEmailAlreadyExists    = "user_email_already_exists"
	codeUserVatinAlreadyExists    = "user_vatin_already_exists"

	errUserUsernameAlreadyExists = "username already exists"
	errUserEmailAlreadyExists    = "email already exists"
	errUserVatinAlreadyExists    = "vatin already exists"
)

// CreateUser handles the http request to create a user.
func (h *handler) CreateUser(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	requestBody, err := io.ReadAll(r.Body)
	if err != nil {
		badRequest(w, codeRequestBodyInvalid, errRequestBodyInvalid)
		return
	}

	var userPost api.UserPost

	err = json.Unmarshal(requestBody, &userPost)
	if err != nil {
		badRequest(w, codeRequestBodyInvalid, errRequestBodyInvalid)
		return
	}

	domainEditableUser, err := userPostToDomain(userPost)
	if err != nil {
		var domainErrFieldValueInvalid *domain.FieldValueInvalidError

		switch {
		case errors.As(err, &domainErrFieldValueInvalid):
			badRequest(w, codeFieldValueInvalid, fmt.Sprintf("%s: %s", errFieldValueInvalid, domainErrFieldValueInvalid.FieldName))
		default:
			internalServerError(w)
		}

		return
	}

	domainUser, err := h.service.CreateUser(ctx, domainEditableUser)
	if err != nil {
		var domainErrFieldValueInvalid *domain.FieldValueInvalidError

		switch {
		case errors.As(err, &domainErrFieldValueInvalid):
			badRequest(w, codeFieldValueInvalid, fmt.Sprintf("%s: %s", errFieldValueInvalid, domainErrFieldValueInvalid.FieldName))
		case errors.Is(err, domain.ErrUserUsernameAlreadyExists):
			conflict(w, codeUserUsernameAlreadyExists, errUserUsernameAlreadyExists)
		case errors.Is(err, domain.ErrUserEmailAlreadyExists):
			conflict(w, codeUserEmailAlreadyExists, errUserEmailAlreadyExists)
		case errors.Is(err, domain.ErrUserVatinAlreadyExists):
			conflict(w, codeUserVatinAlreadyExists, errUserVatinAlreadyExists)
		case errors.Is(err, domain.ErrMultimediaNotFound):
			conflict(w, codeMultimediaNotFound, errMultimediaNotFound)
		default:
			internalServerError(w)
		}

		return
	}

	user := userFromDomain(domainUser)

	responseBody, err := json.Marshal(user)
	if err != nil {
		logging.Logger.ErrorContext(ctx, descriptionFailedToMarshalResponseBody, logging.Error(err))
		internalServerError(w)

		return
	}

	writeResponseJSON(w, http.StatusCreated, responseBody)
}

// userPostToDomain returns a domain editable user with password based on the standardized user post.
func userPostToDomain(userPost api.UserPost) (domain.EditableUserWithPassword, error) {
	country, err := language.Parse(userPost.Country)
	if err != nil {
		return domain.EditableUserWithPassword{}, &domain.FieldValueInvalidError{FieldName: domain.FieldCountry}
	}

	return domain.EditableUserWithPassword{
		EditableUser: domain.EditableUser{
			Username:            domain.Username(userPost.Username),
			Email:               domain.Email(userPost.Email),
			DisplayName:         domain.Name(userPost.DisplayName),
			DateOfBirth:         userPost.DateOfBirth.Time,
			Address:             domain.Address(userPost.Address),
			Country:             domain.Country{Tag: country},
			Vatin:               domain.Vatin(userPost.Vatin),
			PictureMultimediaID: userPost.PictureMultimediaId,
		},
		Password: domain.Password(userPost.Password),
	}, nil
}

// userFromDomain returns a standardized user based on the domain model.
func userFromDomain(user domain.User) api.User {
	return api.User{
		Id:                  user.ID,
		Username:            string(user.Username),
		Email:               string(user.Email),
		DisplayName:         string(user.DisplayName),
		DateOfBirth:         dateFromTime(user.DateOfBirth),
		Address:             string(user.Address),
		Country:             user.Country.String(),
		Vatin:               string(user.Vatin),
		Balance:             user.Balance,
		PictureMultimediaId: user.PictureMultimediaID,
		CreatedAt:           user.CreatedAt,
		ModifiedAt:          user.ModifiedAt,
	}
}
