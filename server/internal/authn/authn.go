package authn

// service defines the authentication service structure.
type service struct {
	jwtSigningKey     []byte
	blacklistedTokens map[string]int64
}

// New returns a new authentication service.
func New(jwtSigningKey []byte) *service {
	return &service{
		jwtSigningKey:     jwtSigningKey,
		blacklistedTokens: make(map[string]int64),
	}
}
