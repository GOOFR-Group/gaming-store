package authn

import (
	"context"
	"sync"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

const (
	jwtIssuer         = "server"
	jwtExpirationTime = time.Hour * 24

	descriptionFailedToParseJWTWithClaims = "authn: failed to parse jwt with claims"
)

// SubjectRole defines the role of the subject.
type SubjectRole string

const (
	SubjectRoleUser      SubjectRole = "user"
	SubjectRolePublisher SubjectRole = "publisher"
)

// Claims defines the JSON Web Token claims structure.
type Claims struct {
	jwt.RegisteredClaims
	Roles []SubjectRole `json:"roles,omitempty"`
}

// service defines the authentication service structure.
type service struct {
	jwtSigningKey     []byte
	blacklistedTokens map[string]int64 // token string to expiration timestamp
	mutex             sync.RWMutex
}

// New returns a new authentication service.
func New(jwtSigningKey []byte) *service {
	return &service{
		jwtSigningKey:     jwtSigningKey,
		blacklistedTokens: make(map[string]int64),
	}
}

// NewJWT returns a new signed JSON Web Token with an expiration time of 24 hours and the specified claims.
func (s *service) NewJWT(claims Claims) (string, error) {
	claims.RegisteredClaims = jwt.RegisteredClaims{
		Issuer:    jwtIssuer,
		ExpiresAt: jwt.NewNumericDate(time.Now().Add(jwtExpirationTime)),
		IssuedAt:  jwt.NewNumericDate(time.Now()),
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(s.jwtSigningKey)
}

// ParseJWT parses the given token string and returns the associated claims, or returns an error if the token is invalid.
func (s *service) ParseJWT(tokenString string) (*Claims, error) {
	token, err := jwt.ParseWithClaims(tokenString, &Claims{}, func(token *jwt.Token) (interface{}, error) {
		return s.jwtSigningKey, nil
	})
	if err != nil || !token.Valid {
		return nil, err
	}

	claims, ok := token.Claims.(*Claims)
	if !ok {
		return nil, err
	}

	return claims, nil
}

// BlacklistToken adds the given token string to the blacklist.
func (s *service) BlacklistToken(ctx context.Context, tokenString string) error {
	s.mutex.Lock()
	defer s.mutex.Unlock()

	claims, err := s.ParseJWT(tokenString)
	if err != nil {
		return err
	}

	s.blacklistedTokens[tokenString] = claims.ExpiresAt.Unix()
	return nil
}

// IsTokenBlacklisted checks if the given token string is blacklisted.
func (s *service) IsTokenBlacklisted(tokenString string) bool {
	s.mutex.RLock()
	exp, exists := s.blacklistedTokens[tokenString]
	s.mutex.RUnlock()

	if !exists {
		return false
	}

	if time.Now().Unix() > exp {
		// Token has expired, remove from blacklist
		s.mutex.Lock()
		delete(s.blacklistedTokens, tokenString)
		s.mutex.Unlock()
		return false
	}

	return true
}
