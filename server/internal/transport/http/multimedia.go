package http

import "net/http"

const (
	codeMultimediaNotFound = "multimedia_not_found"

	errMultimediaNotFound = "multimedia not found"
)

// UploadMultimedia handles the http request to upload multimedia.
func (h *handler) UploadMultimedia(w http.ResponseWriter, r *http.Request) {
	w.WriteHeader(http.StatusNotImplemented)
}
