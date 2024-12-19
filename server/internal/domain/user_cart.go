package domain

import "errors"

// User cart errors.
var (
	ErrUserCartGameAlreadyExists = errors.New("user cart game already exists") // Returned when a user cart game association already exists.
	ErrUserCartGameNotFound      = errors.New("user cart game not found")      // Returned when a user cart game association is not found.
)

// UserCartPaginatedSort defines the field of the user cart to sort.
type UserCartPaginatedSort string

const (
	UserCartPaginatedSortCreatedAt UserCartPaginatedSort = "createdAt"
	UserCartPaginatedSortGameTitle UserCartPaginatedSort = "gameTitle"
)

// Field returns the name of the field to sort by.
func (s UserCartPaginatedSort) Field() UserCartPaginatedSort {
	return s
}

// Valid returns true if the field is valid, false otherwise.
func (s UserCartPaginatedSort) Valid() bool {
	switch s {
	case UserCartPaginatedSortCreatedAt,
		UserCartPaginatedSortGameTitle:
		return true
	default:
		return false
	}
}

// UserCartPaginatedFilter defines the user cart filter structure.
type UserCartPaginatedFilter struct {
	PaginatedRequest[UserCartPaginatedSort]
}
