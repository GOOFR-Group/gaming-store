package domain

import (
	"time"

	"github.com/google/uuid"
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
