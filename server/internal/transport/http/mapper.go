package http

import (
	"time"

	oapitypes "github.com/oapi-codegen/runtime/types"

	"github.com/goofr-group/gaming-store/server/api"
)

// dateFromTime returns a standardized date based on the time model.
func dateFromTime(time time.Time) oapitypes.Date {
	return oapitypes.Date{
		Time: time.UTC(),
	}
}

// jwtFromJWTToken returns a standardized JWT based on the JWT token.
func jwtFromJWTToken(token string) api.JWT {
	return api.JWT{
		Token: token,
	}
}
