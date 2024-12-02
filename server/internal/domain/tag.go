package domain

import (
	"errors"
	"time"

	"github.com/google/uuid"
)

// Tag errors.
var (
	ErrTagNotFound = errors.New("tag not found") // Returned when a tag is not found.
)

// Tag defines the tag structure.
type Tag struct {
	ID          uuid.UUID
	Name        Name
	Description *string
	CreatedAt   time.Time
	ModifiedAt  time.Time
}

// TagPaginatedSort defines the field of the tag to sort.
type TagPaginatedSort string

const (
	TagPaginatedSortName      TagPaginatedSort = "name"
	TagPaginatedSortGameCount TagPaginatedSort = "gameCount"
)

// Field returns the name of the field to sort by.
func (s TagPaginatedSort) Field() TagPaginatedSort {
	return s
}

// Valid returns true if the field is valid, false otherwise.
func (s TagPaginatedSort) Valid() bool {
	switch s {
	case TagPaginatedSortName,
		TagPaginatedSortGameCount:
		return true
	default:
		return false
	}
}

// TagsPaginatedFilter defines the tags filter structure.
type TagsPaginatedFilter struct {
	PaginatedRequest[TagPaginatedSort]
}
