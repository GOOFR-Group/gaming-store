package data

import (
	"context"
	"errors"
	"fmt"

	"github.com/golang-migrate/migrate/v4"
	_ "github.com/golang-migrate/migrate/v4/database/postgres"
	_ "github.com/golang-migrate/migrate/v4/source/file"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgconn"
	"github.com/jackc/pgx/v5/pgxpool"

	"github.com/goofr-group/gaming-store/server/internal/config"
	"github.com/goofr-group/gaming-store/server/internal/store/data/tx"
)

// Common failure descriptions.
const (
	descriptionFailedScanRow = "store: failed to scan row"
	descriptionFailedExec    = "store: failed to exec"
)

// migrationsURL defines the source url of the migrations.
const migrationsURL = "file://database/migrations"

// store defines the data store structure.
type store struct {
	database *pgxpool.Pool
}

// New returns a new data store.
func New(ctx context.Context, config config.Database) (*store, error) {
	// Initialize database connection pool.
	database, err := pgxpool.New(ctx, config.URL)
	if err != nil {
		return nil, fmt.Errorf("store: failed to initialize pool: %w", err)
	}

	// Apply migrations based on the configuration.
	if config.Migrations.Apply {
		m, err := migrate.New(migrationsURL, config.URL)
		if err != nil {
			return nil, fmt.Errorf("store: failed to initialize migrate: %w", err)
		}
		defer m.Close()

		if err := m.Migrate(config.Migrations.Version); err != nil && !errors.Is(err, migrate.ErrNoChange) {
			return nil, fmt.Errorf("store: failed to apply migrations: %w", err)
		}
	}

	return &store{
		database: database,
	}, nil
}

// NewTx returns a new transaction for the current database.
func (s *store) NewTx(ctx context.Context, isoLevel pgx.TxIsoLevel, accessMode pgx.TxAccessMode) (pgx.Tx, error) {
	return tx.New(ctx, s.database, isoLevel, accessMode)
}

// Close closes the database.
func (s *store) Close() {
	s.database.Close()
}

// constraintNameFromError returns the name of the constraint of the given error.
// If the error is not of type pgconn.PgError, an empty string is returned.
func constraintNameFromError(err error) string {
	var pgErr *pgconn.PgError
	if errors.As(err, &pgErr) {
		return pgErr.ConstraintName
	}

	return ""
}
