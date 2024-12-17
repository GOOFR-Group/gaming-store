package http

import (
	"encoding/json"
	"errors"
	"fmt"
	"net/http"

	"github.com/goofr-group/gaming-store/server/api"
	"github.com/goofr-group/gaming-store/server/internal/domain"
	"github.com/goofr-group/gaming-store/server/internal/logging"
)

// ListUserCartGames handles the http request to list user cart games.
func (h *handler) ListUserCartGames(w http.ResponseWriter, r *http.Request, userID api.UserIdPathParam, params api.ListUserCartGamesParams) {
	w.WriteHeader(http.StatusNotImplemented)
}

// CreateUserCartGame handles the http request to create a user cart game association.
func (h *handler) CreateUserCartGame(w http.ResponseWriter, r *http.Request, userID api.UserIdPathParam, gameID api.GameIdPathParam) {
	w.WriteHeader(http.StatusNotImplemented)
}

// DeleteUserCartGame handles the http request to delete a user cart game association.
func (h *handler) DeleteUserCartGame(w http.ResponseWriter, r *http.Request, userID api.UserIdPathParam, gameID api.GameIdPathParam) {
	w.WriteHeader(http.StatusNotImplemented)
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
