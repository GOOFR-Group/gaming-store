package http

import (
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"time"

	"github.com/goofr-group/gaming-store/server/api"
	"github.com/goofr-group/gaming-store/server/internal/domain"
	"github.com/goofr-group/gaming-store/server/internal/logging"
)

const (
	codeUserNotFound              = "user_not_found"
	codeUserUsernameAlreadyExists = "user_username_already_exists"
	codeUserEmailAlreadyExists    = "user_email_already_exists"
	codeUserVatinAlreadyExists    = "user_vatin_already_exists"

	errUserNotFound              = "user not found"
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

	domainEditableUser := userPostToDomain(userPost)

	domainUser, err := h.service.CreateUser(ctx, domainEditableUser)
	if err != nil {
		var domainFieldValueInvalidError *domain.FieldValueInvalidError

		switch {
		case errors.As(err, &domainFieldValueInvalidError):
			badRequest(w, codeFieldValueInvalid, fmt.Sprintf("%s: %s", errFieldValueInvalid, domainFieldValueInvalidError.FieldName))
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

// GetUserByID handles the http request to get a user by ID.
func (h *handler) GetUserByID(w http.ResponseWriter, r *http.Request, userID api.UserIdPathParam) {
	ctx := r.Context()

	domainUser, err := h.service.GetUserByID(ctx, userID)
	if err != nil {
		switch {
		case errors.Is(err, domain.ErrUserNotFound):
			notFound(w, codeUserNotFound, errUserNotFound)
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

	writeResponseJSON(w, http.StatusOK, responseBody)
}

// PatchUserByID handles the http request to modify a user by ID.
func (h *handler) PatchUserByID(w http.ResponseWriter, r *http.Request, userID api.UserIdPathParam) {
	ctx := r.Context()

	requestBody, err := io.ReadAll(r.Body)
	if err != nil {
		badRequest(w, codeRequestBodyInvalid, errRequestBodyInvalid)
		return
	}

	var userPatch api.UserPatch

	err = json.Unmarshal(requestBody, &userPatch)
	if err != nil {
		badRequest(w, codeRequestBodyInvalid, errRequestBodyInvalid)
		return
	}

	domainEditableUser := userPatchToDomain(userPatch)

	domainUser, err := h.service.PatchUser(ctx, userID, domainEditableUser)
	if err != nil {
		var domainFieldValueInvalidError *domain.FieldValueInvalidError

		switch {
		case errors.As(err, &domainFieldValueInvalidError):
			badRequest(w, codeFieldValueInvalid, fmt.Sprintf("%s: %s", errFieldValueInvalid, domainFieldValueInvalidError.FieldName))
		case errors.Is(err, domain.ErrUserNotFound):
			notFound(w, codeUserNotFound, errUserNotFound)
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

	writeResponseJSON(w, http.StatusOK, responseBody)
}

// SignInUser handles the http request to sign in a user.
func (h *handler) SignInUser(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	requestBody, err := io.ReadAll(r.Body)
	if err != nil {
		badRequest(w, codeRequestBodyInvalid, errRequestBodyInvalid)
		return
	}

	var signIn api.UserSignIn

	err = json.Unmarshal(requestBody, &signIn)
	if err != nil {
		badRequest(w, codeRequestBodyInvalid, errRequestBodyInvalid)
		return
	}

	var username domain.Username
	if signIn.Username != nil {
		username = domain.Username(*signIn.Username)
	}

	var email domain.Email
	if signIn.Email != nil {
		email = domain.Email(*signIn.Email)
	}

	token, err := h.service.SignInUser(ctx, username, email, domain.Password(signIn.Password))
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

// userPostToDomain returns a domain editable user with password based on the standardized user post.
func userPostToDomain(userPost api.UserPost) domain.EditableUserWithPassword {
	return domain.EditableUserWithPassword{
		EditableUser: domain.EditableUser{
			Username:            domain.Username(userPost.Username),
			Email:               domain.Email(userPost.Email),
			DisplayName:         domain.Name(userPost.DisplayName),
			DateOfBirth:         userPost.DateOfBirth.Time,
			Address:             domain.Address(userPost.Address),
			Country:             domain.Country(userPost.Country),
			Vatin:               domain.Vatin(userPost.Vatin),
			PictureMultimediaID: userPost.PictureMultimediaId,
		},
		Password: domain.Password(userPost.Password),
	}
}

// userPatchToDomain returns a domain patchable user based on the standardized user patch.
func userPatchToDomain(userPatch api.UserPatch) domain.EditableUserPatch {
	var dateOfBirth *time.Time

	if userPatch.DateOfBirth != nil {
		temp := userPatch.DateOfBirth.Time
		dateOfBirth = &temp
	}

	return domain.EditableUserPatch{
		Username:            (*domain.Username)(userPatch.Username),
		Email:               (*domain.Email)(userPatch.Email),
		DisplayName:         (*domain.Name)(userPatch.DisplayName),
		DateOfBirth:         dateOfBirth,
		Address:             (*domain.Address)(userPatch.Address),
		Country:             (*domain.Country)(userPatch.Country),
		Vatin:               (*domain.Vatin)(userPatch.Vatin),
		Balance:             userPatch.Balance,
		PictureMultimediaID: userPatch.PictureMultimediaId,
	}
}

// userFromDomain returns a standardized user based on the domain model.
func userFromDomain(user domain.User) api.User {
	var pictureMultimedia *api.Multimedia

	if user.PictureMultimedia != nil {
		multimedia := multimediaFromDomain(*user.PictureMultimedia)
		pictureMultimedia = &multimedia
	}

	return api.User{
		Id:                user.ID,
		Username:          string(user.Username),
		Email:             string(user.Email),
		DisplayName:       string(user.DisplayName),
		DateOfBirth:       dateFromTime(user.DateOfBirth),
		Address:           string(user.Address),
		Country:           string(user.Country),
		Vatin:             string(user.Vatin),
		Balance:           user.Balance,
		PictureMultimedia: pictureMultimedia,
		CreatedAt:         user.CreatedAt,
		ModifiedAt:        user.ModifiedAt,
	}
}
