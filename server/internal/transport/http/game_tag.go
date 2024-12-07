package http

import (
	"errors"
	"net/http"

	"github.com/goofr-group/gaming-store/server/api"
	"github.com/goofr-group/gaming-store/server/internal/domain"
)

const (
	codeGameTagAlreadyExists = "game_tag_already_exists"
	codeGameTagNotFound      = "game_tag_not_found"

	errGameTagAlreadyExists = "game tag already exists"
	errGameTagNotFound      = "game tag association does not exist"
)

// CreateGameTag handles the http request to create a game tag association.
func (h *handler) CreateGameTag(w http.ResponseWriter, r *http.Request, publisherID api.PublisherIdPathParam, gameID api.GameIdPathParam, tagID api.TagIdPathParam) {
	ctx := r.Context()

	err := h.service.CreateGameTag(ctx, gameID, tagID)
	if err != nil {
		switch {
		case errors.Is(err, domain.ErrGameNotFound):
			notFound(w, codeGameNotFound, errGameNotFound)
		case errors.Is(err, domain.ErrTagNotFound):
			notFound(w, codeTagNotFound, errTagNotFound)
		case errors.Is(err, domain.ErrGameTagAlreadyExists):
			conflict(w, codeGameTagAlreadyExists, errGameTagAlreadyExists)
		default:
			internalServerError(w)
		}

		return
	}

	writeResponseJSON(w, http.StatusNoContent, nil)
}

// DeleteGameTag handles the http request to delete a game tag association.
func (h *handler) DeleteGameTag(w http.ResponseWriter, r *http.Request, publisherID api.PublisherIdPathParam, gameID api.GameIdPathParam, tagID api.TagIdPathParam) {
	ctx := r.Context()

	err := h.service.DeleteGameTag(ctx, gameID, tagID)
	if err != nil {
		switch {
		case errors.Is(err, domain.ErrGameTagNotFound):
			conflict(w, codeGameTagNotFound, errGameTagNotFound)
		default:
			internalServerError(w)
		}

		return
	}

	writeResponseJSON(w, http.StatusNoContent, nil)
}
