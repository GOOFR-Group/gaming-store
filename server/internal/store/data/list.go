package data

import (
	"fmt"
	"strings"

	"github.com/goofr-group/gaming-store/server/internal/domain"
)

// listSQLWhereOperator defines the function type that returns an SQL WHERE clause using a specific operator for the
// given positional parameter.
type listSQLWhereOperator func(position int) string

func listSQLWhereOperatorILike(field string) listSQLWhereOperator {
	return func(position int) string {
		return fmt.Sprintf("%s ILIKE '%%' || $%d || '%%'", field, position)
	}
}

func listSQLWhereOperatorEqual(field string) listSQLWhereOperator {
	return func(position int) string {
		return fmt.Sprintf("%s = $%d", field, position)
	}
}

func listSQLWhereOperatorGreaterThanEqual(field string) listSQLWhereOperator {
	return func(position int) string {
		return fmt.Sprintf("%s >= $%d", field, position)
	}
}

func listSQLWhereOperatorLessThanEqual(field string) listSQLWhereOperator {
	return func(position int) string {
		return fmt.Sprintf("%s <= $%d", field, position)
	}
}

func listSQLWhereOperatorArrayContainsArray(field string) listSQLWhereOperator {
	return func(position int) string {
		return fmt.Sprintf("%s @> $%d", field, position)
	}
}

func listSQLWhereOperatorArraysOverlap(field string) listSQLWhereOperator {
	return func(position int) string {
		return fmt.Sprintf("%s && $%d", field, position)
	}
}

// listSQLWhere returns an SQL WHERE clause for the specified filter fields.
func listSQLWhere(fields []listSQLWhereOperator) string {
	if len(fields) == 0 {
		return ""
	}

	operators := make([]string, len(fields))

	for i, field := range fields {
		operators[i] = field(i + 1)
	}

	return " WHERE " + strings.Join(operators, " AND ")
}

// listSQLOrder returns an SQL ORDER keyword for the specified field and order.
func listSQLOrder(field string, order domain.PaginationOrder, secondaryField *string) string {
	o := " ASC"
	if order == domain.PaginationOrderDesc {
		o = " DESC"
	}

	sql := " ORDER BY " + field + o

	if secondaryField != nil {
		sql += ", " + *secondaryField
	}

	return sql
}

// listSQLLimitOffset returns an SQL LIMIT and OFFSET clause for the specified limit and offset.
func listSQLLimitOffset(limit domain.PaginationLimit, offset domain.PaginationOffset) string {
	return fmt.Sprintf(" LIMIT %d OFFSET %d", limit, offset)
}
