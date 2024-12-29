//go:build integration

package data

import (
	"context"
	"os"
	"testing"

	"github.com/golang-migrate/migrate/v4"
	"github.com/golang-migrate/migrate/v4/source/iofs"
	"github.com/jackc/pgx/v5"
	"github.com/stretchr/testify/require"

	"github.com/goofr-group/gaming-store/server/database"
	"github.com/goofr-group/gaming-store/server/internal/config"
	"github.com/goofr-group/gaming-store/server/internal/logging"
	"github.com/goofr-group/gaming-store/server/test/container"
)

// s defines the store used for testing purposes.
// It is initialized by TestMain.
var s *store

func TestMain(m *testing.M) {
	ctx := context.Background()

	databaseContainer := container.NewDatabase(ctx)
	connectionString := databaseContainer.ConnectionString(ctx)

	var err error

	driver, err := iofs.New(database.FileSystemMigrations, "migrations")
	if err != nil {
		logging.Logger.ErrorContext(ctx, "store: failed to initialize iofs driver", logging.Error(err))
	}

	migrations, err := migrate.NewWithSourceInstance("iofs", driver, connectionString)
	if err != nil {
		logging.Logger.ErrorContext(ctx, "store: failed to initialize migrate", logging.Error(err))
	}
	defer migrations.Close()

	err = migrations.Up()
	if err != nil {
		logging.Logger.ErrorContext(ctx, "store: failed to apply migrations", logging.Error(err))
	}

	s, err = New(ctx, config.Database{
		URL: connectionString,
	})
	if err != nil {
		logging.Logger.ErrorContext(ctx, "store: failed to initialize database", logging.Error(err))
	}

	code := m.Run()

	os.Exit(code)
}

// newTx returns a new transaction for testing purposes using the global variable s.
// It also registers a cleanup function that rollbacks the transaction and truncates all the database tables.
func newTx(t *testing.T, ctx context.Context) pgx.Tx {
	t.Helper()

	tx, err := s.NewTx(ctx, pgx.ReadCommitted, pgx.ReadWrite)
	require.NoError(t, err)

	t.Cleanup(func() {
		err := tx.Rollback(ctx)
		require.NoError(t, err)

		cleanup(t, ctx)
	})

	return tx
}

// cleanup cleans the store s by truncating all the database tables, excluding the essential ones.
func cleanup(t *testing.T, ctx context.Context) {
	t.Helper()

	tx, err := s.NewTx(ctx, pgx.ReadCommitted, pgx.ReadWrite)
	require.NoError(t, err)

	defer func() {
		err := tx.Rollback(ctx)
		require.NoError(t, err)
	}()

	_, err = tx.Exec(ctx, `
	    DO $$ 
		DECLARE
			r RECORD;
		BEGIN
			FOR r IN (
				SELECT tablename 
				FROM pg_tables 
				WHERE schemaname = 'public' AND tablename NOT IN ('schema_migrations', 'tags')
			) LOOP
				EXECUTE 'TRUNCATE TABLE ' || quote_ident(r.tablename) || ' CASCADE';
			END LOOP;
		END $$;
	`)
	require.NoError(t, err)

	err = tx.Commit(ctx)
	require.NoError(t, err)
}
