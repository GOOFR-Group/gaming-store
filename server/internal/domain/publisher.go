package domain

import (
	"errors"
	"time"

	"github.com/google/uuid"
)

// Publisher errors.
var (
	ErrPublisherNotFound = errors.New("publisher not found") // Returned when a publisher is not found.
)

// Publisher defines the publisher structure.
type Publisher struct {
	ID                uuid.UUID
	Email             Email
	Name              Name
	Address           Address
	Country           Country
	Vatin             Vatin
	PictureMultimedia *Multimedia
	CreatedAt         time.Time
	ModifiedAt        time.Time
}
