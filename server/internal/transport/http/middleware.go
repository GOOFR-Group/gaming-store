package http

import (
	"context"
	"net/http"

	"github.com/goofr-group/gaming-store/server/internal/domain"
)

func (h *handler) authMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		ctx := r.Context()

		tokenString := extractTokenFromHeader(r)
		if tokenString == "" {
			unauthorized(w, codeAuthorizationHeaderInvalid, errAuthorizationHeaderInvalid)
			return
		}

		// Check if the token is blacklisted
		if h.authnService.IsTokenBlacklisted(tokenString) {
			unauthorized(w, codeTokenRevoked, errTokenRevoked)
			return
		}

		// Parse and validate the JWT
		claims, err := h.authnService.ParseJWT(tokenString)
		if err != nil {
			unauthorized(w, codeTokenInvalid, errTokenInvalid)
			return
		}

		// Add claims to context
		ctx = context.WithValue(ctx, domain.ContextKeyClaims, claims)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}
