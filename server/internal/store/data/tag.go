package data

import (
	"context"
	"fmt"

	"github.com/jackc/pgx/v5"

	"github.com/goofr-group/gaming-store/server/internal/domain"
)

// ListTags executes a query to return the tags for the specified filter.
func (s *store) ListTags(ctx context.Context, tx pgx.Tx, filter domain.TagsPaginatedFilter) (domain.PaginatedResponse[domain.Tag], error) {
	row := tx.QueryRow(ctx, `
		SELECT count(t.id) 
		FROM tags t
	`)

	var total int

	err := row.Scan(&total)
	if err != nil {
		return domain.PaginatedResponse[domain.Tag]{}, fmt.Errorf("%s: %w", descriptionFailedScanRow, err)
	}

	var domainSortField domain.TagPaginatedSort
	if filter.Sort != nil {
		domainSortField = filter.Sort.Field()
	}

	var (
		sortField          = "t.name"
		sortFieldSecondary *string
	)

	switch domainSortField {
	case domain.TagPaginatedSortName:
		sortField = "t.name"
	case domain.TagPaginatedSortGameCount:
		sortField = "count(gt.game_id)"
		temp := "t.name"
		sortFieldSecondary = &temp
	}

	rows, err := tx.Query(ctx, `
		SELECT t.id, t.name, t.description, t.created_at, t.modified_at
		FROM tags t
		LEFT JOIN games_tags gt ON gt.tag_id = t.id
		GROUP BY t.id
	`+listSQLOrder(sortField, filter.Order, sortFieldSecondary)+listSQLLimitOffset(filter.Limit, filter.Offset))
	if err != nil {
		return domain.PaginatedResponse[domain.Tag]{}, fmt.Errorf("%s: %w", descriptionFailedQuery, err)
	}
	defer rows.Close()

	tags, err := getTagsFromRows(rows)
	if err != nil {
		return domain.PaginatedResponse[domain.Tag]{}, fmt.Errorf("%s: %w", descriptionFailedScanRows, err)
	}

	return domain.PaginatedResponse[domain.Tag]{
		Total:   total,
		Results: tags,
	}, nil
}

// getTagFromRow returns the tag by scanning the given row.
func getTagFromRow(row pgx.Row) (domain.Tag, error) {
	var tag domain.Tag

	err := row.Scan(
		&tag.ID,
		&tag.Name,
		&tag.Description,
		&tag.CreatedAt,
		&tag.ModifiedAt,
	)
	if err != nil {
		return domain.Tag{}, err
	}

	return tag, nil
}

// getTagsFromRows returns the tags by scanning the given rows.
func getTagsFromRows(rows pgx.Rows) ([]domain.Tag, error) {
	var tags []domain.Tag

	for rows.Next() {
		tag, err := getTagFromRow(rows)
		if err != nil {
			return nil, err
		}

		tags = append(tags, tag)
	}

	return tags, nil
}
