//go:build integration

package data

import (
	"context"
	"fmt"
	"hash/crc32"
	"testing"
	"time"

	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"golang.org/x/text/language"

	"github.com/goofr-group/gaming-store/server/internal/domain"
)

func TestStore_CreateGame(t *testing.T) {
	t.Run("should successfully create game", func(t *testing.T) {
		ctx := context.Background()

		tx := newTx(t, ctx)

		// Create publisher.
		multimediaObject := domain.MultimediaObject{
			Checksum:  crc32.ChecksumIEEE([]byte("test")),
			MediaType: "png",
			URL:       "url",
		}

		multimediaID, err := s.CreateMultimedia(ctx, tx, multimediaObject)
		require.NoError(t, err)

		editablePublisher := domain.EditablePublisherWithPassword{
			EditablePublisher: domain.EditablePublisher{
				Email:               "publisher@email.com",
				Name:                "publisher name",
				Address:             "address",
				Country:             domain.Country{Region: language.MustParseRegion("pt")},
				Vatin:               "123456789",
				PictureMultimediaID: &multimediaID,
			},
			Password: "password",
		}

		publisherID, err := s.CreatePublisher(ctx, tx, editablePublisher)
		require.NoError(t, err)
		assert.NotZero(t, publisherID)

		publisher, err := s.GetPublisherByID(ctx, tx, publisherID)
		require.NoError(t, err)

		// Create preview multimedia.
		previewMultimediaObject := domain.MultimediaObject{
			Checksum:  crc32.ChecksumIEEE([]byte("preview")),
			MediaType: "png",
			URL:       "preview url",
		}

		previewMultimediaID, err := s.CreateMultimedia(ctx, tx, previewMultimediaObject)
		require.NoError(t, err)

		// Create download multimedia.
		downloadMultimediaObject := domain.MultimediaObject{
			Checksum:  crc32.ChecksumIEEE([]byte("download")),
			MediaType: "zip",
			URL:       "download url",
		}

		downloadMultimediaID, err := s.CreateMultimedia(ctx, tx, downloadMultimediaObject)
		require.NoError(t, err)

		releaseDate := time.Date(2024, 12, 25, 0, 0, 0, 0, time.UTC)

		// Create game.
		editableGame := domain.EditableGame{
			Title:       "title",
			Price:       9.99,
			IsActive:    true,
			ReleaseDate: &releaseDate,
			Description: "description",
			AgeRating:   "18",
			Features:    "features",
			Languages: domain.GameLanguages{
				{Tag: language.Portuguese},
				{Tag: language.English},
			},
			Requirements: domain.GameRequirements{
				Minimum:     "minimum requirements",
				Recommended: "recommended requirements",
			},
			PreviewMultimediaID:  previewMultimediaID,
			DownloadMultimediaID: &downloadMultimediaID,
		}

		gameID, err := s.CreateGame(ctx, tx, publisherID, editableGame)
		require.NoError(t, err)
		assert.NotZero(t, gameID)

		// Create game multimedia.
		err = s.CreateGameMultimedia(ctx, tx, gameID, previewMultimediaID, domain.EditableGameMultimedia{
			Position: 0,
		})
		require.NoError(t, err)

		err = s.CreateGameMultimedia(ctx, tx, gameID, multimediaID, domain.EditableGameMultimedia{
			Position: 1,
		})
		require.NoError(t, err)

		// Create game tags.
		tags, err := s.ListTags(ctx, tx, domain.TagsPaginatedFilter{
			PaginatedRequest: domain.PaginatedRequest[domain.TagPaginatedSort]{
				PaginatedRequestBase: domain.PaginatedRequestBase{
					Limit: 2,
				},
				Sort: domain.TagPaginatedSortName,
			},
		})
		require.NoError(t, err)
		require.Len(t, tags.Results, 2)

		err = s.CreateGameTag(ctx, tx, gameID, tags.Results[0].ID)
		require.NoError(t, err)

		err = s.CreateGameTag(ctx, tx, gameID, tags.Results[1].ID)
		require.NoError(t, err)

		// Assert game data.
		game, err := s.GetGameByID(ctx, tx, gameID)
		require.NoError(t, err)
		assert.Equal(t, gameID, game.ID)
		assert.Equal(t, publisher, game.Publisher)
		assert.Equal(t, editableGame.Title, game.Title)
		assert.Equal(t, editableGame.Price, game.Price)
		assert.Equal(t, editableGame.IsActive, game.IsActive)
		assert.Equal(t, editableGame.ReleaseDate, game.ReleaseDate)
		assert.Equal(t, editableGame.Description, game.Description)
		assert.Equal(t, editableGame.AgeRating, game.AgeRating)
		assert.Equal(t, editableGame.Features, game.Features)
		assert.Equal(t, editableGame.Languages, game.Languages)
		assert.Equal(t, editableGame.Requirements, game.Requirements)
		assert.NotZero(t, game.CreatedAt)
		assert.NotZero(t, game.ModifiedAt)

		assert.Equal(t, previewMultimediaObject, game.PreviewMultimedia.MultimediaObject)
		assert.Equal(t, previewMultimediaID, game.PreviewMultimedia.ID)
		assert.NotZero(t, game.PreviewMultimedia.CreatedAt)

		assert.Equal(t, downloadMultimediaObject, game.DownloadMultimedia.MultimediaObject)
		assert.Equal(t, downloadMultimediaID, game.DownloadMultimedia.ID)
		assert.NotZero(t, game.DownloadMultimedia.CreatedAt)

		assert.Equal(t, previewMultimediaObject, game.Multimedia[0].MultimediaObject)
		assert.Equal(t, previewMultimediaID, game.Multimedia[0].ID)
		assert.NotZero(t, game.Multimedia[0].CreatedAt)

		assert.Equal(t, multimediaObject, game.Multimedia[1].MultimediaObject)
		assert.Equal(t, multimediaID, game.Multimedia[1].ID)
		assert.NotZero(t, game.Multimedia[1].CreatedAt)

		assert.Equal(t, tags.Results[0], game.Tags[0])
		assert.Equal(t, tags.Results[1], game.Tags[1])
	})

	t.Run("should fail", func(t *testing.T) {
		t.Run("when publisher is not found", func(t *testing.T) {
			ctx := context.Background()

			tx := newTx(t, ctx)

			multimediaObject := domain.MultimediaObject{
				Checksum:  crc32.ChecksumIEEE([]byte("test")),
				MediaType: "png",
				URL:       "url",
			}

			multimediaID, err := s.CreateMultimedia(ctx, tx, multimediaObject)
			require.NoError(t, err)

			releaseDate := time.Date(2024, 12, 25, 0, 0, 0, 0, time.UTC)

			editableGame := domain.EditableGame{
				Title:       "title",
				Price:       9.99,
				IsActive:    true,
				ReleaseDate: &releaseDate,
				Description: "description",
				AgeRating:   "18",
				Features:    "features",
				Languages: domain.GameLanguages{
					{Tag: language.Portuguese},
					{Tag: language.English},
				},
				Requirements: domain.GameRequirements{
					Minimum:     "minimum requirements",
					Recommended: "recommended requirements",
				},
				PreviewMultimediaID:  multimediaID,
				DownloadMultimediaID: &multimediaID,
			}

			expectedError := fmt.Errorf("%s: %w", descriptionFailedScanRow, domain.ErrPublisherNotFound)

			_, err = s.CreateGame(ctx, tx, uuid.New(), editableGame)
			require.Equal(t, expectedError, err)
		})

		t.Run("when preview multimedia is not found", func(t *testing.T) {
			ctx := context.Background()

			tx := newTx(t, ctx)

			multimediaObject := domain.MultimediaObject{
				Checksum:  crc32.ChecksumIEEE([]byte("test")),
				MediaType: "png",
				URL:       "url",
			}

			multimediaID, err := s.CreateMultimedia(ctx, tx, multimediaObject)
			require.NoError(t, err)

			editablePublisher := domain.EditablePublisherWithPassword{
				EditablePublisher: domain.EditablePublisher{
					Email:               "publisher@email.com",
					Name:                "publisher name",
					Address:             "address",
					Country:             domain.Country{Region: language.MustParseRegion("pt")},
					Vatin:               "123456789",
					PictureMultimediaID: &multimediaID,
				},
				Password: "password",
			}

			publisherID, err := s.CreatePublisher(ctx, tx, editablePublisher)
			require.NoError(t, err)
			assert.NotZero(t, publisherID)

			releaseDate := time.Date(2024, 12, 25, 0, 0, 0, 0, time.UTC)

			editableGame := domain.EditableGame{
				Title:       "title",
				Price:       9.99,
				IsActive:    true,
				ReleaseDate: &releaseDate,
				Description: "description",
				AgeRating:   "18",
				Features:    "features",
				Languages: domain.GameLanguages{
					{Tag: language.Portuguese},
					{Tag: language.English},
				},
				Requirements: domain.GameRequirements{
					Minimum:     "minimum requirements",
					Recommended: "recommended requirements",
				},
				PreviewMultimediaID:  uuid.New(),
				DownloadMultimediaID: &multimediaID,
			}

			expectedError := fmt.Errorf("%s: %w", descriptionFailedScanRow, domain.ErrGamePreviewMultimediaNotFound)

			_, err = s.CreateGame(ctx, tx, publisherID, editableGame)
			require.Equal(t, expectedError, err)
		})

		t.Run("when download multimedia is not found", func(t *testing.T) {
			ctx := context.Background()

			tx := newTx(t, ctx)

			multimediaObject := domain.MultimediaObject{
				Checksum:  crc32.ChecksumIEEE([]byte("test")),
				MediaType: "png",
				URL:       "url",
			}

			multimediaID, err := s.CreateMultimedia(ctx, tx, multimediaObject)
			require.NoError(t, err)

			editablePublisher := domain.EditablePublisherWithPassword{
				EditablePublisher: domain.EditablePublisher{
					Email:               "publisher@email.com",
					Name:                "publisher name",
					Address:             "address",
					Country:             domain.Country{Region: language.MustParseRegion("pt")},
					Vatin:               "123456789",
					PictureMultimediaID: &multimediaID,
				},
				Password: "password",
			}

			publisherID, err := s.CreatePublisher(ctx, tx, editablePublisher)
			require.NoError(t, err)
			assert.NotZero(t, publisherID)

			releaseDate := time.Date(2024, 12, 25, 0, 0, 0, 0, time.UTC)
			downloadMultimediaID := uuid.New()

			editableGame := domain.EditableGame{
				Title:       "title",
				Price:       9.99,
				IsActive:    true,
				ReleaseDate: &releaseDate,
				Description: "description",
				AgeRating:   "18",
				Features:    "features",
				Languages: domain.GameLanguages{
					{Tag: language.Portuguese},
					{Tag: language.English},
				},
				Requirements: domain.GameRequirements{
					Minimum:     "minimum requirements",
					Recommended: "recommended requirements",
				},
				PreviewMultimediaID:  multimediaID,
				DownloadMultimediaID: &downloadMultimediaID,
			}

			expectedError := fmt.Errorf("%s: %w", descriptionFailedScanRow, domain.ErrGameDownloadMultimediaNotFound)

			_, err = s.CreateGame(ctx, tx, publisherID, editableGame)
			require.Equal(t, expectedError, err)
		})
	})
}
