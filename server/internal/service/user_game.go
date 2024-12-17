package service

import (
	"context"
	"log/slog"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"

	"github.com/goofr-group/gaming-store/server/internal/domain"
	"github.com/goofr-group/gaming-store/server/internal/logging"
)

const (
	descriptionFailedListUserLibraryGames = "service: failed to list user library games"
)

// ListUserLibraryGames returns the user library games with the specified filter.
func (s *service) ListUserLibraryGames(ctx context.Context, userID uuid.UUID, filter domain.UserLibraryGamesPaginatedFilter) (domain.PaginatedResponse[domain.Game], error) {
	logAttrs := []any{
		slog.String(logging.ServiceMethod, "ListUserLibraryGames"),
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
		paginatedGames, err = s.dataStore.ListUserLibraryGames(ctx, tx, userID, filter)
		return err
	})
	if err != nil {
		return domain.PaginatedResponse[domain.Game]{}, logAndWrapError(ctx, err, descriptionFailedListUserLibraryGames, logAttrs...)
	}

	return paginatedGames, nil
}
