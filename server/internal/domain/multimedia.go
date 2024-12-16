package domain

import (
	"errors"
	"time"

	"github.com/google/uuid"
)

const (
	// MultimediaFileMaxSize defines the maximum size of a multimedia file in bytes.
	MultimediaFileMaxSize = 2097152
)

// Multimedia errors.
var (
	ErrMultimediaNotFound = errors.New("multimedia not found") // Returned when a multimedia is not found.
)

// MultimediaObject defines the multimedia object structure.
type MultimediaObject struct {
	Checksum  uint32 // CRC32 checksum using the Castagnoli93 polynomial.
	MediaType string // MIME type.
	URL       string
}

// Multimedia defines the multimedia structure.
type Multimedia struct {
	MultimediaObject
	ID        uuid.UUID
	CreatedAt time.Time
}
