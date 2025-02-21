package service

//go:generate go run go.uber.org/mock/mockgen -destination mock_service_test.gen.go -package service -typed . AuthenticationService,DataStore,ObjectStore,SMTP
//go:generate go run go.uber.org/mock/mockgen -destination mock_tx_test.gen.go -package service -typed github.com/jackc/pgx/v5 Tx

import (
	"context"
	"fmt"
	"io"
	"strings"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"

	"github.com/goofr-group/gaming-store/server/internal/authn"
	"github.com/goofr-group/gaming-store/server/internal/domain"
	"github.com/goofr-group/gaming-store/server/internal/logging"
)

const (
	descriptionInvalidFieldValue       = "service: invalid field value"
	descriptionInvalidFilterValue      = "service: invalid filter value"
	descriptionFailedHashPassword      = "service: failed to hash password"
	descriptionFailedCheckPasswordHash = "service: failed to check password hash"
	descriptionFailedCreateJWT         = "service: failed to create jwt"
)

// AuthenticationService defines the authentication service interface.
type AuthenticationService interface {
	ValidPassword(password []byte) bool
	HashPassword(password []byte) ([]byte, error)
	CheckPasswordHash(password, hash []byte) (bool, error)

	NewJWT(subject string, subjectRoles []authn.SubjectRole) (string, error)
}

// DataStore defines the data store interface.
type DataStore interface {
	CreateUser(ctx context.Context, tx pgx.Tx, editableUser domain.EditableUserWithPassword) (uuid.UUID, error)
	GetUserByID(ctx context.Context, tx pgx.Tx, id uuid.UUID) (domain.User, error)
	GetUserByEmail(ctx context.Context, tx pgx.Tx, email domain.Email) (domain.User, error)
	GetUserSignIn(ctx context.Context, tx pgx.Tx, username domain.Username, email domain.Email) (domain.SignInUser, error)
	PatchUser(ctx context.Context, tx pgx.Tx, id uuid.UUID, editableUser domain.EditableUserPatch) error

	CreateUserCartGame(ctx context.Context, tx pgx.Tx, userID, gameID uuid.UUID) error
	ListUserCart(ctx context.Context, tx pgx.Tx, userID uuid.UUID, filter domain.UserCartPaginatedFilter) (domain.PaginatedResponse[domain.Game], error)
	DeleteUserCartGame(ctx context.Context, tx pgx.Tx, userID, gameID uuid.UUID) error
	PurchaseUserCart(ctx context.Context, tx pgx.Tx, userID uuid.UUID, tax float64) error

	ListUserLibrary(ctx context.Context, tx pgx.Tx, userID uuid.UUID, filter domain.UserLibraryPaginatedFilter) (domain.PaginatedResponse[domain.Game], error)
	ExistsUserLibraryGame(ctx context.Context, tx pgx.Tx, userID, gameID uuid.UUID) (bool, error)

	CreatePublisher(ctx context.Context, tx pgx.Tx, editablePublisher domain.EditablePublisherWithPassword) (uuid.UUID, error)
	GetPublisherByID(ctx context.Context, tx pgx.Tx, id uuid.UUID) (domain.Publisher, error)
	GetPublisherByEmail(ctx context.Context, tx pgx.Tx, email domain.Email) (domain.Publisher, error)
	GetPublisherSignIn(ctx context.Context, tx pgx.Tx, email domain.Email) (domain.SignInPublisher, error)
	PatchPublisher(ctx context.Context, tx pgx.Tx, id uuid.UUID, editablePublisher domain.EditablePublisherPatch) error

	CreateGame(ctx context.Context, tx pgx.Tx, publisherID uuid.UUID, editableGame domain.EditableGame) (uuid.UUID, error)
	ListGames(ctx context.Context, tx pgx.Tx, filter domain.GamesPaginatedFilter) (domain.PaginatedResponse[domain.Game], error)
	ListGamesRecommended(ctx context.Context, tx pgx.Tx, filter domain.GamesRecommendedPaginatedFilter) (domain.PaginatedResponse[domain.Game], error)
	GetGameByID(ctx context.Context, tx pgx.Tx, id uuid.UUID) (domain.Game, error)
	PatchGame(ctx context.Context, tx pgx.Tx, id uuid.UUID, editableGame domain.EditableGamePatch) error

	CreateGameTag(ctx context.Context, tx pgx.Tx, gameID, tagID uuid.UUID) error
	DeleteGameTag(ctx context.Context, tx pgx.Tx, gameID, tagID uuid.UUID) error

	CreateGameMultimedia(ctx context.Context, tx pgx.Tx, gameID, multimediaID uuid.UUID, editableGameMultimedia domain.EditableGameMultimedia) error
	DeleteGameMultimedia(ctx context.Context, tx pgx.Tx, gameID, multimediaID uuid.UUID) error

	ListTags(ctx context.Context, tx pgx.Tx, filter domain.TagsPaginatedFilter) (domain.PaginatedResponse[domain.Tag], error)

	CreateMultimedia(ctx context.Context, tx pgx.Tx, multimedia domain.MultimediaObject) (uuid.UUID, error)
	GetMultimediaByID(ctx context.Context, tx pgx.Tx, id uuid.UUID) (domain.Multimedia, error)
	GetMultimediaByChecksumAndMediaType(ctx context.Context, tx pgx.Tx, checksum int64, mediaType string) (domain.Multimedia, error)

	NewTx(ctx context.Context, isoLevel pgx.TxIsoLevel, accessMode pgx.TxAccessMode) (pgx.Tx, error)
}

