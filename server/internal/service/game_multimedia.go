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
	descriptionFailedCreateGameMultimedia = "service: failed to create game multimedia association"
	descriptionFailedDeleteGameMultimedia = "service: failed to delete game multimedia association"
)

// CreateGameMultimedia creates a game multimedia association.
func (s *service) CreateGameMultimedia(ctx context.Context, gameID, multimediaID uuid.UUID, editableGameMultimedia domain.EditableGameMultimedia) error {
	logAttrs := []any{
		slog.String(logging.ServiceMethod, "CreateGameMultimedia"),
		slog.String(logging.GameID, gameID.String()),
		slog.String(logging.MultimediaID, multimediaID.String()),
	}

	err := s.readWriteTx(ctx, func(tx pgx.Tx) error {
		return s.dataStore.CreateGameMultimedia(ctx, tx, gameID, multimediaID, editableGameMultimedia)
	})
	if err != nil {
		switch {
		case errors.Is(err, domain.ErrGameMultimediaAlreadyExists),
			errors.Is(err, domain.ErrGameNotFound),
			errors.Is(err, domain.ErrMultimediaNotFound):
			return logInfoAndWrapError(ctx, err, descriptionFailedCreateGameMultimedia, logAttrs...)
		default:
			return logAndWrapError(ctx, err, descriptionFailedCreateGameMultimedia, logAttrs...)
		}
	}

	return nil
}

// DeleteGameMultimedia deletes the game multimedia association.
func (s *service) DeleteGameMultimedia(ctx context.Context, gameID, multimediaID uuid.UUID) error {
	logAttrs := []any{
		slog.String(logging.ServiceMethod, "DeleteGameMultimedia"),
		slog.String(logging.GameID, gameID.String()),
		slog.String(logging.MultimediaID, multimediaID.String()),
	}

	err := s.readWriteTx(ctx, func(tx pgx.Tx) error {
		return s.dataStore.DeleteGameMultimedia(ctx, tx, gameID, multimediaID)
	})
	if err != nil {
		switch {
		case errors.Is(err, domain.ErrGameMultimediaNotFound):
			return logInfoAndWrapError(ctx, err, descriptionFailedDeleteGameMultimedia, logAttrs...)
		default:
			return logAndWrapError(ctx, err, descriptionFailedDeleteGameMultimedia, logAttrs...)
		}
	}

	return nil
}
