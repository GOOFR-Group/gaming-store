package domain

import (
	"database/sql/driver"
	"errors"
	"fmt"
	"time"

	"github.com/google/uuid"
)

// Field constraints.
const (
	userDateOfBirthMinAge = 16
)

// User errors.
var (
	ErrUserUsernameAlreadyExists = errors.New("username already exists")   // Returned when a user already exists with the same username.
	ErrUserEmailAlreadyExists    = errors.New("email already exists")      // Returned when a user already exists with the same email.
	ErrUserVatinAlreadyExists    = errors.New("vatin already exists")      // Returned when a user already exists with the same vatin.
	ErrUserNotFound              = errors.New("user not found")            // Returned when a user is not found.
	ErrUserNotOldEnough          = errors.New("user not old enough")       // Returned when a user is user not old enough to perform a certain action.
	ErrUserBalanceInsufficient   = errors.New("user balance insufficient") // Returned when a user does not have sufficient balance.
)

// UserDateOfBirth defines the user date of birth type.
type UserDateOfBirth time.Time

// Time returns the time.
func (d UserDateOfBirth) Time() time.Time {
	return time.Time(d)
}

// Valid returns true if the user date of birth is valid, false otherwise.
func (d UserDateOfBirth) Valid() bool {
	dateOfBirth := d.Time().UTC()
	minTime := time.Now().AddDate(-userDateOfBirthMinAge, 0, 0).UTC()

	return dateOfBirth.Before(minTime)
}

// Scan implements sql.Scanner so UserDateOfBirth can be read from databases transparently.
func (d *UserDateOfBirth) Scan(src interface{}) error {
	switch src := src.(type) {
	case nil:
		return nil

	case time.Time:
		*d = UserDateOfBirth(src)

	default:
		return fmt.Errorf("Scan: unable to scan type %T into UserDateOfBirth", src)
	}

	return nil
}

// Value implements sql.Valuer so that UserDateOfBirth can be written to databases transparently.
func (d UserDateOfBirth) Value() (driver.Value, error) {
	return d.Time(), nil
}

// SignInUser defines the sign-in user structure.
type SignInUser struct {
	Username Username
	Email    Email
	Password Password
}

// EditableUser defines the editable user structure.
type EditableUser struct {
	Username            Username
	Email               Email
	DisplayName         Name
	DateOfBirth         UserDateOfBirth
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
	DateOfBirth         *UserDateOfBirth
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
	DateOfBirth       UserDateOfBirth
	Address           Address
	Country           Country
	Vatin             Vatin
	Balance           float64
	PictureMultimedia *Multimedia
	CreatedAt         time.Time
	ModifiedAt        time.Time
}

// UserGameLibraryPaginatedSort defines the field of the user game library to sort.
type UserGameLibraryPaginatedSort string

const (
	UserGameLibraryPaginatedSortGameTitle       UserGameLibraryPaginatedSort = "gameTitle"
	UserGameLibraryPaginatedSortGamePrice       UserGameLibraryPaginatedSort = "gamePrice"
	UserGameLibraryPaginatedSortGameReleaseDate UserGameLibraryPaginatedSort = "gameReleaseDate"
)

// Field returns the name of the field to sort by.
func (s UserGameLibraryPaginatedSort) Field() UserGameLibraryPaginatedSort {
	return s
}

// Valid returns true if the field is valid, false otherwise.
func (s UserGameLibraryPaginatedSort) Valid() bool {
	switch s {
	case UserGameLibraryPaginatedSortGameTitle,
		UserGameLibraryPaginatedSortGamePrice,
		UserGameLibraryPaginatedSortGameReleaseDate:
		return true
	default:
		return false
	}
}

// UserGamesLibraryPaginatedFilter defines the user games library filter structure.
type UserGamesLibraryPaginatedFilter struct {
	PaginatedRequest[UserGameLibraryPaginatedSort]
}
