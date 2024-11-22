package http

import (
	"encoding/json"
	"net/http"

	"github.com/goofr-group/gaming-store/server/api"
)

// Common fault messages.
const (
	codeAuthorizationHeaderInvalid = "authorization_header_invalid"
	codeJWTInvalid                 = "jwt_invalid"
	codeRolesInvalid               = "roles_invalid"
	codeAuthorizationInvalid       = "authorization_invalid"
	codeParamInvalidFormat         = "param_invalid_format"
	codeRequestBodyInvalid         = "request_body_invalid"
	codeFieldValueInvalid          = "field_value_invalid"
	codeCredentialsIncorrect       = "credentials_incorrect"
	codeInternalServerError        = "internal_server_error"

	errAuthorizationHeaderInvalid = "invalid authorization header"
	errJWTInvalid                 = "invalid jwt"
	errRolesInvalid               = "invalid subject roles"
	errAuthorizationInvalid       = "unauthorized subject"
	errParamInvalidFormat         = "invalid parameter format"
	errRequestBodyInvalid         = "invalid request body"
	errFieldValueInvalid          = "invalid field value"
	errCredentialsIncorrect       = "incorrect credentials"
)

// Common fault descriptions.
const (
	descriptionFailedToMarshalResponseBody = "http: failed to marshal response body"
	descriptionFailedToMapResponseBody     = "http: failed to map response body"
)

// badRequest writes an error response and sets the header with the bad request status code.
func badRequest(w http.ResponseWriter, code, message string) {
	_ = fault(w, http.StatusBadRequest, code, &message)
}

// unauthorized writes an error response and sets the header with the unauthorized status code.
func unauthorized(w http.ResponseWriter, code, message string) {
	_ = fault(w, http.StatusUnauthorized, code, &message)
}

// forbidden writes an error response and sets the header with the forbidden status code.
func forbidden(w http.ResponseWriter, code, message string) {
	_ = fault(w, http.StatusForbidden, code, &message)
}

// notFound writes an error response and sets the header with the not found status code.
func notFound(w http.ResponseWriter, code, message string) {
	_ = fault(w, http.StatusNotFound, code, &message)
}

// conflict writes an error response and sets the header with the conflict status code.
func conflict(w http.ResponseWriter, code, message string) {
	_ = fault(w, http.StatusConflict, code, &message)
}

// internalServerError sets the header with the internal server error status code.
func internalServerError(w http.ResponseWriter) {
	_ = fault(w, http.StatusInternalServerError, codeInternalServerError, nil)
}

// fault writes an error response and sets the header with the provided status code and content type json.
func fault(w http.ResponseWriter, statusCode int, code string, message *string) error {
	setHeaderJSON(w)
	w.WriteHeader(statusCode)

	enc := json.NewEncoder(w)

	return enc.Encode(api.Error{
		Code:    code,
		Message: message,
	})
}
