package http

import (
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"

	"github.com/goofr-group/gaming-store/server/api"
	"github.com/goofr-group/gaming-store/server/internal/domain"
	"github.com/goofr-group/gaming-store/server/internal/logging"
)

const (
	codeGameNotFound                   = "game_not_found"
	codeGamePreviewMultimediaNotFound  = "game_preview_multimedia_not_found"
	codeGameDownloadMultimediaNotFound = "game_download_multimedia_not_found"

	errGameNotFound                   = "game not found"
	errGamePreviewMultimediaNotFound  = "game preview multimedia not found"
	errGameDownloadMultimediaNotFound = "game download multimedia not found"
)

// ListGames handles the http request to list games.
func (h *handler) ListGames(w http.ResponseWriter, r *http.Request, params api.ListGamesParams) {
	ctx := r.Context()

	domainGamesFilter := listGamesParamsToDomain(params)

	domainPaginatedGames, err := h.service.ListGames(ctx, domainGamesFilter)
	if err != nil {
		var domainFilterValueInvalidError *domain.FilterValueInvalidError

		switch {
		case errors.As(err, &domainFilterValueInvalidError):
			badRequest(w, codeFilterValueInvalid, fmt.Sprintf("%s: %s", errFilterValueInvalid, domainFilterValueInvalidError.FilterName))
		default:
			internalServerError(w)
		}

		return
	}

	gamesPaginated := gamesPaginatedFromDomain(domainPaginatedGames)

	responseBody, err := json.Marshal(gamesPaginated)
	if err != nil {
		logging.Logger.ErrorContext(ctx, descriptionFailedToMarshalResponseBody, logging.Error(err))
		internalServerError(w)

		return
	}

	writeResponseJSON(w, http.StatusOK, responseBody)
}

// ListRecommendedGames handles the http request to list recommended games.
func (h *handler) ListRecommendedGames(w http.ResponseWriter, r *http.Request, params api.ListRecommendedGamesParams) {
	w.WriteHeader(http.StatusNotImplemented)
}

// CreateGame handles the http request to create a game.
func (h *handler) CreateGame(w http.ResponseWriter, r *http.Request, publisherID api.PublisherIdPathParam) {
	ctx := r.Context()

	requestBody, err := io.ReadAll(r.Body)
	if err != nil {
		badRequest(w, codeRequestBodyInvalid, errRequestBodyInvalid)
		return
	}

	var gamePost api.GamePost

	err = json.Unmarshal(requestBody, &gamePost)
	if err != nil {
		badRequest(w, codeRequestBodyInvalid, errRequestBodyInvalid)
		return
	}

	domainEditableGame, err := gamePostToDomain(gamePost)
	if err != nil {
		var domainFieldValueInvalidError *domain.FieldValueInvalidError

		switch {
		case errors.As(err, &domainFieldValueInvalidError):
			badRequest(w, codeFieldValueInvalid, fmt.Sprintf("%s: %s", errFieldValueInvalid, domainFieldValueInvalidError.FieldName))
		default:
			internalServerError(w)
		}

		return
	}

	domainGame, err := h.service.CreateGame(ctx, publisherID, domainEditableGame)
	if err != nil {
		var domainFieldValueInvalidError *domain.FieldValueInvalidError

		switch {
		case errors.As(err, &domainFieldValueInvalidError):
			badRequest(w, codeFieldValueInvalid, fmt.Sprintf("%s: %s", errFieldValueInvalid, domainFieldValueInvalidError.FieldName))
		case errors.Is(err, domain.ErrPublisherNotFound):
			notFound(w, codePublisherNotFound, errPublisherNotFound)
		case errors.Is(err, domain.ErrGamePreviewMultimediaNotFound):
			conflict(w, codeGamePreviewMultimediaNotFound, errGamePreviewMultimediaNotFound)
		case errors.Is(err, domain.ErrGameDownloadMultimediaNotFound):
			conflict(w, codeGameDownloadMultimediaNotFound, errGameDownloadMultimediaNotFound)
		default:
			internalServerError(w)
		}

		return
	}

	game := gameFromDomain(domainGame)

	responseBody, err := json.Marshal(game)
	if err != nil {
		logging.Logger.ErrorContext(ctx, descriptionFailedToMarshalResponseBody, logging.Error(err))
		internalServerError(w)

		return
	}

	writeResponseJSON(w, http.StatusCreated, responseBody)
}

