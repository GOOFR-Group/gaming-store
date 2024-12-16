package domain

import "errors"

// Game tag errors.
var (
	ErrGameTagAlreadyExists = errors.New("game tag already exists") // Returned when a game tag association already exists.
	ErrGameTagNotFound      = errors.New("game tag not found")      // Returned when a game tag association is not found.
)

// GameTagPaginatedSort defines the field of the game tag to sort.
type GameTagPaginatedSort string

const (
	GameTagPaginatedSortTagName GameTagPaginatedSort = "tagName"
)

// Field returns the name of the field to sort by.
func (s GameTagPaginatedSort) Field() GameTagPaginatedSort {
	return s
}

// Valid returns true if the field is valid, false otherwise.
func (s GameTagPaginatedSort) Valid() bool {
	switch s {
	case GameTagPaginatedSortTagName:
		return true
	default:
		return false
	}
}

// GameTagsPaginatedFilter defines the game tags filter structure.
type GameTagsPaginatedFilter struct {
	PaginatedRequest[GameTagPaginatedSort]
}
