package http

import (
	"time"

	oapitypes "github.com/oapi-codegen/runtime/types"
	"golang.org/x/text/language"

	"github.com/goofr-group/gaming-store/server/api"
	"github.com/goofr-group/gaming-store/server/internal/domain"
)

const (
	paginationLimitDefaultValue  = 100
	paginationOffsetDefaultValue = 0
)

// dateFromTime returns a standardized date based on the time model.
func dateFromTime(time time.Time) oapitypes.Date {
	return oapitypes.Date{
		Time: time.UTC(),
	}
}

// optionalDateFromOptionalTime returns a standardized optional date based on the optional time model.
func optionalDateFromOptionalTime(time *time.Time) *oapitypes.Date {
	var t *oapitypes.Date

	if time != nil {
		temp := dateFromTime(*time)
		t = &temp
	}

	return t
}

// optionalDateToOptionalTime returns an optional time structure based on the standardized optional date model.
func optionalDateToOptionalTime(date *oapitypes.Date) *time.Time {
	var time *time.Time

	if date != nil {
		temp := date.Time
		time = &temp
	}

	return time
}

// countryToDomain returns a domain country based on the standardized string model.
func countryToDomain(s string) (domain.Country, error) {
	region, err := language.ParseRegion(s)
	if err != nil {
		return domain.Country{}, &domain.FieldValueInvalidError{FieldName: domain.FieldCountry}
	}

	return domain.Country{Region: region}, nil
}

// languageToDomain returns a domain language based on the standardized string model.
func languageToDomain(s string) (domain.Language, error) {
	tag, err := language.Parse(s)
	if err != nil {
		return domain.Language{}, &domain.FieldValueInvalidError{FieldName: domain.FieldLanguage}
	}

	return domain.Language{Tag: tag}, nil
}

// languagesToDomain returns a domain languages based on the standardized string model.
func languagesToDomain(s []string) ([]domain.Language, error) {
	languages := make([]domain.Language, len(s))

	for i, l := range s {
		language, err := languageToDomain(l)
		if err != nil {
			return nil, &domain.FieldValueInvalidError{FieldName: domain.FieldLanguages}
		}

		languages[i] = language
	}

	return languages, nil
}

// jwtFromJWTToken returns a standardized JWT based on the JWT token.
func jwtFromJWTToken(token string) api.JWT {
	return api.JWT{
		Token: token,
	}
}

// orderToDomain returns a domain order based on the standardized query parameter model.
func orderToDomain(order *api.OrderQueryParam) domain.PaginationOrder {
	if order == nil {
		return domain.PaginationOrderAsc
	}

	switch *order {
	case api.OrderQueryParamAsc:
		return domain.PaginationOrderAsc
	case api.OrderQueryParamDesc:
		return domain.PaginationOrderDesc
	default:
		return domain.PaginationOrder(*order)
	}
}

// limitToDomain returns a domain pagination limit based on the standardized query parameter model.
func limitToDomain(limit *api.LimitQueryParam) domain.PaginationLimit {
	if limit == nil {
		return domain.PaginationLimit(paginationLimitDefaultValue)
	}

	return domain.PaginationLimit(*limit)
}

// offsetToDomain returns a domain pagination offset based on the standardized query parameter model.
func offsetToDomain(offset *api.OffsetQueryParam) domain.PaginationOffset {
	if offset == nil {
		return domain.PaginationOffset(paginationOffsetDefaultValue)
	}

	return domain.PaginationOffset(*offset)
}

// paginatedRequestBaseToDomain returns a domain paginated request base based on the standardized query parameter models.
func paginatedRequestBaseToDomain(limit *api.LimitQueryParam, offset *api.OffsetQueryParam) domain.PaginatedRequestBase {
	return domain.PaginatedRequestBase{
		Limit:  limitToDomain(limit),
		Offset: offsetToDomain(offset),
	}
}

// paginatedRequestToDomain returns a domain paginated request based on the standardized query parameter models.
func paginatedRequestToDomain[T any](sort domain.PaginationSort[T], order *api.OrderQueryParam, limit *api.LimitQueryParam, offset *api.OffsetQueryParam) domain.PaginatedRequest[T] {
	return domain.PaginatedRequest[T]{
		PaginatedRequestBase: paginatedRequestBaseToDomain(limit, offset),
		Sort:                 sort,
		Order:                orderToDomain(order),
	}
}
