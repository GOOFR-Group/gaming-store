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
	descriptionFailedCreateGame           = "service: failed to create game"
	descriptionFailedListGames            = "service: failed to list games"
	descriptionFailedListGamesRecommended = "service: failed to list recommended games"
	descriptionFailedGetGameByID          = "service: failed to get game by id"
	descriptionFailedPatchGame            = "service: failed to patch game"
)

// CreateGame creates a new game with the specified data.
func (s *service) CreateGame(ctx context.Context, publisherID uuid.UUID, editableGame domain.EditableGame) (domain.Game, error) {
	logAttrs := []any{
		slog.String(logging.ServiceMethod, "CreateGame"),
		slog.String(logging.GameTitle, string(editableGame.Title)),
		slog.Float64(logging.GamePrice, float64(editableGame.Price)),
		slog.Bool(logging.GameIsActive, editableGame.IsActive),
		slog.String(logging.GameAgeRating, string(editableGame.AgeRating)),
		slog.String(logging.GamePreviewMultimediaID, editableGame.PreviewMultimediaID.String()),
	}

	if !editableGame.Title.Valid() {
		return domain.Game{}, logInfoAndWrapError(ctx, &domain.FieldValueInvalidError{FieldName: domain.FieldTitle}, descriptionInvalidFieldValue, logAttrs...)
	}

	if !editableGame.Price.Valid() {
		return domain.Game{}, logInfoAndWrapError(ctx, &domain.FieldValueInvalidError{FieldName: domain.FieldPrice}, descriptionInvalidFieldValue, logAttrs...)
	}

	if !editableGame.Description.Valid() {
		return domain.Game{}, logInfoAndWrapError(ctx, &domain.FieldValueInvalidError{FieldName: domain.FieldDescription}, descriptionInvalidFieldValue, logAttrs...)
	}

	if !editableGame.AgeRating.Valid() {
		return domain.Game{}, logInfoAndWrapError(ctx, &domain.FieldValueInvalidError{FieldName: domain.FieldAgeRating}, descriptionInvalidFieldValue, logAttrs...)
	}

	if !editableGame.Features.Valid() {
		return domain.Game{}, logInfoAndWrapError(ctx, &domain.FieldValueInvalidError{FieldName: domain.FieldFeatures}, descriptionInvalidFieldValue, logAttrs...)
	}

	if !editableGame.Languages.Valid() {
		return domain.Game{}, logInfoAndWrapError(ctx, &domain.FieldValueInvalidError{FieldName: domain.FieldLanguages}, descriptionInvalidFieldValue, logAttrs...)
	}

	if !editableGame.Requirements.Valid() {
		return domain.Game{}, logInfoAndWrapError(ctx, &domain.FieldValueInvalidError{FieldName: domain.FieldRequirements}, descriptionInvalidFieldValue, logAttrs...)
	}

	if editableGame.ReleaseDate != nil && editableGame.DownloadMultimediaID == nil {
		return domain.Game{}, logInfoAndWrapError(ctx, &domain.FieldValueInvalidError{FieldName: domain.FieldDownloadMultimediaID}, descriptionInvalidFieldValue, logAttrs...)
	}

	var game domain.Game

	err := s.readWriteTx(ctx, func(tx pgx.Tx) error {
		id, err := s.dataStore.CreateGame(ctx, tx, publisherID, editableGame)
		if err != nil {
			return err
		}

		game, err = s.dataStore.GetGameByID(ctx, tx, id)
		if err != nil {
			return err
		}

		return nil
	})
	if err != nil {
		switch {
		case errors.Is(err, domain.ErrPublisherNotFound),
			errors.Is(err, domain.ErrGamePreviewMultimediaNotFound),
			errors.Is(err, domain.ErrGameDownloadMultimediaNotFound):
			return domain.Game{}, logInfoAndWrapError(ctx, err, descriptionFailedCreateGame, logAttrs...)
		default:
			return domain.Game{}, logAndWrapError(ctx, err, descriptionFailedCreateGame, logAttrs...)
		}
	}

	return game, nil
}

// ListGames returns the games with the specified filter.
func (s *service) ListGames(ctx context.Context, filter domain.GamesPaginatedFilter) (domain.PaginatedResponse[domain.Game], error) {
	logAttrs := []any{
		slog.String(logging.ServiceMethod, "ListGames"),
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
		paginatedGames, err = s.dataStore.ListGames(ctx, tx, filter)
		return err
	})
	if err != nil {
		return domain.PaginatedResponse[domain.Game]{}, logAndWrapError(ctx, err, descriptionFailedListGames, logAttrs...)
	}

	return paginatedGames, nil
}

