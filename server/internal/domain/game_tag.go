package domain

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
