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

// ListUserGames handles the http request to list user's game library.
func (h *handler) ListUserGames(w http.ResponseWriter, r *http.Request, userID api.UserIdPathParam, params api.ListUserGamesParams) {
	ctx := r.Context()

	domainUserLibraryGamesFilter := listUserGamesParamsToDomain(params)

	domainPaginatedGames, err := h.service.ListUserLibrary(ctx, userID, domainUserLibraryGamesFilter)
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

// listUserGamesParamsToDomain returns a domain user library paginated filter based on the standardized list user games
// parameters.
func listUserGamesParamsToDomain(params api.ListUserGamesParams) domain.UserLibraryPaginatedFilter {
	domainSort := domain.UserLibraryPaginatedSortGameTitle

	if params.Sort != nil {
		switch *params.Sort {
		case api.ListUserGamesParamsSortGameTitle:
			domainSort = domain.UserLibraryPaginatedSortGameTitle
		case api.ListUserGamesParamsSortGamePrice:
			domainSort = domain.UserLibraryPaginatedSortGamePrice
		case api.ListUserGamesParamsSortGameReleaseDate:
			domainSort = domain.UserLibraryPaginatedSortGameReleaseDate
		default:
			domainSort = domain.UserLibraryPaginatedSort(*params.Sort)
		}
	}

	return domain.UserLibraryPaginatedFilter{
		PaginatedRequest: paginatedRequestToDomain(
			domainSort,
			(*api.OrderQueryParam)(params.Order),
			params.Limit,
			params.Offset,
		),
	}
}
