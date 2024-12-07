package http

import (
	"encoding/json"
	"errors"
	"io"
	"net/http"

	"github.com/goofr-group/gaming-store/server/api"
	"github.com/goofr-group/gaming-store/server/internal/domain"
)

const (
	codeGameMultimediaAlreadyExists         = "game_multimedia_already_exists"
	codeGameMultimediaNotFound              = "game_multimedia_not_found"
	codeGameMultimediaPositionAlreadyExists = "game_multimedia_position_already_exists"

	errGameMultimediaAlreadyExists         = "game multimedia already exists"
	errGameMultimediaNotFound              = "game multimedia association does not exist"
	errGameMultimediaPositionAlreadyExists = "game multimedia position already exists"
)

// CreateGameMultimedia handles the http request to create a game multimedia association.
func (h *handler) CreateGameMultimedia(w http.ResponseWriter, r *http.Request, publisherID api.PublisherIdPathParam, gameID api.GameIdPathParam, multimediaID api.MultimediaIdPathParam) {
	ctx := r.Context()

	requestBody, err := io.ReadAll(r.Body)
	if err != nil {
		badRequest(w, codeRequestBodyInvalid, errRequestBodyInvalid)
		return
	}

	var gameMultimediaPost api.GameMultimediaPost

	err = json.Unmarshal(requestBody, &gameMultimediaPost)
	if err != nil {
		badRequest(w, codeRequestBodyInvalid, errRequestBodyInvalid)
		return
	}

	domainEditableGameMultimedia := gameMultimediaPostToDomain(gameMultimediaPost)

	err = h.service.CreateGameMultimedia(ctx, gameID, multimediaID, domainEditableGameMultimedia)
	if err != nil {
		switch {
		case errors.Is(err, domain.ErrGameNotFound):
			notFound(w, codeGameNotFound, errGameNotFound)
		case errors.Is(err, domain.ErrMultimediaNotFound):
			notFound(w, codeMultimediaNotFound, errMultimediaNotFound)
		case errors.Is(err, domain.ErrGameMultimediaAlreadyExists):
			conflict(w, codeGameMultimediaAlreadyExists, errGameMultimediaAlreadyExists)
		case errors.Is(err, domain.ErrGameMultimediaPositionAlreadyExists):
			conflict(w, codeGameMultimediaPositionAlreadyExists, errGameMultimediaPositionAlreadyExists)
		default:
			internalServerError(w)
		}

		return
	}

	writeResponseJSON(w, http.StatusNoContent, nil)
}

// DeleteGameMultimedia handles the http request to delete a game multimedia association.
func (h *handler) DeleteGameMultimedia(w http.ResponseWriter, r *http.Request, publisherID api.PublisherIdPathParam, gameID api.GameIdPathParam, multimediaID api.MultimediaIdPathParam) {
	ctx := r.Context()

	err := h.service.DeleteGameMultimedia(ctx, gameID, multimediaID)
	if err != nil {
		switch {
		case errors.Is(err, domain.ErrGameMultimediaNotFound):
			conflict(w, codeGameMultimediaNotFound, errGameMultimediaNotFound)
		default:
			internalServerError(w)
		}

		return
	}

	writeResponseJSON(w, http.StatusNoContent, nil)
}

// gameMultimediaPostToDomain returns a domain editable game multimedia based on the standardized game multimedia post.
func gameMultimediaPostToDomain(gameMultimediaPost api.GameMultimediaPost) domain.EditableGameMultimedia {
	return domain.EditableGameMultimedia{
		Position: domain.GameMultimediaPosition(gameMultimediaPost.Position),
	}
}
