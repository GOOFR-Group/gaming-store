package authz

import (
	"github.com/goofr-group/gaming-store/server/internal/authn"
)

// Roles defines the authorization roles structure.
type Roles struct {
	AuthzWildcards []string // Wildcards that require authorization.
}

// AuthenticationService defines the authentication service interface.
type AuthenticationService interface {
	ParseJWT(tokenString string) (authn.Claims, error)
}

// service defines the authorization service structure.
type service struct {
	roles        Roles
	authnService AuthenticationService
}

// New returns a new authorization service.
func New(roles Roles, authnService AuthenticationService) *service {
	return &service{
		roles:        roles,
		authnService: authnService,
	}
}
