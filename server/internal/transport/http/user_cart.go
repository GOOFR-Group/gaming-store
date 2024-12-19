package http

import (
	"net/http"

	"github.com/goofr-group/gaming-store/server/api"
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
