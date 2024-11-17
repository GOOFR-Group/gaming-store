package http

import (
	"time"

	oapitypes "github.com/oapi-codegen/runtime/types"
)

// dateFromTime returns a standardized date based on the time model.
func dateFromTime(time time.Time) oapitypes.Date {
	return oapitypes.Date{
		Time: time.UTC(),
	}
}
