package domain

import (
	"errors"
	"time"

	"github.com/google/uuid"
)

// Publisher errors.
var (
	ErrPublisherEmailAlreadyExists = errors.New("email already exists") // Returned when a publisher already
	//exists with the same email.
	ErrPublisherVatinAlreadyExists = errors.New("vatin already exists") // Returned when a publisher already
	// exists with the same vatin.
	ErrPublisherNotFound = errors.New("publisher not found") // Returned when a publisher is not found.
)

// EditablePublisher defines the editable publisher structure.
type EditablePublisher struct {
	Email               Email
	Name                Name
	Address             Address
	Country             Country
	Vatin               Vatin
	PictureMultimediaID *uuid.UUID
}

// EditablePublisherWithPassword defines the editable publisher structure with a password.
type EditablePublisherWithPassword struct {
	EditablePublisher
	Password
}

// EditableUserPatch defines the patchable user structure.
type EditablePublisherPatch struct {
	Email               *Email
	Name                *Name
	Address             *Address
	Country             *Country
	Vatin               *Vatin
	PictureMultimediaID *uuid.UUID
}

// Publisher defines the publisher structure.
type Publisher struct {
	EditablePublisher
	ID uuid.UUID
	//Balance    float64 ?????????????????????????????
	CreatedAt  time.Time
	ModifiedAt time.Time
}
