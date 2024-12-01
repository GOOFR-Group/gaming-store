package http

import (
	"net/http"

	"github.com/goofr-group/gaming-store/server/api"
	"github.com/goofr-group/gaming-store/server/internal/domain"
)

const (
	codeTagNotFound = "tag_not_found"

	errTagNotFound = "tag not found"
)

// ListTags handles the http request to list tags.
func (h *handler) ListTags(w http.ResponseWriter, r *http.Request, params api.ListTagsParams) {
	w.WriteHeader(http.StatusNotImplemented)
}

// tagFromDomain returns a standardized tag based on the domain model.
func tagFromDomain(tag domain.Tag) api.Tag {
	return api.Tag{
		Id:          tag.ID,
		Name:        string(tag.Name),
		Description: (*string)(tag.Description),
		CreatedAt:   tag.CreatedAt,
		ModifiedAt:  tag.ModifiedAt,
	}
}

// tagSliceFromDomain returns a standardized tag slice based on the domain model.
func tagSliceFromDomain(tags []domain.Tag) []api.Tag {
	t := make([]api.Tag, len(tags))

	for i := 0; i < len(tags); i++ {
		t[i] = tagFromDomain(tags[i])
	}

	return t
}
