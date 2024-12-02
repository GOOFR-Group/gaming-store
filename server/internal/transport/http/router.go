// Inside your function that sets up routes, add:

// Require authentication middleware if necessary
r.HandleFunc("/logout", handler.Logout).Methods("POST")