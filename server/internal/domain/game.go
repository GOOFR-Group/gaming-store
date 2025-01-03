package domain

import (
	"errors"
	"fmt"
	"strconv"
	"time"

	"github.com/google/uuid"
)

// Field constraints.
const (
	gameTitleMinLength = 1
	gameTitleMaxLength = 150

	gamePriceMinValue = 0

	gameDescriptionMinLength = 1
	gameDescriptionMaxLength = 500

	gameAgeRatingMinLength = 1
	gameAgeRatingMaxLength = 2

	gameFeaturesMinLength = 1
	gameFeaturesMaxLength = 250

	gameLanguagesMinLength = 1
	gameLanguagesMaxLength = 200

	gameRequirementMinLength = 1
	gameRequirementMaxLength = 500
)

// Game errors.
var (
	ErrGameNotFound                   = errors.New("game not found")                     // Returned when a game is not found.
	ErrGamePreviewMultimediaNotFound  = errors.New("game preview multimedia not found")  // Returned when a game preview multimedia is not found.
	ErrGameDownloadMultimediaNotFound = errors.New("game download multimedia not found") // Returned when a game download multimedia is not found.
	ErrGameNotActive                  = errors.New("game not active")                    // Returned when a game is accessed in an inactive state.
	ErrGameNotReleased                = errors.New("game not released")                  // Returned when a game is accessed in an unreleased state.
)

// GameTitle defines the game title type.
type GameTitle string

// Valid returns true if the game title is valid, false otherwise.
func (t GameTitle) Valid() bool {
	return len(t) >= gameTitleMinLength && len(t) <= gameTitleMaxLength
}

// GamePrice defines the game price type.
type GamePrice float64

// String returns the game price in string format with 2 decimal places.
func (p GamePrice) String() string {
	return fmt.Sprintf("%.2f", p)
}

// WithTax returns the game price with the tax applied.
func (p GamePrice) WithTax() GamePrice {
	return p * (1 + Tax)
}

// Valid returns true if the game price is valid, false otherwise.
func (p GamePrice) Valid() bool {
	return p >= gamePriceMinValue
}

// GameDescription defines the game description type.
type GameDescription string

// Valid returns true if the game description is valid, false otherwise.
func (d GameDescription) Valid() bool {
	return len(d) >= gameDescriptionMinLength && len(d) <= gameDescriptionMaxLength
}

// GameAgeRating defines the game age rating type.
type GameAgeRating string

// Valid returns true if the game age rating is valid, false otherwise.
func (ar GameAgeRating) Valid() bool {
	return len(ar) >= gameAgeRatingMinLength && len(ar) <= gameAgeRatingMaxLength
}

// Value returns the integer value.
func (ar GameAgeRating) Value() int {
	v, err := strconv.Atoi(string(ar))
	if err != nil {
		return 0
	}

	return v
}

// GameFeatures defines the game features type.
type GameFeatures string

// Valid returns true if the game features is valid, false otherwise.
func (f GameFeatures) Valid() bool {
	return len(f) >= gameFeaturesMinLength && len(f) <= gameFeaturesMaxLength
}

// GameLanguages defines the game languages type.
type GameLanguages []Language

// String returns the string representation of the game languages.
func (l GameLanguages) String() []string {
	languages := make([]string, len(l))
	for i, language := range l {
		languages[i] = language.String()
	}

	return languages
}

// Valid returns true if the game languages is valid, false otherwise.
func (l GameLanguages) Valid() bool {
	validLength := len(l) >= gameLanguagesMinLength && len(l) <= gameLanguagesMaxLength
	if !validLength {
		return false
	}

	for _, l := range l {
		if !l.Valid() {
			return false
		}
	}

	return true
}

// GameRequirement defines the game requirement type.
type GameRequirement string

// Valid returns true if the game requirement is valid, false otherwise.
func (d GameRequirement) Valid() bool {
	return len(d) >= gameRequirementMinLength && len(d) <= gameRequirementMaxLength
}

// GameRequirements defines the game requirements type.
type GameRequirements struct {
	Minimum     GameRequirement
	Recommended GameRequirement
}

// Valid returns true if the game requirements are valid, false otherwise.
func (r GameRequirements) Valid() bool {
	return r.Minimum.Valid() && r.Recommended.Valid()
}

// EditableGame defines the editable game structure.
type EditableGame struct {
	Title                GameTitle
	Price                GamePrice
	IsActive             bool
	ReleaseDate          *time.Time
	Description          GameDescription
	AgeRating            GameAgeRating
	Features             GameFeatures
	Languages            GameLanguages
	Requirements         GameRequirements
	PreviewMultimediaID  uuid.UUID
	DownloadMultimediaID *uuid.UUID
}

// EditableGamePatch defines the patchable game structure.
type EditableGamePatch struct {
	Title                *GameTitle
	Price                *GamePrice
	IsActive             *bool
	ReleaseDate          *time.Time
	Description          *GameDescription
	AgeRating            *GameAgeRating
	Features             *GameFeatures
	Languages            *GameLanguages
	Requirements         *GameRequirements
	PreviewMultimediaID  *uuid.UUID
	DownloadMultimediaID *uuid.UUID
}

// Game defines the game structure.
type Game struct {
	ID                 uuid.UUID
	Publisher          Publisher
	Title              GameTitle
	Price              GamePrice
	IsActive           bool
	ReleaseDate        *time.Time
	Description        GameDescription
	AgeRating          GameAgeRating
	Features           GameFeatures
	Languages          GameLanguages
	Requirements       GameRequirements
	PreviewMultimedia  Multimedia
	DownloadMultimedia *Multimedia
	Multimedia         []Multimedia
	Tags               []Tag
	CreatedAt          time.Time
	ModifiedAt         time.Time
}

// GamePaginatedSort defines the field of the game to sort.
type GamePaginatedSort string

const (
	GamePaginatedSortTitle       GamePaginatedSort = "title"
	GamePaginatedSortPrice       GamePaginatedSort = "price"
	GamePaginatedSortReleaseDate GamePaginatedSort = "releaseDate"
	GamePaginatedSortUserCount   GamePaginatedSort = "userCount"
)

// Field returns the name of the field to sort by.
func (s GamePaginatedSort) Field() GamePaginatedSort {
	return s
}

// Valid returns true if the field is valid, false otherwise.
func (s GamePaginatedSort) Valid() bool {
	switch s {
	case GamePaginatedSortTitle,
		GamePaginatedSortPrice,
		GamePaginatedSortReleaseDate,
		GamePaginatedSortUserCount:
		return true
	default:
		return false
	}
}

// GamesPaginatedFilter defines the games filter structure.
type GamesPaginatedFilter struct {
	PaginatedRequest[GamePaginatedSort]
	PublisherID       *uuid.UUID
	Title             *GameTitle
	PriceUnder        *GamePrice
	PriceAbove        *GamePrice
	IsActive          *bool
	ReleaseDateBefore *time.Time
	ReleaseDateAfter  *time.Time
	TagIDs            *[]uuid.UUID
}

// GamesRecommendedPaginatedFilter defines the recommended games filter structure.
type GamesRecommendedPaginatedFilter struct {
	PaginatedRequestBase
	UserID *uuid.UUID
}