// ListGamesRecommended returns the recommended games with the specified filter.
func (s *service) ListGamesRecommended(ctx context.Context, filter domain.GamesRecommendedPaginatedFilter) (domain.PaginatedResponse[domain.Game], error) {
	logAttrs := []any{
		slog.String(logging.ServiceMethod, "ListGamesRecommended"),
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
		paginatedGames, err = s.dataStore.ListGamesRecommended(ctx, tx, filter)
		return err
	})
	if err != nil {
		return domain.PaginatedResponse[domain.Game]{}, logAndWrapError(ctx, err, descriptionFailedListGamesRecommended, logAttrs...)
	}

	return paginatedGames, nil
}

// GetGameByID returns the game with the specified identifier.
func (s *service) GetGameByID(ctx context.Context, id uuid.UUID) (domain.Game, error) {
	logAttrs := []any{
		slog.String(logging.ServiceMethod, "GetGameByID"),
		slog.String(logging.GameID, id.String()),
	}

	var (
		game domain.Game
		err  error
	)

	err = s.readOnlyTx(ctx, func(tx pgx.Tx) error {
		game, err = s.dataStore.GetGameByID(ctx, tx, id)
		return err
	})
	if err != nil {
		switch {
		case errors.Is(err, domain.ErrGameNotFound):
			return domain.Game{}, logInfoAndWrapError(ctx, err, descriptionFailedGetGameByID, logAttrs...)
		default:
			return domain.Game{}, logAndWrapError(ctx, err, descriptionFailedGetGameByID, logAttrs...)
		}
	}

	return game, nil
}

// PatchGame modifies the game with the specified identifier.
func (s *service) PatchGame(ctx context.Context, id uuid.UUID, editableGame domain.EditableGamePatch) (domain.Game, error) {
	logAttrs := []any{
		slog.String(logging.ServiceMethod, "PatchGame"),
		slog.String(logging.GameID, id.String()),
	}

	if editableGame.Title != nil && !editableGame.Title.Valid() {
		return domain.Game{}, logInfoAndWrapError(ctx, &domain.FieldValueInvalidError{FieldName: domain.FieldTitle}, descriptionInvalidFieldValue, logAttrs...)
	}

	if editableGame.Price != nil && !editableGame.Price.Valid() {
		return domain.Game{}, logInfoAndWrapError(ctx, &domain.FieldValueInvalidError{FieldName: domain.FieldPrice}, descriptionInvalidFieldValue, logAttrs...)
	}

	if editableGame.Description != nil && !editableGame.Description.Valid() {
		return domain.Game{}, logInfoAndWrapError(ctx, &domain.FieldValueInvalidError{FieldName: domain.FieldDescription}, descriptionInvalidFieldValue, logAttrs...)
	}

	if editableGame.AgeRating != nil && !editableGame.AgeRating.Valid() {
		return domain.Game{}, logInfoAndWrapError(ctx, &domain.FieldValueInvalidError{FieldName: domain.FieldAgeRating}, descriptionInvalidFieldValue, logAttrs...)
	}

	if editableGame.Features != nil && !editableGame.Features.Valid() {
		return domain.Game{}, logInfoAndWrapError(ctx, &domain.FieldValueInvalidError{FieldName: domain.FieldFeatures}, descriptionInvalidFieldValue, logAttrs...)
	}

	if editableGame.Languages != nil && !editableGame.Languages.Valid() {
		return domain.Game{}, logInfoAndWrapError(ctx, &domain.FieldValueInvalidError{FieldName: domain.FieldLanguages}, descriptionInvalidFieldValue, logAttrs...)
	}

	if editableGame.Requirements != nil && !editableGame.Requirements.Valid() {
		return domain.Game{}, logInfoAndWrapError(ctx, &domain.FieldValueInvalidError{FieldName: domain.FieldRequirements}, descriptionInvalidFieldValue, logAttrs...)
	}

	var (
		game domain.Game
		err  error
	)

	err = s.readWriteTx(ctx, func(tx pgx.Tx) error {
		err = s.dataStore.PatchGame(ctx, tx, id, editableGame)
		if err != nil {
			return err
		}

		game, err = s.dataStore.GetGameByID(ctx, tx, id)
		if err != nil {
			return err
		}

		if game.ReleaseDate != nil && game.DownloadMultimedia == nil {
			return &domain.FieldValueInvalidError{FieldName: domain.FieldDownloadMultimediaID}
		}

		return nil
	})
	if err != nil {
		var fieldValueInvalidError *domain.FieldValueInvalidError

		switch {
		case errors.Is(err, domain.ErrGameNotFound),
			errors.Is(err, domain.ErrGamePreviewMultimediaNotFound),
			errors.Is(err, domain.ErrGameDownloadMultimediaNotFound):
			return domain.Game{}, logInfoAndWrapError(ctx, err, descriptionFailedPatchGame, logAttrs...)
		case errors.As(err, &fieldValueInvalidError):
			return domain.Game{}, logInfoAndWrapError(ctx, err, descriptionInvalidFieldValue, logAttrs...)
		default:
			return domain.Game{}, logAndWrapError(ctx, err, descriptionFailedPatchGame, logAttrs...)
		}
	}

	return game, nil
}
