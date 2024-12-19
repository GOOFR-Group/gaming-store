package domain

// UserLibraryPaginatedSort defines the field of the user library to sort.
type UserLibraryPaginatedSort string

const (
	UserLibraryPaginatedSortGameTitle       UserLibraryPaginatedSort = "gameTitle"
	UserLibraryPaginatedSortGamePrice       UserLibraryPaginatedSort = "gamePrice"
	UserLibraryPaginatedSortGameReleaseDate UserLibraryPaginatedSort = "gameReleaseDate"
)

// Field returns the name of the field to sort by.
func (s UserLibraryPaginatedSort) Field() UserLibraryPaginatedSort {
	return s
}

// Valid returns true if the field is valid, false otherwise.
func (s UserLibraryPaginatedSort) Valid() bool {
	switch s {
	case UserLibraryPaginatedSortGameTitle,
		UserLibraryPaginatedSortGamePrice,
		UserLibraryPaginatedSortGameReleaseDate:
		return true
	default:
		return false
	}
}

// UserLibraryPaginatedFilter defines the user library filter structure.
type UserLibraryPaginatedFilter struct {
	PaginatedRequest[UserLibraryPaginatedSort]
}
