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

func TestService_CreateUser(t *testing.T) {
	t.Run("should successfully create user", func(t *testing.T) {
		var (
			ctx = context.Background()

			userID           = uuid.New()
			expectedPassword = []byte("hashed password")

			editableUser = domain.EditableUserWithPassword{
				EditableUser: domain.EditableUser{
					Username:    "username",
					Email:       "user@email.com",
					DisplayName: "user name",
					DateOfBirth: domain.UserDateOfBirth(time.Date(2000, 2, 1, 0, 0, 0, 0, time.UTC)),
					Address:     "address",
					Country:     domain.Country{Region: language.MustParseRegion("pt")},
					Vatin:       "123456789",
				},
				Password: "password.secure123",
			}
			editableUserWithHashedPassword = domain.EditableUserWithPassword{
				EditableUser: editableUser.EditableUser,
				Password:     domain.Password(expectedPassword),
			}
			expectedUser = domain.User{
				ID:          userID,
				Username:    editableUser.Username,
				Email:       editableUser.Email,
				DisplayName: editableUser.DisplayName,
				DateOfBirth: editableUser.DateOfBirth,
				Address:     editableUser.Address,
				Country:     editableUser.Country,
				Vatin:       editableUser.Vatin,
				Balance:     0,
				CreatedAt:   time.Now(),
				ModifiedAt:  time.Now(),
			}
		)

		ctrl := gomock.NewController(t)

		s := newServiceTest(ctrl)
		tx := s.newReadWriteTx(ctx, ctrl)

		gomock.InOrder(
			s.mockAuthnService.EXPECT().
				ValidPassword([]byte(editableUser.Password)).
				Return(true),
			s.mockAuthnService.EXPECT().
				HashPassword([]byte(editableUser.Password)).
				Return(expectedPassword, nil),
			s.mockDataStore.EXPECT().
				CreateUser(ctx, tx, editableUserWithHashedPassword).
				Return(userID, nil),
			s.mockDataStore.EXPECT().
				GetUserByID(ctx, tx, userID).
				Return(expectedUser, nil),
		)

		user, err := s.service.CreateUser(ctx, editableUser)
		require.NoError(t, err)
		assert.Equal(t, expectedUser, user)
	})

	t.Run("should fail", func(t *testing.T) {
		t.Run("when a field is invalid", func(t *testing.T) {
			var (
				ctx = context.Background()

				editableUser = domain.EditableUserWithPassword{
					EditableUser: domain.EditableUser{
						Username:    "username",
						Email:       "user.email.com",
						DisplayName: "user name",
						DateOfBirth: domain.UserDateOfBirth(time.Date(2000, 2, 1, 0, 0, 0, 0, time.UTC)),
						Address:     "address",
						Country:     domain.Country{Region: language.MustParseRegion("pt")},
						Vatin:       "123456789",
					},
					Password: "password.secure123",
				}

				expectedError = fmt.Errorf("%s: %w", descriptionInvalidFieldValue, &domain.FieldValueInvalidError{FieldName: domain.FieldEmail})
			)

			ctrl := gomock.NewController(t)

			s := newServiceTest(ctrl)

			_, err := s.service.CreateUser(ctx, editableUser)
			assert.Equal(t, expectedError, err)
		})

		t.Run("when the authn service fails", func(t *testing.T) {
			t.Run("when validating the password", func(t *testing.T) {
				var (
					ctx = context.Background()

					editableUser = domain.EditableUserWithPassword{
						EditableUser: domain.EditableUser{
							Username:    "username",
							Email:       "user@email.com",
							DisplayName: "user name",
							DateOfBirth: domain.UserDateOfBirth(time.Date(2000, 2, 1, 0, 0, 0, 0, time.UTC)),
							Address:     "address",
							Country:     domain.Country{Region: language.MustParseRegion("pt")},
							Vatin:       "123456789",
						},
						Password: "password.secure123",
					}

					expectedError = fmt.Errorf("%s: %w", descriptionInvalidFieldValue, &domain.FieldValueInvalidError{FieldName: domain.FieldPassword})
				)

				ctrl := gomock.NewController(t)

				s := newServiceTest(ctrl)

				gomock.InOrder(
					s.mockAuthnService.EXPECT().
						ValidPassword([]byte(editableUser.Password)).
						Return(false),
				)

				_, err := s.service.CreateUser(ctx, editableUser)
				assert.Equal(t, expectedError, err)
			})

			t.Run("when hashing the password", func(t *testing.T) {
				var (
					ctx = context.Background()

					editableUser = domain.EditableUserWithPassword{
						EditableUser: domain.EditableUser{
							Username:    "username",
							Email:       "user@email.com",
							DisplayName: "user name",
							DateOfBirth: domain.UserDateOfBirth(time.Date(2000, 2, 1, 0, 0, 0, 0, time.UTC)),
							Address:     "address",
							Country:     domain.Country{Region: language.MustParseRegion("pt")},
							Vatin:       "123456789",
						},
						Password: "password.secure123",
					}

					errTest       = errors.New("error test")
					expectedError = fmt.Errorf("%s: %w", descriptionFailedHashPassword, errTest)
				)

				ctrl := gomock.NewController(t)

				s := newServiceTest(ctrl)

				gomock.InOrder(
					s.mockAuthnService.EXPECT().
						ValidPassword([]byte(editableUser.Password)).
						Return(true),
					s.mockAuthnService.EXPECT().
						HashPassword([]byte(editableUser.Password)).
						Return(nil, errTest),
				)

				_, err := s.service.CreateUser(ctx, editableUser)
				assert.Equal(t, expectedError, err)
			})
		})

		t.Run("when the store fails", func(t *testing.T) {
			t.Run("when creating the user", func(t *testing.T) {
				var (
					ctx = context.Background()

					expectedPassword = []byte("hashed password")

					editableUser = domain.EditableUserWithPassword{
						EditableUser: domain.EditableUser{
							Username:    "username",
							Email:       "user@email.com",
							DisplayName: "user name",
							DateOfBirth: domain.UserDateOfBirth(time.Date(2000, 2, 1, 0, 0, 0, 0, time.UTC)),
							Address:     "address",
							Country:     domain.Country{Region: language.MustParseRegion("pt")},
							Vatin:       "123456789",
						},
						Password: "password.secure123",
					}
					editableUserWithHashedPassword = domain.EditableUserWithPassword{
						EditableUser: editableUser.EditableUser,
						Password:     domain.Password(expectedPassword),
					}

					errTest       = errors.New("error test")
					expectedError = fmt.Errorf("%s: %w", descriptionFailedCreateUser, errTest)
				)

				ctrl := gomock.NewController(t)

				s := newServiceTest(ctrl)
				tx := s.newReadWriteTx(ctx, ctrl)

				gomock.InOrder(
					s.mockAuthnService.EXPECT().
						ValidPassword([]byte(editableUser.Password)).
						Return(true),
					s.mockAuthnService.EXPECT().
						HashPassword([]byte(editableUser.Password)).
						Return(expectedPassword, nil),
					s.mockDataStore.EXPECT().
						CreateUser(ctx, tx, editableUserWithHashedPassword).
						Return(uuid.UUID{}, errTest),
				)

				_, err := s.service.CreateUser(ctx, editableUser)
				assert.Equal(t, expectedError, err)
			})

			t.Run("when getting the user", func(t *testing.T) {
				var (
					ctx = context.Background()

					userID           = uuid.New()
					expectedPassword = []byte("hashed password")

					editableUser = domain.EditableUserWithPassword{
						EditableUser: domain.EditableUser{
							Username:    "username",
							Email:       "user@email.com",
							DisplayName: "user name",
							DateOfBirth: domain.UserDateOfBirth(time.Date(2000, 2, 1, 0, 0, 0, 0, time.UTC)),
							Address:     "address",
							Country:     domain.Country{Region: language.MustParseRegion("pt")},
							Vatin:       "123456789",
						},
						Password: "password.secure123",
					}
					editableUserWithHashedPassword = domain.EditableUserWithPassword{
						EditableUser: editableUser.EditableUser,
						Password:     domain.Password(expectedPassword),
					}

					errTest       = errors.New("error test")
					expectedError = fmt.Errorf("%s: %w", descriptionFailedCreateUser, errTest)
				)

				ctrl := gomock.NewController(t)

				s := newServiceTest(ctrl)
				tx := s.newReadWriteTx(ctx, ctrl)

				gomock.InOrder(
					s.mockAuthnService.EXPECT().
						ValidPassword([]byte(editableUser.Password)).
						Return(true),
					s.mockAuthnService.EXPECT().
						HashPassword([]byte(editableUser.Password)).
						Return(expectedPassword, nil),
					s.mockDataStore.EXPECT().
						CreateUser(ctx, tx, editableUserWithHashedPassword).
						Return(userID, nil),
					s.mockDataStore.EXPECT().
						GetUserByID(ctx, tx, userID).
						Return(domain.User{}, errTest),
				)

				_, err := s.service.CreateUser(ctx, editableUser)
				assert.Equal(t, expectedError, err)
			})
		})
	})
}