// GetGameByID handles the http request to get a game by ID.
func (h *handler) GetGameByID(w http.ResponseWriter, r *http.Request, publisherID api.PublisherIdPathParam, gameID api.GameIdPathParam) {
	ctx := r.Context()

	domainGame, err := h.service.GetGameByID(ctx, gameID)
	if err != nil {
		switch {
		case errors.Is(err, domain.ErrGameNotFound):
			notFound(w, codeGameNotFound, errGameNotFound)
		default:
			internalServerError(w)
		}

		return
	}

	game := gameFromDomain(domainGame)

	responseBody, err := json.Marshal(game)
	if err != nil {
		logging.Logger.ErrorContext(ctx, descriptionFailedToMarshalResponseBody, logging.Error(err))
		internalServerError(w)

		return
	}

	writeResponseJSON(w, http.StatusOK, responseBody)
}

// PatchGameByID handles the http request to modify a game by ID.
func (h *handler) PatchGameByID(w http.ResponseWriter, r *http.Request, publisherID api.PublisherIdPathParam, gameID api.GameIdPathParam) {
	ctx := r.Context()

	requestBody, err := io.ReadAll(r.Body)
	if err != nil {
		badRequest(w, codeRequestBodyInvalid, errRequestBodyInvalid)
		return
	}

	var gamePatch api.GamePatch

	err = json.Unmarshal(requestBody, &gamePatch)
	if err != nil {
		badRequest(w, codeRequestBodyInvalid, errRequestBodyInvalid)
		return
	}

	domainEditableGame, err := gamePatchToDomain(gamePatch)
	if err != nil {
		var domainFieldValueInvalidError *domain.FieldValueInvalidError

		switch {
		case errors.As(err, &domainFieldValueInvalidError):
			badRequest(w, codeFieldValueInvalid, fmt.Sprintf("%s: %s", errFieldValueInvalid, domainFieldValueInvalidError.FieldName))
		default:
			internalServerError(w)
		}

		return
	}

	domainGame, err := h.service.PatchGame(ctx, gameID, domainEditableGame)
	if err != nil {
		var domainFieldValueInvalidError *domain.FieldValueInvalidError

		switch {
		case errors.As(err, &domainFieldValueInvalidError):
			badRequest(w, codeFieldValueInvalid, fmt.Sprintf("%s: %s", errFieldValueInvalid, domainFieldValueInvalidError.FieldName))
		case errors.Is(err, domain.ErrGameNotFound):
			notFound(w, codeGameNotFound, errGameNotFound)
		case errors.Is(err, domain.ErrGamePreviewMultimediaNotFound):
			conflict(w, codeGamePreviewMultimediaNotFound, errGamePreviewMultimediaNotFound)
		case errors.Is(err, domain.ErrGameDownloadMultimediaNotFound):
			conflict(w, codeGameDownloadMultimediaNotFound, errGameDownloadMultimediaNotFound)
		default:
			internalServerError(w)
		}

		return
	}

	game := gameFromDomain(domainGame)

	responseBody, err := json.Marshal(game)
	if err != nil {
		logging.Logger.ErrorContext(ctx, descriptionFailedToMarshalResponseBody, logging.Error(err))
		internalServerError(w)

		return
	}

	writeResponseJSON(w, http.StatusOK, responseBody)
}

// listGamesParamsToDomain returns a domain games paginated filter based on the standardized list games parameters.
func listGamesParamsToDomain(params api.ListGamesParams) domain.GamesPaginatedFilter {
	domainSort := domain.GamePaginatedSortTitle

	if params.Sort != nil {
		switch *params.Sort {
		case api.Title:
			domainSort = domain.GamePaginatedSortTitle
		case api.Price:
			domainSort = domain.GamePaginatedSortPrice
		case api.ReleaseDate:
			domainSort = domain.GamePaginatedSortReleaseDate
		case api.UserCount:
			domainSort = domain.GamePaginatedSortUserCount
		default:
			domainSort = domain.GamePaginatedSort(*params.Sort)
		}
	}

	return domain.GamesPaginatedFilter{
		PaginatedRequest: paginatedRequestToDomain(
			domainSort,
			(*api.OrderQueryParam)(params.Order),
			params.Limit,
			params.Offset,
		),
		PublisherID:       params.PublisherId,
		Title:             (*domain.GameTitle)(params.Title),
		PriceUnder:        (*domain.GamePrice)(params.PriceUnder),
		PriceAbove:        (*domain.GamePrice)(params.PriceAbove),
		IsActive:          params.IsActive,
		ReleaseDateBefore: optionalDateToOptionalTime(params.ReleaseDateBefore),
		ReleaseDateAfter:  optionalDateToOptionalTime(params.ReleaseDateAfter),
		TagIDs:            params.TagIds,
	}
}

