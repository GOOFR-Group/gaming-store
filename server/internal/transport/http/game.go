package http

import (
	"net/http"

	"github.com/goofr-group/gaming-store/server/api"
)

// CreateGame handles the http request to create a game.
func (h *handler) CreateGame(w http.ResponseWriter, r *http.Request, publisherID api.PublisherIdPathParam) {
	w.WriteHeader(http.StatusNotImplemented)
}

// GetGameByID handles the http request to get a game by ID.
func (h *handler) GetGameByID(w http.ResponseWriter, r *http.Request, publisherID api.PublisherIdPathParam, gameID api.GameIdPathParam) {
	w.WriteHeader(http.StatusNotImplemented)
}

// PatchGameByID handles the http request to modify a game by ID.
func (h *handler) PatchGameByID(w http.ResponseWriter, r *http.Request, publisherID api.PublisherIdPathParam, gameID api.GameIdPathParam) {
	w.WriteHeader(http.StatusNotImplemented)
}
