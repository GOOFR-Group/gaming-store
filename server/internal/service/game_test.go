package service

import (
	"context"
	"errors"
	"fmt"
	"testing"
	"time"

	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"go.uber.org/mock/gomock"
	"golang.org/x/text/language"

	"github.com/goofr-group/gaming-store/server/internal/domain"
)

func TestService_CreateGame(t *testing.T) {
	t.Run("should successfully create game", func(t *testing.T) {
		var (
			ctx = context.Background()

			publisherID = uuid.New()
			gameID      = uuid.New()

			editableGame = domain.EditableGame{
				Title:       "game",
				Price:       9.99,
				IsActive:    true,
				Description: "description",
				AgeRating:   "18",
				Features:    "features",
				Languages:   domain.GameLanguages{domain.Language{Tag: language.Portuguese}},
				Requirements: domain.GameRequirements{
					Minimum:     "minimum",
					Recommended: "recommended",
				},
			}
			expectedGame = domain.Game{
				ID:           gameID,
				Title:        editableGame.Title,
				Price:        editableGame.Price,
				IsActive:     editableGame.IsActive,
				Description:  editableGame.Description,
				AgeRating:    editableGame.AgeRating,
				Features:     editableGame.Features,
				Languages:    editableGame.Languages,
				Requirements: editableGame.Requirements,
				CreatedAt:    time.Now(),
				ModifiedAt:   time.Now(),
			}
		)

		ctrl := gomock.NewController(t)

		s := newServiceTest(ctrl)
		tx := s.newReadWriteTx(ctx, ctrl)

		gomock.InOrder(
			s.mockDataStore.EXPECT().
				CreateGame(ctx, tx, publisherID, editableGame).
				Return(gameID, nil),
			s.mockDataStore.EXPECT().
				GetGameByID(ctx, tx, gameID).
				Return(expectedGame, nil),
		)

		game, err := s.service.CreateGame(ctx, publisherID, editableGame)
		require.NoError(t, err)
		assert.Equal(t, expectedGame, game)
	})

	t.Run("should fail", func(t *testing.T) {
		t.Run("when a field is invalid", func(t *testing.T) {
			var (
				ctx = context.Background()

				publisherID = uuid.New()

				editableGame = domain.EditableGame{
					Title:       "game",
					Price:       -9.99,
					IsActive:    true,
					Description: "description",
					AgeRating:   "18",
					Features:    "features",
					Languages:   domain.GameLanguages{domain.Language{Tag: language.Portuguese}},
					Requirements: domain.GameRequirements{
						Minimum:     "minimum",
						Recommended: "recommended",
					},
				}

				expectedError = fmt.Errorf("%s: %w", descriptionInvalidFieldValue, &domain.FieldValueInvalidError{FieldName: domain.FieldPrice})
			)

			ctrl := gomock.NewController(t)

			s := newServiceTest(ctrl)

			_, err := s.service.CreateGame(ctx, publisherID, editableGame)
			assert.Equal(t, expectedError, err)
		})

		t.Run("when the store fails", func(t *testing.T) {
			t.Run("when creating the game", func(t *testing.T) {
				var (
					ctx = context.Background()

					publisherID = uuid.New()

					editableGame = domain.EditableGame{
						Title:       "game",
						Price:       9.99,
						IsActive:    true,
						Description: "description",
						AgeRating:   "18",
						Features:    "features",
						Languages:   domain.GameLanguages{domain.Language{Tag: language.Portuguese}},
						Requirements: domain.GameRequirements{
							Minimum:     "minimum",
							Recommended: "recommended",
						},
					}

					errTest       = errors.New("error test")
					expectedError = fmt.Errorf("%s: %w", descriptionFailedCreateGame, errTest)
				)

				ctrl := gomock.NewController(t)

				s := newServiceTest(ctrl)
				tx := s.newReadWriteTx(ctx, ctrl)

				gomock.InOrder(
					s.mockDataStore.EXPECT().
						CreateGame(ctx, tx, publisherID, editableGame).
						Return(uuid.UUID{}, errTest),
				)

				_, err := s.service.CreateGame(ctx, publisherID, editableGame)
				assert.Equal(t, expectedError, err)
			})

			t.Run("when getting the game", func(t *testing.T) {
				var (
					ctx = context.Background()

					publisherID = uuid.New()
					gameID      = uuid.New()

					editableGame = domain.EditableGame{
						Title:       "game",
						Price:       9.99,
						IsActive:    true,
						Description: "description",
						AgeRating:   "18",
						Features:    "features",
						Languages:   domain.GameLanguages{domain.Language{Tag: language.Portuguese}},
						Requirements: domain.GameRequirements{
							Minimum:     "minimum",
							Recommended: "recommended",
						},
					}

					errTest       = errors.New("error test")
					expectedError = fmt.Errorf("%s: %w", descriptionFailedCreateGame, errTest)
				)

				ctrl := gomock.NewController(t)

				s := newServiceTest(ctrl)
				tx := s.newReadWriteTx(ctx, ctrl)

				gomock.InOrder(
					s.mockDataStore.EXPECT().
						CreateGame(ctx, tx, publisherID, editableGame).
						Return(gameID, nil),
					s.mockDataStore.EXPECT().
						GetGameByID(ctx, tx, gameID).
						Return(domain.Game{}, errTest),
				)

				_, err := s.service.CreateGame(ctx, publisherID, editableGame)
				assert.Equal(t, expectedError, err)
			})
		})
	})
}
