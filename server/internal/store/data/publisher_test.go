//go:build integration

package data

import (
	"context"
	"fmt"
	"hash/crc32"
	"testing"

	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"golang.org/x/text/language"

	"github.com/goofr-group/gaming-store/server/internal/domain"
)

func TestStore_CreatePublisher(t *testing.T) {
	t.Run("should successfully create publisher", func(t *testing.T) {
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

		publisher, err := s.GetPublisherByID(ctx, tx, publisherID)
		require.NoError(t, err)
		assert.Equal(t, publisherID, publisher.ID)
		assert.Equal(t, editablePublisher.Email, publisher.Email)
		assert.Equal(t, editablePublisher.Name, publisher.Name)
		assert.Equal(t, editablePublisher.Address, publisher.Address)
		assert.Equal(t, editablePublisher.Country, publisher.Country)
		assert.Equal(t, editablePublisher.Vatin, publisher.Vatin)
		assert.Equal(t, multimediaObject, publisher.PictureMultimedia.MultimediaObject)
		assert.Equal(t, multimediaID, publisher.PictureMultimedia.ID)
		assert.NotZero(t, publisher.PictureMultimedia.CreatedAt)
		assert.NotZero(t, publisher.CreatedAt)
		assert.NotZero(t, publisher.ModifiedAt)
	})

	t.Run("should fail", func(t *testing.T) {
		t.Run("when email already exists", func(t *testing.T) {
			ctx := context.Background()

			tx := newTx(t, ctx)

			editablePublisher1 := domain.EditablePublisherWithPassword{
				EditablePublisher: domain.EditablePublisher{
					Email:               "publisher1@email.com",
					Name:                "publisher name 1",
					Address:             "address",
					Country:             domain.Country{Region: language.MustParseRegion("pt")},
					Vatin:               "1",
					PictureMultimediaID: nil,
				},
				Password: "password",
			}

			editablePublisher2 := domain.EditablePublisherWithPassword{
				EditablePublisher: domain.EditablePublisher{
					Email:               "publisher1@email.com",
					Name:                "publisher name 2",
					Address:             "address",
					Country:             domain.Country{Region: language.MustParseRegion("pt")},
					Vatin:               "2",
					PictureMultimediaID: nil,
				},
				Password: "password",
			}

			_, err := s.CreatePublisher(ctx, tx, editablePublisher1)
			require.NoError(t, err)

			expectedError := fmt.Errorf("%s: %w", descriptionFailedScanRow, domain.ErrPublisherEmailAlreadyExists)

			_, err = s.CreatePublisher(ctx, tx, editablePublisher2)
			assert.Equal(t, expectedError, err)
		})

		t.Run("when vatin already exists", func(t *testing.T) {
			ctx := context.Background()

			tx := newTx(t, ctx)

			editablePublisher1 := domain.EditablePublisherWithPassword{
				EditablePublisher: domain.EditablePublisher{
					Email:               "publisher1@email.com",
					Name:                "publisher name 1",
					Address:             "address",
					Country:             domain.Country{Region: language.MustParseRegion("pt")},
					Vatin:               "1",
					PictureMultimediaID: nil,
				},
				Password: "password",
			}

			editablePublisher2 := domain.EditablePublisherWithPassword{
				EditablePublisher: domain.EditablePublisher{
					Email:               "publisher2@email.com",
					Name:                "publisher name 2",
					Address:             "address",
					Country:             domain.Country{Region: language.MustParseRegion("pt")},
					Vatin:               "1",
					PictureMultimediaID: nil,
				},
				Password: "password",
			}

			_, err := s.CreatePublisher(ctx, tx, editablePublisher1)
			require.NoError(t, err)

			expectedError := fmt.Errorf("%s: %w", descriptionFailedScanRow, domain.ErrPublisherVatinAlreadyExists)

			_, err = s.CreatePublisher(ctx, tx, editablePublisher2)
			assert.Equal(t, expectedError, err)
		})

		t.Run("when picture multimedia is not found", func(t *testing.T) {
			ctx := context.Background()

			tx := newTx(t, ctx)

			multimediaID := uuid.New()

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

			expectedError := fmt.Errorf("%s: %w", descriptionFailedScanRow, domain.ErrMultimediaNotFound)

			_, err := s.CreatePublisher(ctx, tx, editablePublisher)
			assert.Equal(t, expectedError, err)
		})
	})
}