// gamePostToDomain returns a domain editable game based on the standardized game post.
func gamePostToDomain(gamePost api.GamePost) (domain.EditableGame, error) {
	languages, err := languagesToDomain(gamePost.Languages)
	if err != nil {
		return domain.EditableGame{}, err
	}

	return domain.EditableGame{
		Title:       domain.GameTitle(gamePost.Title),
		Price:       domain.GamePrice(gamePost.Price),
		IsActive:    gamePost.IsActive,
		ReleaseDate: optionalDateToOptionalTime(gamePost.ReleaseDate),
		Description: domain.GameDescription(gamePost.Description),
		AgeRating:   domain.GameAgeRating(gamePost.AgeRating),
		Features:    domain.GameFeatures(gamePost.Features),
		Languages:   languages,
		Requirements: domain.GameRequirements{
			Minimum:     domain.GameRequirement(gamePost.Requirements.Minimum),
			Recommended: domain.GameRequirement(gamePost.Requirements.Recommended),
		},
		PreviewMultimediaID:  gamePost.PreviewMultimediaId,
		DownloadMultimediaID: gamePost.DownloadMultimediaId,
	}, nil
}

// gamePatchToDomain returns a domain patchable game based on the standardized game patch.
func gamePatchToDomain(gamePatch api.GamePatch) (domain.EditableGamePatch, error) {
	var languages *domain.GameLanguages

	if gamePatch.Languages != nil {
		temp, err := languagesToDomain(*gamePatch.Languages)
		if err != nil {
			return domain.EditableGamePatch{}, err
		}

		languages = (*domain.GameLanguages)(&temp)
	}

	var requirements *domain.GameRequirements

	if gamePatch.Requirements != nil {
		temp := domain.GameRequirements{
			Minimum:     domain.GameRequirement(gamePatch.Requirements.Minimum),
			Recommended: domain.GameRequirement(gamePatch.Requirements.Recommended),
		}
		requirements = &temp
	}

	return domain.EditableGamePatch{
		Title:                (*domain.GameTitle)(gamePatch.Title),
		Price:                (*domain.GamePrice)(gamePatch.Price),
		IsActive:             gamePatch.IsActive,
		ReleaseDate:          optionalDateToOptionalTime(gamePatch.ReleaseDate),
		Description:          (*domain.GameDescription)(gamePatch.Description),
		AgeRating:            (*domain.GameAgeRating)(gamePatch.AgeRating),
		Features:             (*domain.GameFeatures)(gamePatch.Features),
		Languages:            languages,
		Requirements:         requirements,
		PreviewMultimediaID:  gamePatch.PreviewMultimediaId,
		DownloadMultimediaID: gamePatch.DownloadMultimediaId,
	}, nil
}

// gameFromDomain returns a standardized game based on the domain model.
func gameFromDomain(game domain.Game) api.Game {
	return api.Game{
		Id:          game.ID,
		Publisher:   publisherFromDomain(game.Publisher),
		Title:       string(game.Title),
		Price:       float64(game.Price),
		IsActive:    game.IsActive,
		ReleaseDate: optionalDateFromOptionalTime(game.ReleaseDate),
		Description: string(game.Description),
		AgeRating:   string(game.AgeRating),
		Features:    string(game.Features),
		Languages:   game.Languages.String(),
		Requirements: api.GameRequirements{
			Minimum:     string(game.Requirements.Minimum),
			Recommended: string(game.Requirements.Recommended),
		},
		PreviewMultimedia:  multimediaFromDomain(game.PreviewMultimedia),
		DownloadMultimedia: optionalMultimediaFromDomain(game.DownloadMultimedia),
		Multimedia:         multimediaSliceFromDomain(game.Multimedia),
		Tags:               tagsFromDomain(game.Tags),
		CreatedAt:          game.CreatedAt,
		ModifiedAt:         game.ModifiedAt,
	}
}

// gamesFromDomain returns standardized games based on the domain model.
func gamesFromDomain(games []domain.Game) []api.Game {
	g := make([]api.Game, len(games))

	for i := 0; i < len(games); i++ {
		g[i] = gameFromDomain(games[i])
	}

	return g
}

// gamesPaginatedFromDomain returns a standardized games paginated response based on the domain model.
func gamesPaginatedFromDomain(paginatedResponse domain.PaginatedResponse[domain.Game]) api.GamesPaginated {
	return api.GamesPaginated{
		Total: paginatedResponse.Total,
		Games: gamesFromDomain(paginatedResponse.Results),
	}
}
