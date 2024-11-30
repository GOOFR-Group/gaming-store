package http

import (
	"net/http"

	"github.com/goofr-group/gaming-store/server/api"
)

// CreateGameMultimedia handles the http request to create a game multimedia association.
func (h *handler) CreateGameMultimedia(w http.ResponseWriter, r *http.Request, publisherID api.PublisherIdPathParam, gameID api.GameIdPathParam, multimediaID api.MultimediaIdPathParam) {
	w.WriteHeader(http.StatusNotImplemented)
}

// DeleteGameMultimedia handles the http request to delete a game multimedia association.
func (h *handler) DeleteGameMultimedia(w http.ResponseWriter, r *http.Request, publisherID api.PublisherIdPathParam, gameID api.GameIdPathParam, multimediaID api.MultimediaIdPathParam) {
	w.WriteHeader(http.StatusNotImplemented)
}
