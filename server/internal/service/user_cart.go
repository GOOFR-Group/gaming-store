package service

import (
	"bytes"
	"context"
	"errors"
	"fmt"
	"html/template"
	"log/slog"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"

	"github.com/goofr-group/gaming-store/server"
	"github.com/goofr-group/gaming-store/server/internal/domain"
	"github.com/goofr-group/gaming-store/server/internal/logging"
)

const (
	descriptionFailedCreateUserCartGame = "service: failed to create user cart game association"
	descriptionFailedListUserCart       = "service: failed to list user cart"
	descriptionFailedDeleteUserCartGame = "service: failed to delete user cart game association"
	descriptionFailedPurchaseUserCart   = "service: failed to purchase user cart"

	listUserCartPaginatedLimit = 100

	invoiceEmailSubject          = "GOOFR Store Invoice"
	invoiceEmailBodyTemplatePath = "templates/email/invoice.html"
)

// CreateUserCartGame creates a user cart game association.
func (s *service) CreateUserCartGame(ctx context.Context, userID, gameID uuid.UUID) error {
	logAttrs := []any{
		slog.String(logging.ServiceMethod, "CreateUserCartGame"),
		slog.String(logging.UserID, userID.String()),
		slog.String(logging.GameID, gameID.String()),
	}

	err := s.readWriteTx(ctx, func(tx pgx.Tx) error {
		game, err := s.dataStore.GetGameByID(ctx, tx, gameID)
		if err != nil {
			return err
		}

		if !game.IsActive {
			return domain.ErrGameNotActive
		}

		now := time.Now().UTC()

		if game.ReleaseDate == nil || game.ReleaseDate.After(now) {
			return domain.ErrGameNotReleased
		}

		user, err := s.dataStore.GetUserByID(ctx, tx, userID)
		if err != nil {
			return err
		}

		dateOfBirth := user.DateOfBirth.Time().UTC()

		age := now.Year() - dateOfBirth.Year()
		if now.YearDay() < dateOfBirth.YearDay() {
			age--
		}

		if game.AgeRating.Value() > age {
			return domain.ErrUserNotOldEnough
		}

		ok, err := s.dataStore.ExistsUserLibraryGame(ctx, tx, userID, gameID)
		if err != nil {
			return err
		}

		if ok {
			return domain.ErrUserLibraryGameAlreadyExists
		}

		return s.dataStore.CreateUserCartGame(ctx, tx, userID, gameID)
	})
	if err != nil {
		switch {
		case errors.Is(err, domain.ErrUserCartGameAlreadyExists),
			errors.Is(err, domain.ErrUserNotFound),
			errors.Is(err, domain.ErrGameNotFound),
			errors.Is(err, domain.ErrGameNotActive),
			errors.Is(err, domain.ErrGameNotReleased),
			errors.Is(err, domain.ErrUserNotOldEnough),
			errors.Is(err, domain.ErrUserLibraryGameAlreadyExists):
			return logInfoAndWrapError(ctx, err, descriptionFailedCreateUserCartGame, logAttrs...)
		default:
			return logAndWrapError(ctx, err, descriptionFailedCreateUserCartGame, logAttrs...)
		}
	}

	return nil
}

// ListUserCart returns the user cart with the specified filter.
func (s *service) ListUserCart(ctx context.Context, userID uuid.UUID, filter domain.UserCartPaginatedFilter) (domain.PaginatedResponse[domain.Game], error) {
	logAttrs := []any{
		slog.String(logging.ServiceMethod, "ListUserCart"),
		slog.String(logging.UserID, userID.String()),
	}

	if filter.Sort != nil && !filter.Sort.Valid() {
		return domain.PaginatedResponse[domain.Game]{}, logInfoAndWrapError(ctx, &domain.FilterValueInvalidError{FilterName: domain.FieldFilterSort}, descriptionInvalidFilterValue, logAttrs...)
	}

	if !filter.Order.Valid() {
		return domain.PaginatedResponse[domain.Game]{}, logInfoAndWrapError(ctx, &domain.FilterValueInvalidError{FilterName: domain.FieldFilterOrder}, descriptionInvalidFilterValue, logAttrs...)
	}

	if !filter.Limit.Valid() {
		return domain.PaginatedResponse[domain.Game]{}, logInfoAndWrapError(ctx, &domain.FilterValueInvalidError{FilterName: domain.FieldFilterLimit}, descriptionInvalidFilterValue, logAttrs...)
	}

	if !filter.Offset.Valid() {
		return domain.PaginatedResponse[domain.Game]{}, logInfoAndWrapError(ctx, &domain.FilterValueInvalidError{FilterName: domain.FieldFilterOffset}, descriptionInvalidFilterValue, logAttrs...)
	}

	var (
		paginatedGames domain.PaginatedResponse[domain.Game]
		err            error
	)

	err = s.readOnlyTx(ctx, func(tx pgx.Tx) error {
		paginatedGames, err = s.dataStore.ListUserCart(ctx, tx, userID, filter)
		return err
	})
	if err != nil {
		return domain.PaginatedResponse[domain.Game]{}, logAndWrapError(ctx, err, descriptionFailedListUserCart, logAttrs...)
	}

	return paginatedGames, nil
}

