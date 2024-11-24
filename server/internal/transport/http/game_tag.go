package http

import (
	"net/http"

	"github.com/goofr-group/gaming-store/server/api"
)

// CreateGameTag handles the http request to create a game tag association.
func (h *handler) CreateGameTag(w http.ResponseWriter, r *http.Request, publisherID api.PublisherIdPathParam, gameID api.GameIdPathParam, tagID api.TagIdPathParam) {
	w.WriteHeader(http.StatusNotImplemented)
}

// ListGameTags handles the http request to list game tags.
func (h *handler) ListGameTags(w http.ResponseWriter, r *http.Request, publisherID api.PublisherIdPathParam, gameID api.GameIdPathParam, params api.ListGameTagsParams) {
	w.WriteHeader(http.StatusNotImplemented)
}

// DeleteGameTag handles the http request to delete a game tag association.
func (h *handler) DeleteGameTag(w http.ResponseWriter, r *http.Request, publisherID api.PublisherIdPathParam, gameID api.GameIdPathParam, tagID api.TagIdPathParam) {
	w.WriteHeader(http.StatusNotImplemented)
}
