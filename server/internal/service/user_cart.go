package service

import (
	"context"
	"errors"
	"log/slog"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"

	"github.com/goofr-group/gaming-store/server/internal/domain"
	"github.com/goofr-group/gaming-store/server/internal/logging"
)

const (
	descriptionFailedCreateUserCartGame = "service: failed to create user cart game association"
	descriptionFailedListUserCart       = "service: failed to list user cart"
	descriptionFailedDeleteUserCartGame = "service: failed to delete user cart game association"
)

// CreateUserCartGame creates a user cart game association.
func (s *service) CreateUserCartGame(ctx context.Context, userID, gameID uuid.UUID) error {
	logAttrs := []any{
		slog.String(logging.ServiceMethod, "CreateUserCartGame"),
		slog.String(logging.UserID, userID.String()),
		slog.String(logging.GameID, gameID.String()),
	}

	err := s.readWriteTx(ctx, func(tx pgx.Tx) error {
		game, err := s.dataStore.GetGameByID(ctx, tx, gameID)
		if err != nil {
			return err
		}

		if !game.IsActive {
			return domain.ErrGameNotActive
		}

		now := time.Now().UTC()

		if game.ReleaseDate == nil || game.ReleaseDate.After(now) {
			return domain.ErrGameNotReleased
		}

		user, err := s.dataStore.GetUserByID(ctx, tx, userID)
		if err != nil {
			return err
		}

		dateOfBirth := user.DateOfBirth.Time().UTC()

		age := now.Year() - dateOfBirth.Year()
		if now.YearDay() < dateOfBirth.YearDay() {
			age--
		}

		if game.AgeRating.Value() > age {
			return domain.ErrUserNotOldEnough
		}

		ok, err := s.dataStore.ExistsUserLibraryGame(ctx, tx, userID, gameID)
		if err != nil {
			return err
		}

		if ok {
			return domain.ErrUserLibraryGameAlreadyExists
		}

		return s.dataStore.CreateUserCartGame(ctx, tx, userID, gameID)
	})
	if err != nil {
		switch {
		case errors.Is(err, domain.ErrUserCartGameAlreadyExists),
			errors.Is(err, domain.ErrUserNotFound),
			errors.Is(err, domain.ErrGameNotFound),
			errors.Is(err, domain.ErrGameNotActive),
			errors.Is(err, domain.ErrGameNotReleased),
			errors.Is(err, domain.ErrUserNotOldEnough),
			errors.Is(err, domain.ErrUserLibraryGameAlreadyExists):
			return logInfoAndWrapError(ctx, err, descriptionFailedCreateUserCartGame, logAttrs...)
		default:
			return logAndWrapError(ctx, err, descriptionFailedCreateUserCartGame, logAttrs...)
		}
	}

	return nil
}

// ListUserCart returns the user cart with the specified filter.
func (s *service) ListUserCart(ctx context.Context, userID uuid.UUID, filter domain.UserCartPaginatedFilter) (domain.PaginatedResponse[domain.Game], error) {
	logAttrs := []any{
		slog.String(logging.ServiceMethod, "ListUserCart"),
		slog.String(logging.UserID, userID.String()),
	}

	if filter.Sort != nil && !filter.Sort.Valid() {
		return domain.PaginatedResponse[domain.Game]{}, logInfoAndWrapError(ctx, &domain.FilterValueInvalidError{FilterName: domain.FieldFilterSort}, descriptionInvalidFilterValue, logAttrs...)
	}

	if !filter.Order.Valid() {
		return domain.PaginatedResponse[domain.Game]{}, logInfoAndWrapError(ctx, &domain.FilterValueInvalidError{FilterName: domain.FieldFilterOrder}, descriptionInvalidFilterValue, logAttrs...)
	}

	if !filter.Limit.Valid() {
		return domain.PaginatedResponse[domain.Game]{}, logInfoAndWrapError(ctx, &domain.FilterValueInvalidError{FilterName: domain.FieldFilterLimit}, descriptionInvalidFilterValue, logAttrs...)
	}

	if !filter.Offset.Valid() {
		return domain.PaginatedResponse[domain.Game]{}, logInfoAndWrapError(ctx, &domain.FilterValueInvalidError{FilterName: domain.FieldFilterOffset}, descriptionInvalidFilterValue, logAttrs...)
	}

	var (
		paginatedGames domain.PaginatedResponse[domain.Game]
		err            error
	)

	err = s.readOnlyTx(ctx, func(tx pgx.Tx) error {
		paginatedGames, err = s.dataStore.ListUserCart(ctx, tx, userID, filter)
		return err
	})
	if err != nil {
		return domain.PaginatedResponse[domain.Game]{}, logAndWrapError(ctx, err, descriptionFailedListUserCart, logAttrs...)
	}

	return paginatedGames, nil
}

// DeleteUserCartGame deletes the user cart game association.
func (s *service) DeleteUserCartGame(ctx context.Context, userID, gameID uuid.UUID) error {
	logAttrs := []any{
		slog.String(logging.ServiceMethod, "DeleteUserCartGame"),
		slog.String(logging.UserID, userID.String()),
		slog.String(logging.GameID, gameID.String()),
	}

	err := s.readWriteTx(ctx, func(tx pgx.Tx) error {
		return s.dataStore.DeleteUserCartGame(ctx, tx, userID, gameID)
	})
	if err != nil {
		switch {
		case errors.Is(err, domain.ErrUserCartGameNotFound):
			return logInfoAndWrapError(ctx, err, descriptionFailedDeleteUserCartGame, logAttrs...)
		default:
			return logAndWrapError(ctx, err, descriptionFailedDeleteUserCartGame, logAttrs...)
		}
	}

	return nil
}
