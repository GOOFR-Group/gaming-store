package http

import (
	"context"
	"errors"
	"fmt"
	"net/http"
	"path"
	"strings"

	"github.com/google/uuid"

	"github.com/goofr-group/gaming-store/server/api"
	"github.com/goofr-group/gaming-store/server/internal/authz"
	"github.com/goofr-group/gaming-store/server/internal/domain"
)

// Base URL const.
const (
	baseURLWebApp = "/"
	baseURLApi    = "/api"
	baseURLDocs   = "/api/docs/"
)

// Directories to serve.
const (
	dirWebApp    = "./dist/web"
	dirSwaggerUI = "./api/swagger"
	dirIndexHTML = "index.html"
)

// Request header const.
const (
	requestHeaderKeyAccept       = "Accept"
	requestHeaderKeyContentType  = "Content-Type"
	requestHeaderValueAcceptHTML = "text/html"
)

// AuthorizationService defines the authorization service interface.
type AuthorizationService interface {
	Middleware(options authz.MiddlewareOptions) func(http.Handler) http.Handler
}

// Service defines the service interface.
type Service interface {
	CreateUser(ctx context.Context, editableUser domain.EditableUserWithPassword) (domain.User, error)
	GetUserByID(ctx context.Context, id uuid.UUID) (domain.User, error)
	PatchUser(ctx context.Context, id uuid.UUID, editableUser domain.EditableUserPatch) (domain.User, error)
	SignInUser(ctx context.Context, username domain.Username, email domain.Email, password domain.Password) (string, error)

	CreateGame(ctx context.Context, publisherID uuid.UUID, editableGame domain.EditableGame) (domain.Game, error)
	GetGameByID(ctx context.Context, id uuid.UUID) (domain.Game, error)
	PatchGame(ctx context.Context, id uuid.UUID, editableGame domain.EditableGamePatch) (domain.Game, error)

	UploadMultimedia(ctx context.Context, file []byte, contentType string) (domain.Multimedia, error)
}

// handler defines the http handler structure.
type handler struct {
	authzService AuthorizationService
	service      Service
	handler      http.Handler
}

// New returns a new http handler.
func New(authzService AuthorizationService, service Service) *handler {
	h := &handler{
		authzService: authzService,
		service:      service,
	}

	router := http.NewServeMux()

	// Handle web application.
	webAppFS := http.FileServer(http.Dir(dirWebApp))

	router.HandleFunc(baseURLWebApp, func(w http.ResponseWriter, r *http.Request) {
		// Handle single-page application routing.
		headerAccept := r.Header.Get(requestHeaderKeyAccept)
		if r.URL.Path != baseURLWebApp && strings.Contains(headerAccept, requestHeaderValueAcceptHTML) {
			http.ServeFile(w, r, path.Join(dirWebApp, dirIndexHTML))
			return
		}

		// Handle base file server.
		webAppFS.ServeHTTP(w, r)
	})

	// Handle API.
	authzMiddleware := authzService.Middleware(authz.MiddlewareOptions{
		UnauthorizedHandlerFunc: func(w http.ResponseWriter, r *http.Request, err error) {
			switch {
			case errors.Is(err, authz.ErrAuthorizationHeaderInvalid):
				unauthorized(w, codeAuthorizationHeaderInvalid, errAuthorizationHeaderInvalid)
			case errors.Is(err, authz.ErrJWTInvalid):
				unauthorized(w, codeJWTInvalid, errJWTInvalid)
			default:
				internalServerError(w)
			}
		},
		ForbiddenHandlerFunc: func(w http.ResponseWriter, r *http.Request, err error) {
			switch {
			case errors.Is(err, authz.ErrRolesInvalid):
				forbidden(w, codeRolesInvalid, errRolesInvalid)
			case errors.Is(err, authz.ErrAuthorizationInvalid):
				forbidden(w, codeAuthorizationInvalid, errAuthorizationInvalid)
			default:
				internalServerError(w)
			}
		},
	})

	h.handler = api.HandlerWithOptions(h, api.StdHTTPServerOptions{
		BaseURL:     baseURLApi,
		BaseRouter:  router,
		Middlewares: []api.MiddlewareFunc{authzMiddleware},
		ErrorHandlerFunc: func(w http.ResponseWriter, r *http.Request, err error) {
			var apiInvalidParamFormatError *api.InvalidParamFormatError

			switch {
			case errors.As(err, &apiInvalidParamFormatError):
				badRequest(w, codeParamInvalidFormat, fmt.Sprintf("%s: %s", errParamInvalidFormat, apiInvalidParamFormatError.ParamName))
			default:
				internalServerError(w)
			}
		},
	})

	// Handle swagger documentation.
	swaggerFS := http.FileServer(http.Dir(dirSwaggerUI))
	router.Handle(baseURLDocs, http.StripPrefix(baseURLDocs, swaggerFS))

	return h
}

// ServeHTTP responds to an http request.
func (h *handler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	h.handler.ServeHTTP(w, r)
}

// setHeaderJSON sets the header with the content type json.
func setHeaderJSON(w http.ResponseWriter) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
}

// writeResponseJSON writes the data to the response and sets the header with the provided status code and content type
// json.
func writeResponseJSON(w http.ResponseWriter, statusCode int, data []byte) {
	setHeaderJSON(w)
	w.WriteHeader(statusCode)
	_, _ = w.Write(data)
}
