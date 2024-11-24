package http

import (
	"net/http"

	"github.com/goofr-group/gaming-store/server/api"
)

// ListTags handles the http request to list tags.
func (h *handler) ListTags(w http.ResponseWriter, r *http.Request, params api.ListTagsParams) {
	w.WriteHeader(http.StatusNotImplemented)
}
