package service

import (
	"context"

	"github.com/jackc/pgx/v5"
	"go.uber.org/mock/gomock"
)

type serviceTest struct {
	*service

	mockAuthnService *MockAuthenticationService
	mockDataStore    *MockDataStore
	mockObjectStore  *MockObjectStore
	mockSMTP         *MockSMTP
}

func newServiceTest(ctrl *gomock.Controller) serviceTest {
	mockAuthnService := NewMockAuthenticationService(ctrl)
	mockDataStore := NewMockDataStore(ctrl)
	mockObjectStore := NewMockObjectStore(ctrl)
	mockSMTP := NewMockSMTP(ctrl)

	return serviceTest{
		service: New(
			mockAuthnService,
			mockDataStore,
			mockObjectStore,
			mockSMTP,
		),

		mockAuthnService: mockAuthnService,
		mockDataStore:    mockDataStore,
		mockObjectStore:  mockObjectStore,
		mockSMTP:         mockSMTP,
	}
}

func (s serviceTest) newReadWriteTx(ctx context.Context, ctrl *gomock.Controller) pgx.Tx {
	mockTx := NewMockTx(ctrl)

	s.mockDataStore.EXPECT().
		NewTx(ctx, pgx.RepeatableRead, pgx.ReadWrite).
		Return(mockTx, nil).
		AnyTimes()

	mockTx.EXPECT().
		Commit(ctx).
		Return(nil).
		AnyTimes()
	mockTx.EXPECT().
		Rollback(ctx).
		Return(nil).
		AnyTimes()

	return mockTx
}
