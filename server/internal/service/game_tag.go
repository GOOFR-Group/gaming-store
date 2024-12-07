package service

import (
	"context"
	"errors"
	"log/slog"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"

	"github.com/goofr-group/gaming-store/server/internal/domain"
	"github.com/goofr-group/gaming-store/server/internal/logging"
)

const (
	descriptionFailedCreateGameTag = "service: failed to create game tag association"
	descriptionFailedDeleteGameTag = "service: failed to delete game tag association"
)

// CreateGameTag creates a game tag association.
func (s *service) CreateGameTag(ctx context.Context, gameID, tagID uuid.UUID) error {
	logAttrs := []any{
		slog.String(logging.ServiceMethod, "CreateGameTag"),
		slog.String(logging.GameID, gameID.String()),
		slog.String(logging.TagID, tagID.String()),
	}

	err := s.readWriteTx(ctx, func(tx pgx.Tx) error {
		return s.dataStore.CreateGameTag(ctx, tx, gameID, tagID)
	})
	if err != nil {
		switch {
		case errors.Is(err, domain.ErrGameTagAlreadyExists),
			errors.Is(err, domain.ErrGameNotFound),
			errors.Is(err, domain.ErrTagNotFound):
			return logInfoAndWrapError(ctx, err, descriptionFailedCreateGameTag, logAttrs...)
		default:
			return logAndWrapError(ctx, err, descriptionFailedCreateGameTag, logAttrs...)
		}
	}

	return nil
}

// DeleteGameTag deletes the game tag association.
func (s *service) DeleteGameTag(ctx context.Context, gameID, tagID uuid.UUID) error {
	logAttrs := []any{
		slog.String(logging.ServiceMethod, "DeleteGameTag"),
		slog.String(logging.GameID, gameID.String()),
		slog.String(logging.TagID, tagID.String()),
	}

	err := s.readWriteTx(ctx, func(tx pgx.Tx) error {
		return s.dataStore.DeleteGameTag(ctx, tx, gameID, tagID)
	})
	if err != nil {
		switch {
		case errors.Is(err, domain.ErrGameTagNotFound):
			return logInfoAndWrapError(ctx, err, descriptionFailedDeleteGameTag, logAttrs...)
		default:
			return logAndWrapError(ctx, err, descriptionFailedDeleteGameTag, logAttrs...)
		}
	}

	return nil
}
