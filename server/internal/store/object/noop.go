package object

import (
	"context"
	"io"

	"github.com/goofr-group/gaming-store/server/internal/domain"
)

// noop defines the object store structure that does not perform any operation.
type noop struct{}

// NewNOOP returns a new object store that does not perform any operation.
func NewNOOP() *noop {
	return &noop{}
}

func (s *noop) CreateMultimediaObject(ctx context.Context, name string, reader io.Reader) error {
	return nil
}

func (s *noop) GetMultimediaObject(ctx context.Context, name string) (domain.MultimediaObject, error) {
	return domain.MultimediaObject{URL: name}, nil
}
