package service

import (
	"context"
	"log/slog"

	"github.com/jackc/pgx/v5"

	"github.com/goofr-group/gaming-store/server/internal/domain"
	"github.com/goofr-group/gaming-store/server/internal/logging"
)

const (
	descriptionFailedListTags = "service: failed to list tags"
)

// ListTags returns the tags with the specified filter.
func (s *service) ListTags(ctx context.Context, filter domain.TagsPaginatedFilter) (domain.PaginatedResponse[domain.Tag], error) {
	logAttrs := []any{
		slog.String(logging.ServiceMethod, "ListTags"),
	}

	if filter.Sort != nil && !filter.Sort.Valid() {
		return domain.PaginatedResponse[domain.Tag]{}, logInfoAndWrapError(ctx, &domain.FilterValueInvalidError{FilterName: domain.FieldFilterSort}, descriptionInvalidFilterValue, logAttrs...)
	}

	if !filter.Order.Valid() {
		return domain.PaginatedResponse[domain.Tag]{}, logInfoAndWrapError(ctx, &domain.FilterValueInvalidError{FilterName: domain.FieldFilterOrder}, descriptionInvalidFilterValue, logAttrs...)
	}

	if !filter.Limit.Valid() {
		return domain.PaginatedResponse[domain.Tag]{}, logInfoAndWrapError(ctx, &domain.FilterValueInvalidError{FilterName: domain.FieldFilterLimit}, descriptionInvalidFilterValue, logAttrs...)
	}

	if !filter.Offset.Valid() {
		return domain.PaginatedResponse[domain.Tag]{}, logInfoAndWrapError(ctx, &domain.FilterValueInvalidError{FilterName: domain.FieldFilterOffset}, descriptionInvalidFilterValue, logAttrs...)
	}

	var (
		paginatedTags domain.PaginatedResponse[domain.Tag]
		err           error
	)

	err = s.readOnlyTx(ctx, func(tx pgx.Tx) error {
		paginatedTags, err = s.dataStore.ListTags(ctx, tx, filter)
		return err
	})
	if err != nil {
		return domain.PaginatedResponse[domain.Tag]{}, logAndWrapError(ctx, err, descriptionFailedListTags, logAttrs...)
	}

	return paginatedTags, nil
}
