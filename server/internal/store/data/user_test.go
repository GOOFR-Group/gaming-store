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

func TestStore_CreateUser(t *testing.T) {
	t.Run("should successfully create user", func(t *testing.T) {
		ctx := context.Background()

		tx := newTx(t, ctx)

		multimediaObject := domain.MultimediaObject{
			Checksum:  crc32.ChecksumIEEE([]byte("test")),
			MediaType: "png",
			URL:       "url",
		}

		multimediaID, err := s.CreateMultimedia(ctx, tx, multimediaObject)
		require.NoError(t, err)

		editableUser := domain.EditableUserWithPassword{
			EditableUser: domain.EditableUser{
				Username:            "username",
				Email:               "user@email.com",
				DisplayName:         "user name",
				DateOfBirth:         domain.UserDateOfBirth(time.Date(2000, 02, 01, 0, 0, 0, 0, time.UTC)),
				Address:             "address",
				Country:             domain.Country{Region: language.MustParseRegion("pt")},
				Vatin:               "123456789",
				PictureMultimediaID: &multimediaID,
			},
			Password: "password",
		}

		userID, err := s.CreateUser(ctx, tx, editableUser)
		require.NoError(t, err)
		assert.NotZero(t, userID)

		user, err := s.GetUserByID(ctx, tx, userID)
		require.NoError(t, err)
		assert.Equal(t, userID, user.ID)
		assert.Equal(t, editableUser.Username, user.Username)
		assert.Equal(t, editableUser.Email, user.Email)
		assert.Equal(t, editableUser.DisplayName, user.DisplayName)
		assert.Equal(t, editableUser.DateOfBirth, user.DateOfBirth)
		assert.Equal(t, editableUser.Address, user.Address)
		assert.Equal(t, editableUser.Country, user.Country)
		assert.Equal(t, editableUser.Vatin, user.Vatin)
		assert.Zero(t, user.Balance)
		assert.Equal(t, multimediaObject, user.PictureMultimedia.MultimediaObject)
		assert.Equal(t, multimediaID, user.PictureMultimedia.ID)
		assert.NotZero(t, user.PictureMultimedia.CreatedAt)
		assert.NotZero(t, user.CreatedAt)
		assert.NotZero(t, user.ModifiedAt)
	})

	t.Run("should fail", func(t *testing.T) {
		t.Run("when username already exists", func(t *testing.T) {
			ctx := context.Background()

			tx := newTx(t, ctx)

			editableUser1 := domain.EditableUserWithPassword{
				EditableUser: domain.EditableUser{
					Username:            "username 1",
					Email:               "user1@email.com",
					DisplayName:         "user name 1",
					DateOfBirth:         domain.UserDateOfBirth(time.Date(2000, 02, 01, 0, 0, 0, 0, time.UTC)),
					Address:             "address",
					Country:             domain.Country{Region: language.MustParseRegion("pt")},
					Vatin:               "1",
					PictureMultimediaID: nil,
				},
				Password: "password",
			}

			editableUser2 := domain.EditableUserWithPassword{
				EditableUser: domain.EditableUser{
					Username:            "username 1",
					Email:               "user2@email.com",
					DisplayName:         "user name 2",
					DateOfBirth:         domain.UserDateOfBirth(time.Date(2000, 02, 01, 0, 0, 0, 0, time.UTC)),
					Address:             "address",
					Country:             domain.Country{Region: language.MustParseRegion("pt")},
					Vatin:               "2",
					PictureMultimediaID: nil,
				},
				Password: "password",
			}

			_, err := s.CreateUser(ctx, tx, editableUser1)
			require.NoError(t, err)

			expectedError := fmt.Errorf("%s: %w", descriptionFailedScanRow, domain.ErrUserUsernameAlreadyExists)

			_, err = s.CreateUser(ctx, tx, editableUser2)
			assert.Equal(t, expectedError, err)
		})

		t.Run("when email already exists", func(t *testing.T) {
			ctx := context.Background()

			tx := newTx(t, ctx)

			editableUser1 := domain.EditableUserWithPassword{
				EditableUser: domain.EditableUser{
					Username:            "username 1",
					Email:               "user1@email.com",
					DisplayName:         "user name 1",
					DateOfBirth:         domain.UserDateOfBirth(time.Date(2000, 02, 01, 0, 0, 0, 0, time.UTC)),
					Address:             "address",
					Country:             domain.Country{Region: language.MustParseRegion("pt")},
					Vatin:               "1",
					PictureMultimediaID: nil,
				},
				Password: "password",
			}

			editableUser2 := domain.EditableUserWithPassword{
				EditableUser: domain.EditableUser{
					Username:            "username 2",
					Email:               "user1@email.com",
					DisplayName:         "user name 2",
					DateOfBirth:         domain.UserDateOfBirth(time.Date(2000, 02, 01, 0, 0, 0, 0, time.UTC)),
					Address:             "address",
					Country:             domain.Country{Region: language.MustParseRegion("pt")},
					Vatin:               "2",
					PictureMultimediaID: nil,
				},
				Password: "password",
			}

			_, err := s.CreateUser(ctx, tx, editableUser1)
			require.NoError(t, err)

			expectedError := fmt.Errorf("%s: %w", descriptionFailedScanRow, domain.ErrUserEmailAlreadyExists)

			_, err = s.CreateUser(ctx, tx, editableUser2)
			assert.Equal(t, expectedError, err)
		})

		t.Run("when vatin already exists", func(t *testing.T) {
			ctx := context.Background()

			tx := newTx(t, ctx)

			editableUser1 := domain.EditableUserWithPassword{
				EditableUser: domain.EditableUser{
					Username:            "username 1",
					Email:               "user1@email.com",
					DisplayName:         "user name 1",
					DateOfBirth:         domain.UserDateOfBirth(time.Date(2000, 02, 01, 0, 0, 0, 0, time.UTC)),
					Address:             "address",
					Country:             domain.Country{Region: language.MustParseRegion("pt")},
					Vatin:               "1",
					PictureMultimediaID: nil,
				},
				Password: "password",
			}

			editableUser2 := domain.EditableUserWithPassword{
				EditableUser: domain.EditableUser{
					Username:            "username 2",
					Email:               "user2@email.com",
					DisplayName:         "user name 2",
					DateOfBirth:         domain.UserDateOfBirth(time.Date(2000, 02, 01, 0, 0, 0, 0, time.UTC)),
					Address:             "address",
					Country:             domain.Country{Region: language.MustParseRegion("pt")},
					Vatin:               "1",
					PictureMultimediaID: nil,
				},
				Password: "password",
			}

			_, err := s.CreateUser(ctx, tx, editableUser1)
			require.NoError(t, err)

			expectedError := fmt.Errorf("%s: %w", descriptionFailedScanRow, domain.ErrUserVatinAlreadyExists)

			_, err = s.CreateUser(ctx, tx, editableUser2)
			assert.Equal(t, expectedError, err)
		})

		t.Run("when picture multimedia is not found", func(t *testing.T) {
			ctx := context.Background()

			tx := newTx(t, ctx)

			multimediaID := uuid.New()

			editableUser := domain.EditableUserWithPassword{
				EditableUser: domain.EditableUser{
					Username:            "username",
					Email:               "user@email.com",
					DisplayName:         "user name",
					DateOfBirth:         domain.UserDateOfBirth(time.Date(2000, 02, 01, 0, 0, 0, 0, time.UTC)),
					Address:             "address",
					Country:             domain.Country{Region: language.MustParseRegion("pt")},
					Vatin:               "123456789",
					PictureMultimediaID: &multimediaID,
				},
				Password: "password",
			}

			expectedError := fmt.Errorf("%s: %w", descriptionFailedScanRow, domain.ErrMultimediaNotFound)

			_, err := s.CreateUser(ctx, tx, editableUser)
			assert.Equal(t, expectedError, err)
		})
	})
}
