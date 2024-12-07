package http

import (
	"encoding/json"
	"io"
	"net/http"

	"github.com/goofr-group/gaming-store/server/api"
	"github.com/goofr-group/gaming-store/server/internal/domain"
	"github.com/goofr-group/gaming-store/server/internal/logging"
)

const (
	codeMultimediaNotFound     = "multimedia_not_found"
	codeMultimediaFileTooLarge = "multimedia_file_too_large"

	errMultimediaNotFound     = "multimedia not found"
	errMultimediaFileTooLarge = "multimedia file too large"
)

// UploadMultimedia handles the http request to upload multimedia.
func (h *handler) UploadMultimedia(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	file, fileHeader, err := r.FormFile(domain.FieldKeyFile)
	if err != nil {
		badRequest(w, codeRequestBodyInvalid, errRequestBodyInvalid)
		return
	}
	defer file.Close()

	limitReader := io.LimitReader(file, domain.MultimediaFileMaxSize+1)

	fileData, err := io.ReadAll(limitReader)
	if err != nil {
		badRequest(w, codeRequestBodyInvalid, errRequestBodyInvalid)
		return
	}

	if len(fileData) > domain.MultimediaFileMaxSize {
		requestEntityTooLarge(w, codeMultimediaFileTooLarge, errMultimediaFileTooLarge)
		return
	}

	contentType := fileHeader.Header.Get(requestHeaderKeyContentType)

	domainMultimedia, err := h.service.UploadMultimedia(ctx, fileData, contentType)
	if err != nil {
		internalServerError(w)
		return
	}

	multimedia := multimediaFromDomain(domainMultimedia)

	responseBody, err := json.Marshal(multimedia)
	if err != nil {
		logging.Logger.ErrorContext(ctx, descriptionFailedToMarshalResponseBody, logging.Error(err))
		internalServerError(w)

		return
	}

	writeResponseJSON(w, http.StatusOK, responseBody)
}

// multimediaFromDomain returns a standardized multimedia based on the domain model.
func multimediaFromDomain(multimedia domain.Multimedia) api.Multimedia {
	return api.Multimedia{
		Id:        multimedia.ID,
		Checksum:  int64(multimedia.Checksum),
		MediaType: multimedia.MediaType,
		Url:       multimedia.URL,
		CreatedAt: multimedia.CreatedAt,
	}
}

// multimediaSliceFromDomain returns a standardized multimedia slice based on the domain model.
func multimediaSliceFromDomain(multimedia []domain.Multimedia) []api.Multimedia {
	m := make([]api.Multimedia, len(multimedia))

	for i := 0; i < len(multimedia); i++ {
		m[i] = multimediaFromDomain(multimedia[i])
	}

	return m
}

// optionalMultimediaFromDomain returns a standardized optional multimedia based on the domain model.
func optionalMultimediaFromDomain(multimedia *domain.Multimedia) *api.Multimedia {
	var m *api.Multimedia

	if multimedia != nil {
		temp := multimediaFromDomain(*multimedia)
		m = &temp
	}

	return m
}
