package http

import (
	"encoding/json"
	"net/http"
)

// Helper function to send unauthorized response
func unauthorized(w http.ResponseWriter, code, message string) {
	writeErrorResponse(w, http.StatusUnauthorized, code, message)
}

func internalServerError(w http.ResponseWriter) {
	writeErrorResponse(w, http.StatusInternalServerError, "internal_server_error", "Internal Server Error")
}

// Generic function to write an error response
func writeErrorResponse(w http.ResponseWriter, statusCode int, code, message string) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(statusCode)
	response := map[string]string{
		"code":    code,
		"message": message,
	}
	json.NewEncoder(w).Encode(response)
}

func writeResponseJSON(w http.ResponseWriter, statusCode int, responseBody []byte) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(statusCode)
	w.Write(responseBody)
}