// DeleteUserCartGame deletes the user cart game association.
func (s *service) DeleteUserCartGame(ctx context.Context, userID, gameID uuid.UUID) error {
	logAttrs := []any{
		slog.String(logging.ServiceMethod, "DeleteUserCartGame"),
		slog.String(logging.UserID, userID.String()),
		slog.String(logging.GameID, gameID.String()),
	}

	err := s.readWriteTx(ctx, func(tx pgx.Tx) error {
		return s.dataStore.DeleteUserCartGame(ctx, tx, userID, gameID)
	})
	if err != nil {
		switch {
		case errors.Is(err, domain.ErrUserCartGameNotFound):
			return logInfoAndWrapError(ctx, err, descriptionFailedDeleteUserCartGame, logAttrs...)
		default:
			return logAndWrapError(ctx, err, descriptionFailedDeleteUserCartGame, logAttrs...)
		}
	}

	return nil
}

// PurchaseUserCart purchases a user shopping cart.
func (s *service) PurchaseUserCart(ctx context.Context, userID uuid.UUID) error {
	logAttrs := []any{
		slog.String(logging.ServiceMethod, "PurchaseUserCart"),
		slog.String(logging.UserID, userID.String()),
	}

	err := s.readWriteTx(ctx, func(tx pgx.Tx) error {
		user, err := s.dataStore.GetUserByID(ctx, tx, userID)
		if err != nil {
			return err
		}

		var games []domain.Game

		for {
			userCart, err := s.dataStore.ListUserCart(ctx, tx, userID, domain.UserCartPaginatedFilter{
				PaginatedRequest: domain.PaginatedRequest[domain.UserCartPaginatedSort]{
					PaginatedRequestBase: domain.PaginatedRequestBase{
						Limit:  listUserCartPaginatedLimit,
						Offset: domain.PaginationOffset(len(games)),
					},
					Sort:  domain.UserCartPaginatedSortCreatedAt,
					Order: domain.PaginationOrderDesc,
				},
			})
			if err != nil {
				return err
			}

			if games == nil {
				games = make([]domain.Game, 0, userCart.Total)
			}

			games = append(games, userCart.Results...)

			if len(userCart.Results) < listUserCartPaginatedLimit {
				break
			}
		}

		if len(games) == 0 {
			return domain.ErrUserCartEmpty
		}

		var subtotal domain.GamePrice
		for _, game := range games {
			subtotal += game.Price
		}

		totalPrice := subtotal.WithTax()

		newUserBalance := user.Balance - float64(totalPrice)
		if newUserBalance < 0 {
			return domain.ErrUserBalanceInsufficient
		}

		err = s.dataStore.PatchUser(ctx, tx, userID, domain.EditableUserPatch{
			Balance: &newUserBalance,
		})
		if err != nil {
			return err
		}

		err = s.dataStore.PurchaseUserCart(ctx, tx, userID, domain.Tax)
		if err != nil {
			return err
		}

		template, err := template.ParseFS(server.FileSystemTemplates, invoiceEmailBodyTemplatePath)
		if err != nil {
			return err
		}

		gamesWithTax := make([]domain.Game, len(games))

		for i, game := range games {
			game.Price = game.Price.WithTax()

			gamesWithTax[i] = game
		}

		invoice := domain.Invoice{
			User:       user,
			Games:      gamesWithTax,
			Subtotal:   subtotal,
			TaxPercent: fmt.Sprintf("%.0f", 100*domain.Tax),
			Tax:        domain.GamePrice(subtotal * domain.Tax),
			TotalPrice: totalPrice,
			CreatedAt:  time.Now().UTC().Format(time.DateOnly),
		}

		var body bytes.Buffer

		err = template.Execute(&body, invoice)
		if err != nil {
			return err
		}

		return s.smtp.SendMailHTML([]string{string(user.Email)}, invoiceEmailSubject, body.String())
	})
	if err != nil {
		switch {
		case errors.Is(err, domain.ErrUserNotFound),
			errors.Is(err, domain.ErrUserCartEmpty),
			errors.Is(err, domain.ErrUserBalanceInsufficient):
			return logInfoAndWrapError(ctx, err, descriptionFailedPurchaseUserCart, logAttrs...)
		default:
			return logAndWrapError(ctx, err, descriptionFailedPurchaseUserCart, logAttrs...)
		}
	}

	return nil
}
