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

const (
	codeUserCartGameAlreadyExists = "user_cart_game_already_exists"
	codeUserCartGameNotFound      = "user_cart_game_not_found"
	codeUserCartEmpty             = "user_cart_empty"

	errUserCartGameAlreadyExists = "user cart game already exists"
	errUserCartGameNotFound      = "user cart game association does not exist"
	errUserCartEmpty             = "user cart empty"
)

// ListUserCartGames handles the http request to list user cart games.
func (h *handler) ListUserCartGames(w http.ResponseWriter, r *http.Request, userID api.UserIdPathParam, params api.ListUserCartGamesParams) {
	ctx := r.Context()

	domainUserCartGamesFilter := listUserCartGamesParamsToDomain(params)

	domainPaginatedGames, err := h.service.ListUserCart(ctx, userID, domainUserCartGamesFilter)
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

// CreateUserCartGame handles the http request to create a user cart game association.
func (h *handler) CreateUserCartGame(w http.ResponseWriter, r *http.Request, userID api.UserIdPathParam, gameID api.GameIdPathParam) {
	ctx := r.Context()

	err := h.service.CreateUserCartGame(ctx, userID, gameID)
	if err != nil {
		switch {
		case errors.Is(err, domain.ErrUserNotFound):
			notFound(w, codeUserNotFound, errUserNotFound)
		case errors.Is(err, domain.ErrGameNotFound):
			notFound(w, codeGameNotFound, errGameNotFound)
		case errors.Is(err, domain.ErrUserCartGameAlreadyExists):
			conflict(w, codeUserCartGameAlreadyExists, errUserCartGameAlreadyExists)
		case errors.Is(err, domain.ErrGameNotActive):
			conflict(w, codeGameNotActive, errGameNotActive)
		case errors.Is(err, domain.ErrGameNotReleased):
			conflict(w, codeGameNotReleased, errGameNotReleased)
		case errors.Is(err, domain.ErrUserNotOldEnough):
			conflict(w, codeUserNotOldEnough, errUserNotOldEnough)
		case errors.Is(err, domain.ErrUserLibraryGameAlreadyExists):
			conflict(w, codeUserLibraryGameAlreadyExists, errUserLibraryGameAlreadyExists)
		default:
			internalServerError(w)
		}

		return
	}

	writeResponseJSON(w, http.StatusNoContent, nil)
}

// DeleteUserCartGame handles the http request to delete a user cart game association.
func (h *handler) DeleteUserCartGame(w http.ResponseWriter, r *http.Request, userID api.UserIdPathParam, gameID api.GameIdPathParam) {
	ctx := r.Context()

	err := h.service.DeleteUserCartGame(ctx, userID, gameID)
	if err != nil {
		switch {
		case errors.Is(err, domain.ErrUserCartGameNotFound):
			conflict(w, codeUserCartGameNotFound, errUserCartGameNotFound)
		default:
			internalServerError(w)
		}

		return
	}

	writeResponseJSON(w, http.StatusNoContent, nil)
}

// PurchaseUserCart handles the http request to purchase a user cart.
func (h *handler) PurchaseUserCart(w http.ResponseWriter, r *http.Request, userID api.UserIdPathParam) {
	ctx := r.Context()

	err := h.service.PurchaseUserCart(ctx, userID)
	if err != nil {
		switch {
		case errors.Is(err, domain.ErrUserNotFound):
			notFound(w, codeUserNotFound, errUserNotFound)
		case errors.Is(err, domain.ErrUserCartEmpty):
			conflict(w, codeUserCartEmpty, errUserCartEmpty)
		case errors.Is(err, domain.ErrUserBalanceInsufficient):
			conflict(w, codeUserBalanceInsufficient, errUserBalanceInsufficient)
		default:
			internalServerError(w)
		}

		return
	}

	writeResponseJSON(w, http.StatusNoContent, nil)
}

// listUserCartGamesParamsToDomain returns a domain user car paginated filter based on the standardized list user cart
// games parameters.
func listUserCartGamesParamsToDomain(params api.ListUserCartGamesParams) domain.UserCartPaginatedFilter {
	domainSort := domain.UserCartPaginatedSortCreatedAt

	if params.Sort != nil {
		switch *params.Sort {
		case api.ListUserCartGamesParamsSortCreatedAt:
			domainSort = domain.UserCartPaginatedSortCreatedAt
		case api.ListUserCartGamesParamsSortGameTitle:
			domainSort = domain.UserCartPaginatedSortGameTitle
		default:
			domainSort = domain.UserCartPaginatedSort(*params.Sort)
		}
	}

	return domain.UserCartPaginatedFilter{
		PaginatedRequest: paginatedRequestToDomain(
			domainSort,
			(*api.OrderQueryParam)(params.Order),
			params.Limit,
			params.Offset,
		),
	}
}
