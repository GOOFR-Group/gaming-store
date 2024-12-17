package domain

// UserCartGamePaginatedSort defines the field of the user cart game to sort.
type UserCartGamePaginatedSort string

const (
	UserCartGamePaginatedSortCreatedAt UserCartGamePaginatedSort = "createdAt"
	UserCartGamePaginatedSortGameTitle UserCartGamePaginatedSort = "gameTitle"
)

// Field returns the name of the field to sort by.
func (s UserCartGamePaginatedSort) Field() UserCartGamePaginatedSort {
	return s
}

// Valid returns true if the field is valid, false otherwise.
func (s UserCartGamePaginatedSort) Valid() bool {
	switch s {
	case UserCartGamePaginatedSortCreatedAt,
		UserCartGamePaginatedSortGameTitle:
		return true
	default:
		return false
	}
}

// UserCartGamesPaginatedFilter defines the user cart games filter structure.
type UserCartGamesPaginatedFilter struct {
	PaginatedRequest[UserCartGamePaginatedSort]
}

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
