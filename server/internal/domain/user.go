package domain

import (
	"errors"
	"time"

	"github.com/google/uuid"
)

// User errors.
var (
	ErrUserUsernameAlreadyExists = errors.New("username already exists") // Returned when a user already exists with the same username.
	ErrUserEmailAlreadyExists    = errors.New("email already exists")    // Returned when a user already exists with the same email.
	ErrUserVatinAlreadyExists    = errors.New("vatin already exists")    // Returned when a user already exists with the same vatin.
	ErrUserNotFound              = errors.New("user not found")          // Returned when a user is not found.
)

// EditableUser defines the editable user structure.
type EditableUser struct {
	Username            Username
	Email               Email
	DisplayName         Name
	DateOfBirth         time.Time
	Address             Address
	Country             Country
	Vatin               Vatin
	PictureMultimediaID *uuid.UUID
}

// EditableUserWithPassword defines the editable user structure with a password.
type EditableUserWithPassword struct {
	EditableUser
	Password
}

// EditableUserPatch defines the patchable user structure.
type EditableUserPatch struct {
	Username            *Username
	Email               *Email
	DisplayName         *Name
	DateOfBirth         *time.Time
	Address             *Address
	Country             *Country
	Vatin               *Vatin
	Balance             *float64
	PictureMultimediaID *uuid.UUID
}

// User defines the user structure.
type User struct {
	ID                uuid.UUID
	Username          Username
	Email             Email
	DisplayName       Name
	DateOfBirth       time.Time
	Address           Address
	Country           Country
	Vatin             Vatin
	Balance           float64
	PictureMultimedia *Multimedia
	CreatedAt         time.Time
	ModifiedAt        time.Time
}
