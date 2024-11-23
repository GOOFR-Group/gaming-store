package object

import (
	"context"
	"fmt"

	"cloud.google.com/go/storage"

	"github.com/goofr-group/gaming-store/server/internal/config"
)

// store defines the object store structure.
type store struct {
	client           *storage.Client
	bucketMultimedia string
}

// New returns a new object store.
func New(ctx context.Context, config config.CloudStorage) (*store, error) {
	client, err := storage.NewClient(ctx)
	if err != nil {
		return nil, fmt.Errorf("store: failed to initialize storage: %w", err)
	}

	return &store{
		client:           client,
		bucketMultimedia: config.BucketMultimedia,
	}, nil
}

// Close closes the client.
func (s *store) Close() {
	s.client.Close()
}
