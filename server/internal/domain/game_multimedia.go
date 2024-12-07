package domain

import "errors"

// Field constraints.
const (
	gameMultimediaPositionMinValue = 0
	gameMultimediaPositionMaxValue = 20
)

// Game multimedia errors.
var (
	ErrGameMultimediaAlreadyExists         = errors.New("game multimedia already exists")          // Returned when a game multimedia association already exists.
	ErrGameMultimediaPositionAlreadyExists = errors.New("game multimedia position already exists") // Returned when a game multimedia position already exists.
	ErrGameMultimediaNotFound              = errors.New("game multimedia not found")               // Returned when a game multimedia association is not found.
)

// GameMultimediaPosition defines the game multimedia position type.
type GameMultimediaPosition int

// Valid returns true if the game multimedia position is valid, false otherwise.
func (p GameMultimediaPosition) Valid() bool {
	return p >= gameMultimediaPositionMinValue && p <= gameMultimediaPositionMaxValue
}

// EditableGameMultimedia defines the editable game multimedia structure.
type EditableGameMultimedia struct {
	Position GameMultimediaPosition
}
