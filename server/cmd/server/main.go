package main

import (
	"context"
	"errors"
	"log/slog"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/goofr-group/gaming-store/server/internal/authn"
	"github.com/goofr-group/gaming-store/server/internal/authz"
	ismtp "github.com/goofr-group/gaming-store/server/internal/client/smtp"
	"github.com/goofr-group/gaming-store/server/internal/config"
	"github.com/goofr-group/gaming-store/server/internal/logging"
	"github.com/goofr-group/gaming-store/server/internal/service"
	idataStore "github.com/goofr-group/gaming-store/server/internal/store/data"
	iobjectStore "github.com/goofr-group/gaming-store/server/internal/store/object"
	ihttp "github.com/goofr-group/gaming-store/server/internal/transport/http"
)

// Environment variable keys.
const (
	envKeyJWTSigningKey = "JWT_SIGNING_KEY"
)

// Default configuration values.
const (
	defaultAddressHTTP = ":8080"
)

// Server metadata.
var (
	BuildGitHash   string
	BuildTimestamp string
	HostName       string
)

func main() {
	var err error

	if len(HostName) == 0 {
		HostName, err = os.Hostname()
		if err != nil {
			logging.Logger.Error("main: failed to get host name", logging.Error(err))
			return
		}
	}

	// Initialize logger with metadata attributes.
	slogHandler := slog.NewJSONHandler(os.Stdout, nil)
	logging.Init(slogHandler,
		slog.String(logging.BuildGitHash, BuildGitHash),
		slog.String(logging.BuildTimestamp, BuildTimestamp),
		slog.String(logging.HostName, HostName),
	)

	// Initialize base context.
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	// Load service configuration.
	serviceConfig, err := config.Load()
	if err != nil {
		logging.Logger.ErrorContext(ctx, "main: failed to load service configuration", logging.Error(err))
		return
	}

	// Set up data store.
	dataStore, err := idataStore.New(ctx, serviceConfig.Database)
	if err != nil {
		logging.Logger.ErrorContext(ctx, "main: failed to set up data store", logging.Error(err))
		return
	}
	defer dataStore.Close()

	// Set up object store.
	var objectStore service.ObjectStore

	if serviceConfig.CloudStorage.Enabled {
		store, err := iobjectStore.New(ctx, serviceConfig.CloudStorage)
		if err != nil {
			logging.Logger.ErrorContext(ctx, "main: failed to set up object store", logging.Error(err))
			return
		}
		defer store.Close()

		objectStore = store
	} else {
		objectStore = iobjectStore.NewNOOP()
	}

	// Set up smtp client.
	var smtp service.SMTP

	if serviceConfig.SMTP.Enabled {
		smtp = ismtp.New(serviceConfig.SMTP)
	} else {
		smtp = ismtp.NewNOOP()
	}

	// Set up authentication service.
	jwtSigningKey, ok := os.LookupEnv(envKeyJWTSigningKey)
	if !ok {
		logging.Logger.WarnContext(ctx, "main: failed to get jwt signing key")
	}

	authnService := authn.New([]byte(jwtSigningKey))

	// Set up authorization service.
	authzService := authz.New(ihttp.AuthzRoles, authnService)

	// Set up service.
	service := service.New(authnService, dataStore, objectStore, smtp)

	// Handle signals.
	sigs := make(chan os.Signal, 1)
	signal.Notify(sigs, syscall.SIGINT, syscall.SIGTERM, syscall.SIGQUIT)

	// Set up http server.
	addressHTTP := defaultAddressHTTP
	if len(serviceConfig.ServerHTTP.Address) != 0 {
		addressHTTP = serviceConfig.ServerHTTP.Address
	}

	handlerHTTP := ihttp.New(authzService, service)

	var writeTimeoutHTTP time.Duration
	if len(serviceConfig.ServerHTTP.WriteTimeout) != 0 {
		writeTimeoutHTTP, err = time.ParseDuration(serviceConfig.ServerHTTP.WriteTimeout)
		if err != nil {
			logging.Logger.ErrorContext(ctx, "main: failed to parse server http write timeout configuration", logging.Error(err))
		}
	}

	serverHTTP := &http.Server{
		Addr:         addressHTTP,
		Handler:      handlerHTTP,
		WriteTimeout: writeTimeoutHTTP,
		ErrorLog:     slog.NewLogLogger(logging.Logger.Handler(), slog.LevelError),
	}

	go func() {
		err := serverHTTP.ListenAndServe()
		if errors.Is(err, http.ErrServerClosed) {
			logging.Logger.InfoContext(ctx, "main: server http terminated")
		} else {
			logging.Logger.ErrorContext(ctx, "main: server http terminated unexpectedly", logging.Error(err))
		}

		sigs <- syscall.SIGQUIT
	}()

	logging.Logger.InfoContext(ctx, "main: server initialized")

	// Handle server shutdown.
	sig := <-sigs
	switch sig {
	case syscall.SIGINT, syscall.SIGQUIT, syscall.SIGTERM:
		if err := serverHTTP.Shutdown(ctx); err != nil {
			logging.Logger.ErrorContext(ctx, "main: failed to shutdown server http", logging.Error(err))
		}
	}

	logging.Logger.InfoContext(ctx, "main: server terminated")
}