// ObjectStore defines the object store interface.
type ObjectStore interface {
	CreateMultimediaObject(ctx context.Context, name string, reader io.Reader) error
	GetMultimediaObject(ctx context.Context, name string) (domain.MultimediaObject, error)
}

// SMTP defines the smtp interface.
type SMTP interface {
	SendMailHTML(to []string, subject string, body string) error
}

// service defines the service structure.
type service struct {
	authnService AuthenticationService
	dataStore    DataStore
	objectStore  ObjectStore
	smtp         SMTP
}

// New returns a new http handler.
func New(authnService AuthenticationService, dataStore DataStore, objectStore ObjectStore, smtp SMTP) *service {
	return &service{
		authnService: authnService,
		dataStore:    dataStore,
		objectStore:  objectStore,
		smtp:         smtp,
	}
}

// rollbackFunc returns a function to rollback a transaction.
func rollbackFunc(ctx context.Context, tx pgx.Tx) func() {
	return func() {
		err := tx.Rollback(ctx)
		if err != nil {
			logging.Logger.ErrorContext(ctx, "service: failed to rollback transaction", logging.Error(err))
		}
	}
}

// readOnlyTx returns a read only transaction wrapper.
func (s *service) readOnlyTx(ctx context.Context, f func(pgx.Tx) error) error {
	tx, err := s.dataStore.NewTx(ctx, pgx.ReadCommitted, pgx.ReadOnly)
	if err != nil {
		return err
	}
	defer rollbackFunc(ctx, tx)()

	if err := f(tx); err != nil {
		return err
	}

	return tx.Commit(ctx)
}

// readWriteTx returns a read and write transaction wrapper.
func (s *service) readWriteTx(ctx context.Context, f func(pgx.Tx) error) error {
	tx, err := s.dataStore.NewTx(ctx, pgx.RepeatableRead, pgx.ReadWrite)
	if err != nil {
		return err
	}
	defer rollbackFunc(ctx, tx)()

	if err := f(tx); err != nil {
		return err
	}

	return tx.Commit(ctx)
}

// logInfoAndWrapError logs the error at the info level and returns the error wrapped with the provided description.
func logInfoAndWrapError(ctx context.Context, err error, description string, logAttrs ...any) error {
	logAttrs = append(logAttrs, logging.Error(err))
	logging.Logger.InfoContext(ctx, description, logAttrs...)

	return fmt.Errorf("%s: %w", description, err)
}

// logAndWrapError logs the error and returns the error wrapped with the provided description.
func logAndWrapError(ctx context.Context, err error, description string, logAttrs ...any) error {
	logAttrs = append(logAttrs, logging.Error(err))
	logging.Logger.ErrorContext(ctx, description, logAttrs...)

	return fmt.Errorf("%s: %w", description, err)
}

// replaceSpacesWithHyphen returns s with no extra spaces and separates it with a hyphen.
func replaceSpacesWithHyphen(s string) string {
	return strings.Join(strings.Fields(s), "-")
}

// removeExtraSpaces returns s with no extra spaces.
func removeExtraSpaces(s string) string {
	return strings.Join(strings.Fields(s), " ")
}
