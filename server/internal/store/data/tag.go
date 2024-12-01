package data

import (
	"github.com/jackc/pgx/v5"

	"github.com/goofr-group/gaming-store/server/internal/domain"
)

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
