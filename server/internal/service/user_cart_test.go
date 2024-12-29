package service

import (
	"context"
	"errors"
	"fmt"
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
				Email:   "user@email.com",
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

			totalPrice     = 20 * (1 + domain.Tax)
			newUserBalance = user.Balance - totalPrice
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
			s.mockDataStore.EXPECT().
				PatchUser(ctx, tx, userID, domain.EditableUserPatch{
					Balance: &newUserBalance,
				}).
				Return(nil),
			s.mockDataStore.EXPECT().
				PurchaseUserCart(ctx, tx, userID, domain.Tax).
				Return(nil),
			s.mockSMTP.EXPECT().
				SendMailHTML([]string{string(user.Email)}, invoiceEmailSubject, gomock.Any()).
				Return(nil),
		)

		err := s.service.PurchaseUserCart(ctx, userID)
		assert.NoError(t, err)
	})

	t.Run("should fail", func(t *testing.T) {
		t.Run("when the user cart is empty", func(t *testing.T) {
			var (
				ctx = context.Background()

				userID = uuid.New()

				user = domain.User{
					Email:   "user@email.com",
					Balance: 30,
				}
				userCart = domain.PaginatedResponse[domain.Game]{
					Total:   0,
					Results: []domain.Game{},
				}

				expectedError = fmt.Errorf("%s: %w", descriptionFailedPurchaseUserCart, domain.ErrUserCartEmpty)
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
			assert.Equal(t, expectedError, err)
		})

		t.Run("when the user balance is insufficient", func(t *testing.T) {
			var (
				ctx = context.Background()

				userID = uuid.New()

				user = domain.User{
					Email:   "user@email.com",
					Balance: 10,
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

				expectedError = fmt.Errorf("%s: %w", descriptionFailedPurchaseUserCart, domain.ErrUserBalanceInsufficient)
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
			assert.Equal(t, expectedError, err)
		})

		t.Run("when the store fails", func(t *testing.T) {
			t.Run("when getting the user", func(t *testing.T) {
				var (
					ctx = context.Background()

					userID = uuid.New()

					errTest       = errors.New("error test")
					expectedError = fmt.Errorf("%s: %w", descriptionFailedPurchaseUserCart, errTest)
				)

				ctrl := gomock.NewController(t)

				s := newServiceTest(ctrl)
				tx := s.newReadWriteTx(ctx, ctrl)

				gomock.InOrder(
					s.mockDataStore.EXPECT().
						GetUserByID(ctx, tx, userID).
						Return(domain.User{}, errTest),
				)

				err := s.service.PurchaseUserCart(ctx, userID)
				assert.Equal(t, expectedError, err)
			})

			t.Run("when listing the user cart", func(t *testing.T) {
				var (
					ctx = context.Background()

					userID = uuid.New()

					user = domain.User{
						Email:   "user@email.com",
						Balance: 30,
					}

					errTest       = errors.New("error test")
					expectedError = fmt.Errorf("%s: %w", descriptionFailedPurchaseUserCart, errTest)
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
						Return(domain.PaginatedResponse[domain.Game]{}, errTest),
				)

				err := s.service.PurchaseUserCart(ctx, userID)
				assert.Equal(t, expectedError, err)
			})

			t.Run("when patching the user", func(t *testing.T) {
				var (
					ctx = context.Background()

					userID = uuid.New()

					user = domain.User{
						Email:   "user@email.com",
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

					totalPrice     = 20 * (1 + domain.Tax)
					newUserBalance = user.Balance - totalPrice

					errTest       = errors.New("error test")
					expectedError = fmt.Errorf("%s: %w", descriptionFailedPurchaseUserCart, errTest)
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
					s.mockDataStore.EXPECT().
						PatchUser(ctx, tx, userID, domain.EditableUserPatch{
							Balance: &newUserBalance,
						}).
						Return(errTest),
				)

				err := s.service.PurchaseUserCart(ctx, userID)
				assert.Equal(t, expectedError, err)
			})

			t.Run("when purchasing the user cart", func(t *testing.T) {
				var (
					ctx = context.Background()

					userID = uuid.New()

					user = domain.User{
						Email:   "user@email.com",
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

					totalPrice     = 20 * (1 + domain.Tax)
					newUserBalance = user.Balance - totalPrice

					errTest       = errors.New("error test")
					expectedError = fmt.Errorf("%s: %w", descriptionFailedPurchaseUserCart, errTest)
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
					s.mockDataStore.EXPECT().
						PatchUser(ctx, tx, userID, domain.EditableUserPatch{
							Balance: &newUserBalance,
						}).
						Return(nil),
					s.mockDataStore.EXPECT().
						PurchaseUserCart(ctx, tx, userID, domain.Tax).
						Return(errTest),
				)

				err := s.service.PurchaseUserCart(ctx, userID)
				assert.Equal(t, expectedError, err)
			})

			t.Run("when sending invoice mail", func(t *testing.T) {
				var (
					ctx = context.Background()

					userID = uuid.New()

					user = domain.User{
						Email:   "user@email.com",
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

					totalPrice     = 20 * (1 + domain.Tax)
					newUserBalance = user.Balance - totalPrice

					errTest       = errors.New("error test")
					expectedError = fmt.Errorf("%s: %w", descriptionFailedPurchaseUserCart, errTest)
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
					s.mockDataStore.EXPECT().
						PatchUser(ctx, tx, userID, domain.EditableUserPatch{
							Balance: &newUserBalance,
						}).
						Return(nil),
					s.mockDataStore.EXPECT().
						PurchaseUserCart(ctx, tx, userID, domain.Tax).
						Return(nil),
					s.mockSMTP.EXPECT().
						SendMailHTML([]string{string(user.Email)}, invoiceEmailSubject, gomock.Any()).
						Return(errTest),
				)

				err := s.service.PurchaseUserCart(ctx, userID)
				assert.Equal(t, expectedError, err)
			})
		})
	})
}
