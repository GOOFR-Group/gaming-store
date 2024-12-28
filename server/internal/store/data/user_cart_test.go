//go:build integration

package data

import (
	"context"
	"hash/crc32"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"golang.org/x/text/language"

	"github.com/goofr-group/gaming-store/server/internal/domain"
)

func TestStore_PurchaseUserCart(t *testing.T) {
	t.Run("should successfully purchase user cart", func(t *testing.T) {
		ctx := context.Background()

		tx := newTx(t, ctx)

		multimediaID, err := s.CreateMultimedia(ctx, tx, domain.MultimediaObject{
			Checksum:  crc32.ChecksumIEEE([]byte("test")),
			MediaType: "png",
			URL:       "url",
		})
		require.NoError(t, err)

		publisherID, err := s.CreatePublisher(ctx, tx, domain.EditablePublisherWithPassword{
			EditablePublisher: domain.EditablePublisher{
				Email:               "publisher@email.com",
				Name:                "publisher name",
				Address:             "address",
				Country:             domain.Country{Region: language.MustParseRegion("pt")},
				Vatin:               "123456789",
				PictureMultimediaID: &multimediaID,
			},
			Password: "password",
		})
		require.NoError(t, err)

		releaseDate := time.Date(2024, 12, 25, 0, 0, 0, 0, time.UTC)

		game1, err := s.CreateGame(ctx, tx, publisherID, domain.EditableGame{
			Title:       "title 1",
			Price:       10,
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
		})
		require.NoError(t, err)

		game2, err := s.CreateGame(ctx, tx, publisherID, domain.EditableGame{
			Title:       "title 2",
			Price:       20,
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
		})
		require.NoError(t, err)

		userID, err := s.CreateUser(ctx, tx, domain.EditableUserWithPassword{
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
		})
		require.NoError(t, err)

		err = s.CreateUserCartGame(ctx, tx, userID, game1)
		require.NoError(t, err)

		err = s.CreateUserCartGame(ctx, tx, userID, game2)
		require.NoError(t, err)

		userCart, err := s.ListUserCart(ctx, tx, userID, domain.UserCartPaginatedFilter{})
		require.NoError(t, err)
		assert.Equal(t, 2, userCart.Total)

		err = s.PurchaseUserCart(ctx, tx, userID)
		require.NoError(t, err)

		userCart, err = s.ListUserCart(ctx, tx, userID, domain.UserCartPaginatedFilter{})
		require.NoError(t, err)
		assert.Equal(t, 0, userCart.Total)

		userLibrary, err := s.ListUserLibrary(ctx, tx, userID, domain.UserLibraryPaginatedFilter{
			PaginatedRequest: domain.PaginatedRequest[domain.UserLibraryPaginatedSort]{
				PaginatedRequestBase: domain.PaginatedRequestBase{
					Limit: 2,
				},
				Sort:  domain.UserLibraryPaginatedSortGameTitle,
				Order: domain.PaginationOrderAsc,
			},
		})
		require.NoError(t, err)
		require.Equal(t, 2, userLibrary.Total)
		require.Len(t, userLibrary.Results, 2)
		assert.Equal(t, game1, userLibrary.Results[0].ID)
		assert.Equal(t, game2, userLibrary.Results[1].ID)
	})
}
