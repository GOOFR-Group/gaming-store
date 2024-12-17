package domain

// UserLibraryGamePaginatedSort defines the field of the user library game to sort.
type UserLibraryGamePaginatedSort string

const (
	UserLibraryGamePaginatedSortGameTitle       UserLibraryGamePaginatedSort = "gameTitle"
	UserLibraryGamePaginatedSortGamePrice       UserLibraryGamePaginatedSort = "gamePrice"
	UserLibraryGamePaginatedSortGameReleaseDate UserLibraryGamePaginatedSort = "gameReleaseDate"
)

// Field returns the name of the field to sort by.
func (s UserLibraryGamePaginatedSort) Field() UserLibraryGamePaginatedSort {
	return s
}

// Valid returns true if the field is valid, false otherwise.
func (s UserLibraryGamePaginatedSort) Valid() bool {
	switch s {
	case UserLibraryGamePaginatedSortGameTitle,
		UserLibraryGamePaginatedSortGamePrice,
		UserLibraryGamePaginatedSortGameReleaseDate:
		return true
	default:
		return false
	}
}

// UserLibraryGamesPaginatedFilter defines the user library games filter structure.
type UserLibraryGamesPaginatedFilter struct {
	PaginatedRequest[UserLibraryGamePaginatedSort]
}
