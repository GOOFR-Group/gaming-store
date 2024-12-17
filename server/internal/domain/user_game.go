package domain

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
