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

	domainEditableUser, err := userPostToDomain(userPost)
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

	domainEditableUser, err := userPatchToDomain(userPatch)
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

// ListUserGames handles the http request to list user's game library.
func (h *handler) ListUserGames(w http.ResponseWriter, r *http.Request, userID api.UserIdPathParam, params api.ListUserGamesParams) {
	ctx := r.Context()

	domainUserGamesLibraryFilter := listUserGamesParamsToDomain(params)

	domainPaginatedGames, err := h.service.ListUserGamesLibrary(ctx, userID, domainUserGamesLibraryFilter)
	if err != nil {
		var domainFilterValueInvalidError *domain.FilterValueInvalidError

		switch {
		case errors.As(err, &domainFilterValueInvalidError):
			badRequest(w, codeFilterValueInvalid, fmt.Sprintf("%s: %s", errFilterValueInvalid, domainFilterValueInvalidError.FilterName))
		default:
			internalServerError(w)
		}

		return
	}

	gamesPaginated := gamesPaginatedFromDomain(domainPaginatedGames)

	responseBody, err := json.Marshal(gamesPaginated)
	if err != nil {
		logging.Logger.ErrorContext(ctx, descriptionFailedToMarshalResponseBody, logging.Error(err))
		internalServerError(w)

		return
	}

	writeResponseJSON(w, http.StatusOK, responseBody)
}

// userPostToDomain returns a domain editable user with password based on the standardized user post.
func userPostToDomain(userPost api.UserPost) (domain.EditableUserWithPassword, error) {
	country, err := countryToDomain(userPost.Country)
	if err != nil {
		return domain.EditableUserWithPassword{}, err
	}

	return domain.EditableUserWithPassword{
		EditableUser: domain.EditableUser{
			Username:            domain.Username(userPost.Username),
			Email:               domain.Email(userPost.Email),
			DisplayName:         domain.Name(userPost.DisplayName),
			DateOfBirth:         domain.UserDateOfBirth(userPost.DateOfBirth.Time),
			Address:             domain.Address(userPost.Address),
			Country:             country,
			Vatin:               domain.Vatin(userPost.Vatin),
			PictureMultimediaID: userPost.PictureMultimediaId,
		},
		Password: domain.Password(userPost.Password),
	}, nil
}

// userPatchToDomain returns a domain patchable user based on the standardized user patch.
func userPatchToDomain(userPatch api.UserPatch) (domain.EditableUserPatch, error) {
	var country *domain.Country

	if userPatch.Country != nil {
		temp, err := countryToDomain(*userPatch.Country)
		if err != nil {
			return domain.EditableUserPatch{}, err
		}

		country = &temp
	}

	return domain.EditableUserPatch{
		Username:            (*domain.Username)(userPatch.Username),
		Email:               (*domain.Email)(userPatch.Email),
		DisplayName:         (*domain.Name)(userPatch.DisplayName),
		DateOfBirth:         (*domain.UserDateOfBirth)(optionalDateToOptionalTime(userPatch.DateOfBirth)),
		Address:             (*domain.Address)(userPatch.Address),
		Country:             country,
		Vatin:               (*domain.Vatin)(userPatch.Vatin),
		Balance:             userPatch.Balance,
		PictureMultimediaID: userPatch.PictureMultimediaId,
	}, nil
}

// userFromDomain returns a standardized user based on the domain model.
func userFromDomain(user domain.User) api.User {
	return api.User{
		Id:                user.ID,
		Username:          string(user.Username),
		Email:             string(user.Email),
		DisplayName:       string(user.DisplayName),
		DateOfBirth:       dateFromTime(user.DateOfBirth.Time()),
		Address:           string(user.Address),
		Country:           user.Country.String(),
		Vatin:             string(user.Vatin),
		Balance:           user.Balance,
		PictureMultimedia: optionalMultimediaFromDomain(user.PictureMultimedia),
		CreatedAt:         user.CreatedAt,
		ModifiedAt:        user.ModifiedAt,
	}
}

// listUserGamesParamsToDomain returns a domain user games library paginated filter based on the standardized list user
// games parameters.
func listUserGamesParamsToDomain(params api.ListUserGamesParams) domain.UserGamesLibraryPaginatedFilter {
	domainSort := domain.UserGameLibraryPaginatedSortGameTitle

	if params.Sort != nil {
		switch *params.Sort {
		case api.ListUserGamesParamsSortGameTitle:
			domainSort = domain.UserGameLibraryPaginatedSortGameTitle
		case api.ListUserGamesParamsSortGamePrice:
			domainSort = domain.UserGameLibraryPaginatedSortGamePrice
		case api.ListUserGamesParamsSortGameReleaseDate:
			domainSort = domain.UserGameLibraryPaginatedSortGameReleaseDate
		default:
			domainSort = domain.UserGameLibraryPaginatedSort(*params.Sort)
		}
	}

	return domain.UserGamesLibraryPaginatedFilter{
		PaginatedRequest: paginatedRequestToDomain(
			domainSort,
			(*api.OrderQueryParam)(params.Order),
			params.Limit,
			params.Offset,
		),
	}
}
