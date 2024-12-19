package data

import (
	"context"
	"fmt"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"

	"github.com/goofr-group/gaming-store/server/internal/domain"
)

const (
	constraintUsersCartsPkey       = "users_carts_pkey"
	constraintUsersCartsUserIDFkey = "users_carts_user_id_fkey"
	constraintUsersCartsGameIDFkey = "users_carts_game_id_fkey"
)

// CreateUserCartGame executes a query to create a user cart game association with the specified identifiers.
func (s *store) CreateUserCartGame(ctx context.Context, tx pgx.Tx, userID, gameID uuid.UUID) error {
	_, err := tx.Exec(ctx, `
		INSERT INTO users_carts (user_id, game_id)
		VALUES ($1, $2)
	`,
		userID,
		gameID,
	)
	if err != nil {
		switch constraintNameFromError(err) {
		case constraintUsersCartsPkey:
			return fmt.Errorf("%s: %w", descriptionFailedExec, domain.ErrUserCartGameAlreadyExists)
		case constraintUsersCartsUserIDFkey:
			return fmt.Errorf("%s: %w", descriptionFailedExec, domain.ErrUserNotFound)
		case constraintUsersCartsGameIDFkey:
			return fmt.Errorf("%s: %w", descriptionFailedExec, domain.ErrGameNotFound)
		}

		return fmt.Errorf("%s: %w", descriptionFailedExec, err)
	}

	return nil
}

// DeleteUserCartGame executes a query to delete the user cart game association with the specified identifiers.
func (s *store) DeleteUserCartGame(ctx context.Context, tx pgx.Tx, userID, gameID uuid.UUID) error {
	commandTag, err := tx.Exec(ctx, `
		DELETE FROM users_carts
		WHERE user_id = $1 AND game_id = $2
	`,
		userID,
		gameID,
	)
	if err != nil {
		return fmt.Errorf("%s: %w", descriptionFailedExec, err)
	}

	if commandTag.RowsAffected() == 0 {
		return fmt.Errorf("%s: %w", descriptionFailedExec, domain.ErrUserCartGameNotFound)
	}

	return nil
}

// DeleteUserCart executes a query to delete all the user cart games association with the specified identifier.
func (s *store) DeleteUserCart(ctx context.Context, tx pgx.Tx, userID uuid.UUID) error {
	_, err := tx.Exec(ctx, `
		DELETE FROM users_carts
		WHERE user_id = $1
	`,
		userID,
	)
	if err != nil {
		return fmt.Errorf("%s: %w", descriptionFailedExec, err)
	}

	return nil
}
