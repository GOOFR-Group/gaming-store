package http

import (
	"github.com/gorilla/mux"
)

func NewRouter(handler *handler) *mux.Router {
	r := mux.NewRouter()

	// Public routes
	r.HandleFunc("/signin", handler.SignInUser).Methods("POST")

	// Secured routes
	secured := r.PathPrefix("/").Subrouter()
	secured.Use(handler.authMiddleware)
	secured.HandleFunc("/logout", handler.Logout).Methods("POST")
	// Other secured routes...

	return r
}
