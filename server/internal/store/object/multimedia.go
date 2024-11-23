package object

import (
	"context"
	"errors"
	"fmt"
	"io"

	"cloud.google.com/go/storage"

	"github.com/goofr-group/gaming-store/server/internal/domain"
)

// CreateMultimediaObject creates a multimedia object with the specified name.
func (s *store) CreateMultimediaObject(ctx context.Context, name string, reader io.Reader) error {
	object := s.client.Bucket(s.bucketMultimedia).Object(name)
	object = object.If(storage.Conditions{DoesNotExist: true})

	writer := object.NewWriter(ctx)

	_, err := io.Copy(writer, reader)
	if err != nil {
		return fmt.Errorf("store: failed to copy to writer: %w", err)
	}

	err = writer.Close()
	if err != nil {
		return fmt.Errorf("store: failed to close writer: %w", err)
	}

	return nil
}

// GetMultimediaObject returns the multimedia object with the specified name.
func (s *store) GetMultimediaObject(ctx context.Context, name string) (domain.MultimediaObject, error) {
	attrs, err := s.client.Bucket(s.bucketMultimedia).Object(name).Attrs(ctx)
	if err != nil {
		switch {
		case errors.Is(err, storage.ErrObjectNotExist):
			return domain.MultimediaObject{}, domain.ErrMultimediaNotFound
		default:
			return domain.MultimediaObject{}, fmt.Errorf("store: failed to get attributes: %w", err)
		}
	}

	return domain.MultimediaObject{
		Checksum:  attrs.CRC32C,
		MediaType: attrs.ContentType,
		URL:       attrs.MediaLink,
	}, nil
}
