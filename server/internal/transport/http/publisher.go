package http

import (
	"github.com/goofr-group/gaming-store/server/api"
	"github.com/goofr-group/gaming-store/server/internal/domain"
)

const (
	codePublisherNotFound = "publisher_not_found"

	errPublisherNotFound = "publisher not found"
)

// publisherFromDomain returns a standardized publisher based on the domain model.
func publisherFromDomain(publisher domain.Publisher) api.Publisher {
	return api.Publisher{
		Id:                publisher.ID,
		Email:             string(publisher.Email),
		Name:              string(publisher.Name),
		Address:           string(publisher.Address),
		Country:           publisher.Country.String(),
		Vatin:             string(publisher.Vatin),
		PictureMultimedia: optionalMultimediaFromDomain(publisher.PictureMultimedia),
		CreatedAt:         publisher.CreatedAt,
		ModifiedAt:        publisher.ModifiedAt,
	}
}
