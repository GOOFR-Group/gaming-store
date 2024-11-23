package http

import (
	"github.com/goofr-group/gaming-store/server/internal/authz"
	"github.com/goofr-group/gaming-store/server/internal/domain"
)

// AuthzRoles defines the authorization roles for the API.
var AuthzRoles authz.Roles = authz.Roles{
	AuthzWildcards: []string{domain.FieldParamUserID, domain.FieldParamPublisherID},
}
