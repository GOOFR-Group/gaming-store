package container

import (
	"context"
	"fmt"
	"time"

	"github.com/docker/go-connections/nat"
	"github.com/testcontainers/testcontainers-go"
	"github.com/testcontainers/testcontainers-go/wait"

	"github.com/goofr-group/gaming-store/server/internal/logging"
)

// Environment variable const.
const (
	databaseUser     = "postgres"
	databasePassword = "postgres"
	databasePort     = "5432"
	databaseName     = "store"

	databaseStartupTimeout = 10 * time.Second
)

// database defines a database test container using the database.Dockerfile.
type database struct {
	container testcontainers.Container
}

// NewDatabase returns a new database test container.
func NewDatabase(ctx context.Context) *database {
	port := fmt.Sprintf("%s/tcp", databasePort)

	container, err := testcontainers.GenericContainer(ctx, testcontainers.GenericContainerRequest{
		Started: true,
		ContainerRequest: testcontainers.ContainerRequest{
			Image:        "postgres",
			ExposedPorts: []string{port},
			AutoRemove:   true,
			Env: map[string]string{
				"PGUSER":            databaseUser,
				"POSTGRES_USER":     databaseUser,
				"POSTGRES_DB":       databaseName,
				"POSTGRES_PASSWORD": databasePassword,
			},
			WaitingFor: wait.ForLog("database system is ready to accept connections").
				WithOccurrence(2).WithStartupTimeout(databaseStartupTimeout),
		},
	})
	if err != nil {
		logging.Logger.ErrorContext(ctx, "container: failed to create database container", logging.Error(err))
		return nil
	}

	return &database{
		container: container,
	}
}

// ConnectionString returns the database connection string.
func (s *database) ConnectionString(ctx context.Context) string {
	if s == nil {
		return ""
	}

	if s.container == nil {
		return ""
	}

	port := fmt.Sprintf("%s/tcp", databasePort)

	mappedPort, err := s.container.MappedPort(ctx, nat.Port(port))
	if err != nil {
		logging.Logger.ErrorContext(ctx, "container: failed to get database mapped port", logging.Error(err))
		return ""
	}

	return fmt.Sprintf("postgres://%s:%s@localhost:%s/%s?sslmode=disable", databaseUser, databasePassword, mappedPort.Port(), databaseName)
}

// Terminate terminates the container.
func (s *database) Terminate(ctx context.Context) {
	if s == nil {
		return
	}

	if s.container == nil {
		return
	}

	if err := s.container.Terminate(ctx); err != nil {
		logging.Logger.ErrorContext(ctx, "container: failed to terminate database container", logging.Error(err))
	}
}
