package http

import (
	"encoding/json"
	"errors"
	"fmt"
	"net/http"

	"github.com/goofr-group/gaming-store/server/api"
	"github.com/goofr-group/gaming-store/server/internal/domain"
	"github.com/goofr-group/gaming-store/server/internal/logging"
)

const (
	codeTagNotFound = "tag_not_found"

	errTagNotFound = "tag not found"
)

// ListTags handles the http request to list tags.
func (h *handler) ListTags(w http.ResponseWriter, r *http.Request, params api.ListTagsParams) {
	ctx := r.Context()

	domainTagsFilter := listTagsParamsToDomain(params)

	domainPaginatedTags, err := h.service.ListTags(ctx, domainTagsFilter)
	if err != nil {
		var domainFilterValueInvalidError *domain.FilterValueInvalidError

		switch {
		case errors.As(err, &domainFilterValueInvalidError):
			badRequest(w, codeFilterValueInvalid, fmt.Sprintf("%s: %s", errFilterValueInvalid, domainFilterValueInvalidError.FilterName))
		default:
			internalServerError(w)
		}

		return
	}

	tagsPaginated := tagsPaginatedFromDomain(domainPaginatedTags)

	responseBody, err := json.Marshal(tagsPaginated)
	if err != nil {
		logging.Logger.ErrorContext(ctx, descriptionFailedToMarshalResponseBody, logging.Error(err))
		internalServerError(w)

		return
	}

	writeResponseJSON(w, http.StatusOK, responseBody)
}

// listTagsParamsToDomain returns a domain tags paginated filter based on the standardized list tags parameters.
func listTagsParamsToDomain(params api.ListTagsParams) domain.TagsPaginatedFilter {
	domainSort := domain.TagPaginatedSortName

	if params.Sort != nil {
		switch *params.Sort {
		case api.ListTagsParamsSortName:
			domainSort = domain.TagPaginatedSortName
		case api.ListTagsParamsSortGameCount:
			domainSort = domain.TagPaginatedSortGameCount
		default:
			domainSort = domain.TagPaginatedSort(*params.Sort)
		}
	}

	return domain.TagsPaginatedFilter{
		PaginatedRequest: paginatedRequestToDomain(
			domainSort,
			(*api.OrderQueryParam)(params.Order),
			params.Limit,
			params.Offset,
		),
	}
}

// tagFromDomain returns a standardized tag based on the domain model.
func tagFromDomain(tag domain.Tag) api.Tag {
	return api.Tag{
		Id:          tag.ID,
		Name:        string(tag.Name),
		Description: tag.Description,
		CreatedAt:   tag.CreatedAt,
		ModifiedAt:  tag.ModifiedAt,
	}
}

// tagsFromDomain returns standardized tags based on the domain model.
func tagsFromDomain(tags []domain.Tag) []api.Tag {
	t := make([]api.Tag, len(tags))

	for i := 0; i < len(tags); i++ {
		t[i] = tagFromDomain(tags[i])
	}

	return t
}

// tagsPaginatedFromDomain returns a standardized tags paginated response based on the domain model.
func tagsPaginatedFromDomain(paginatedResponse domain.PaginatedResponse[domain.Tag]) api.TagsPaginated {
	return api.TagsPaginated{
		Total: paginatedResponse.Total,
		Tags:  tagsFromDomain(paginatedResponse.Results),
	}
}
