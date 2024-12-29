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

func TestService_CreatePublisher(t *testing.T) {
	t.Run("should successfully create publisher", func(t *testing.T) {
		var (
			ctx = context.Background()

			publisherID      = uuid.New()
			expectedPassword = []byte("hashed password")

			editablePublisher = domain.EditablePublisherWithPassword{
				EditablePublisher: domain.EditablePublisher{
					Email:   "publisher@email.com",
					Name:    "publisher name",
					Address: "address",
					Country: domain.Country{Region: language.MustParseRegion("pt")},
					Vatin:   "123456789",
				},
				Password: "password.secure123",
			}
			editablePublisherWithHashedPassword = domain.EditablePublisherWithPassword{
				EditablePublisher: editablePublisher.EditablePublisher,
				Password:          domain.Password(expectedPassword),
			}
			expectedPublisher = domain.Publisher{
				ID:         publisherID,
				Email:      editablePublisher.Email,
				Name:       editablePublisher.Name,
				Address:    editablePublisher.Address,
				Country:    editablePublisher.Country,
				Vatin:      editablePublisher.Vatin,
				CreatedAt:  time.Now(),
				ModifiedAt: time.Now(),
			}
		)

		ctrl := gomock.NewController(t)

		s := newServiceTest(ctrl)
		tx := s.newReadWriteTx(ctx, ctrl)

		gomock.InOrder(
			s.mockAuthnService.EXPECT().
				ValidPassword([]byte(editablePublisher.Password)).
				Return(true),
			s.mockAuthnService.EXPECT().
				HashPassword([]byte(editablePublisher.Password)).
				Return(expectedPassword, nil),
			s.mockDataStore.EXPECT().
				CreatePublisher(ctx, tx, editablePublisherWithHashedPassword).
				Return(publisherID, nil),
			s.mockDataStore.EXPECT().
				GetPublisherByID(ctx, tx, publisherID).
				Return(expectedPublisher, nil),
		)

		publisher, err := s.service.CreatePublisher(ctx, editablePublisher)
		require.NoError(t, err)
		assert.Equal(t, expectedPublisher, publisher)
	})

	t.Run("should fail", func(t *testing.T) {
		t.Run("when a field is invalid", func(t *testing.T) {
			var (
				ctx = context.Background()

				editablePublisher = domain.EditablePublisherWithPassword{
					EditablePublisher: domain.EditablePublisher{
						Email:   "publisher.email.com",
						Name:    "publisher name",
						Address: "address",
						Country: domain.Country{Region: language.MustParseRegion("pt")},
						Vatin:   "123456789",
					},
					Password: "password.secure123",
				}

				expectedError = fmt.Errorf("%s: %w", descriptionInvalidFieldValue, &domain.FieldValueInvalidError{FieldName: domain.FieldEmail})
			)

			ctrl := gomock.NewController(t)

			s := newServiceTest(ctrl)

			_, err := s.service.CreatePublisher(ctx, editablePublisher)
			assert.Equal(t, expectedError, err)
		})

		t.Run("when the authn service fails", func(t *testing.T) {
			t.Run("when validating the password", func(t *testing.T) {
				var (
					ctx = context.Background()

					editablePublisher = domain.EditablePublisherWithPassword{
						EditablePublisher: domain.EditablePublisher{
							Email:   "publisher@email.com",
							Name:    "publisher name",
							Address: "address",
							Country: domain.Country{Region: language.MustParseRegion("pt")},
							Vatin:   "123456789",
						},
						Password: "password.secure123",
					}

					expectedError = fmt.Errorf("%s: %w", descriptionInvalidFieldValue, &domain.FieldValueInvalidError{FieldName: domain.FieldPassword})
				)

				ctrl := gomock.NewController(t)

				s := newServiceTest(ctrl)

				gomock.InOrder(
					s.mockAuthnService.EXPECT().
						ValidPassword([]byte(editablePublisher.Password)).
						Return(false),
				)

				_, err := s.service.CreatePublisher(ctx, editablePublisher)
				assert.Equal(t, expectedError, err)
			})

			t.Run("when hashing the password", func(t *testing.T) {
				var (
					ctx = context.Background()

					editablePublisher = domain.EditablePublisherWithPassword{
						EditablePublisher: domain.EditablePublisher{
							Email:   "publisher@email.com",
							Name:    "publisher name",
							Address: "address",
							Country: domain.Country{Region: language.MustParseRegion("pt")},
							Vatin:   "123456789",
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
						ValidPassword([]byte(editablePublisher.Password)).
						Return(true),
					s.mockAuthnService.EXPECT().
						HashPassword([]byte(editablePublisher.Password)).
						Return(nil, errTest),
				)

				_, err := s.service.CreatePublisher(ctx, editablePublisher)
				assert.Equal(t, expectedError, err)
			})
		})

		t.Run("when the store fails", func(t *testing.T) {
			t.Run("when creating the publisher", func(t *testing.T) {
				var (
					ctx = context.Background()

					expectedPassword = []byte("hashed password")

					editablePublisher = domain.EditablePublisherWithPassword{
						EditablePublisher: domain.EditablePublisher{
							Email:   "publisher@email.com",
							Name:    "publisher name",
							Address: "address",
							Country: domain.Country{Region: language.MustParseRegion("pt")},
							Vatin:   "123456789",
						},
						Password: "password.secure123",
					}
					editablePublisherWithHashedPassword = domain.EditablePublisherWithPassword{
						EditablePublisher: editablePublisher.EditablePublisher,
						Password:          domain.Password(expectedPassword),
					}

					errTest       = errors.New("error test")
					expectedError = fmt.Errorf("%s: %w", descriptionFailedCreatePublisher, errTest)
				)

				ctrl := gomock.NewController(t)

				s := newServiceTest(ctrl)
				tx := s.newReadWriteTx(ctx, ctrl)

				gomock.InOrder(
					s.mockAuthnService.EXPECT().
						ValidPassword([]byte(editablePublisher.Password)).
						Return(true),
					s.mockAuthnService.EXPECT().
						HashPassword([]byte(editablePublisher.Password)).
						Return(expectedPassword, nil),
					s.mockDataStore.EXPECT().
						CreatePublisher(ctx, tx, editablePublisherWithHashedPassword).
						Return(uuid.UUID{}, errTest),
				)

				_, err := s.service.CreatePublisher(ctx, editablePublisher)
				assert.Equal(t, expectedError, err)
			})

			t.Run("when getting the publisher", func(t *testing.T) {
				var (
					ctx = context.Background()

					publisherID      = uuid.New()
					expectedPassword = []byte("hashed password")

					editablePublisher = domain.EditablePublisherWithPassword{
						EditablePublisher: domain.EditablePublisher{
							Email:   "publisher@email.com",
							Name:    "publisher name",
							Address: "address",
							Country: domain.Country{Region: language.MustParseRegion("pt")},
							Vatin:   "123456789",
						},
						Password: "password.secure123",
					}
					editablePublisherWithHashedPassword = domain.EditablePublisherWithPassword{
						EditablePublisher: editablePublisher.EditablePublisher,
						Password:          domain.Password(expectedPassword),
					}

					errTest       = errors.New("error test")
					expectedError = fmt.Errorf("%s: %w", descriptionFailedCreatePublisher, errTest)
				)

				ctrl := gomock.NewController(t)

				s := newServiceTest(ctrl)
				tx := s.newReadWriteTx(ctx, ctrl)

				gomock.InOrder(
					s.mockAuthnService.EXPECT().
						ValidPassword([]byte(editablePublisher.Password)).
						Return(true),
					s.mockAuthnService.EXPECT().
						HashPassword([]byte(editablePublisher.Password)).
						Return(expectedPassword, nil),
					s.mockDataStore.EXPECT().
						CreatePublisher(ctx, tx, editablePublisherWithHashedPassword).
						Return(publisherID, nil),
					s.mockDataStore.EXPECT().
						GetPublisherByID(ctx, tx, publisherID).
						Return(domain.Publisher{}, errTest),
				)

				_, err := s.service.CreatePublisher(ctx, editablePublisher)
				assert.Equal(t, expectedError, err)
			})
		})
	})
}
