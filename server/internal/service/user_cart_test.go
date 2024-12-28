package service

import (
	"context"
	"testing"

	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"go.uber.org/mock/gomock"

	"github.com/goofr-group/gaming-store/server/internal/domain"
)

func TestService_PurchaseUserCart(t *testing.T) {
	t.Run("should successfully purchase user cart", func(t *testing.T) {
		var (
			ctx = context.Background()

			userID = uuid.New()

			user = domain.User{
				Balance: 30,
			}
			userCart = domain.PaginatedResponse[domain.Game]{
				Total: 2,
				Results: []domain.Game{
					{
						Price: 5,
					},
					{
						Price: 15,
					},
				},
			}
		)

		ctrl := gomock.NewController(t)

		s := newServiceTest(ctrl)
		tx := s.newReadWriteTx(ctx, ctrl)

		gomock.InOrder(
			s.mockDataStore.EXPECT().
				GetUserByID(ctx, tx, userID).
				Return(user, nil),
			s.mockDataStore.EXPECT().
				ListUserCart(ctx, tx, userID, domain.UserCartPaginatedFilter{
					PaginatedRequest: domain.PaginatedRequest[domain.UserCartPaginatedSort]{
						PaginatedRequestBase: domain.PaginatedRequestBase{
							Limit:  listUserCartPaginatedLimit,
							Offset: 0,
						},
						Sort:  domain.UserCartPaginatedSortCreatedAt,
						Order: domain.PaginationOrderDesc,
					},
				}).
				Return(userCart, nil),
		)

		err := s.service.PurchaseUserCart(ctx, userID)
		assert.NoError(t, err)
	})

	t.Run("should fail", func(t *testing.T) {
		t.Run("when the user cart is empty", func(t *testing.T) {

		})

		t.Run("when the user balance is insufficient", func(t *testing.T) {

		})

		t.Run("when the store fails", func(t *testing.T) {
			t.Run("when getting the user", func(t *testing.T) {

			})

			t.Run("when listing the user cart", func(t *testing.T) {

			})

			t.Run("when patching the user", func(t *testing.T) {

			})

			t.Run("when purchasing the user cart", func(t *testing.T) {

			})
		})
	})
}
