package service

import (
	"bytes"
	"context"
	"errors"
	"hash/crc32"
	"log/slog"
	"strconv"
	"strings"

	"github.com/jackc/pgx/v5"

	"github.com/goofr-group/gaming-store/server/internal/domain"
	"github.com/goofr-group/gaming-store/server/internal/logging"
)

const (
	descriptionFailedCreateMultimediaObject              = "service: failed to create multimedia object"
	descriptionFailedCreateMultimedia                    = "service: failed to create multimedia"
	descriptionFailedGetMultimediaObject                 = "service: failed to get multimedia object"
	descriptionFailedGetMultimediaByChecksumAndMediaType = "service: failed to get multimedia by checksum and media type"
)

// UploadMultimedia uploads a multimedia file.
func (s *service) UploadMultimedia(ctx context.Context, file []byte, contentType string) (domain.Multimedia, error) {
	logAttrs := []any{
		slog.String(logging.ServiceMethod, "UploadMultimedia"),
	}

	var (
		multimedia domain.Multimedia
		err        error
	)

	checksum := crc32.Checksum(file, crc32.MakeTable(crc32.Castagnoli))

	err = s.readOnlyTx(ctx, func(tx pgx.Tx) error {
		multimedia, err = s.dataStore.GetMultimediaByChecksumAndMediaType(ctx, tx, checksum, contentType)
		return err
	})
	if err != nil && !errors.Is(err, domain.ErrMultimediaNotFound) {
		return domain.Multimedia{}, logAndWrapError(ctx, err, descriptionFailedGetMultimediaByChecksumAndMediaType, logAttrs...)
	}

	if err == nil {
		return multimedia, nil
	}

	objectName := strconv.FormatUint(uint64(checksum), 10) + contentType
	objectName = strings.ReplaceAll(objectName, "/", "-")

	// Get the multimedia object before creating it.
	// This avoids creating it twice if a previous call failed to create an entry in the data store.
	multimediaObject, err := s.objectStore.GetMultimediaObject(ctx, objectName)
	if err != nil && !errors.Is(err, domain.ErrMultimediaNotFound) {
		return domain.Multimedia{}, logAndWrapError(ctx, err, descriptionFailedGetMultimediaObject, logAttrs...)
	}

	if errors.Is(err, domain.ErrMultimediaNotFound) {
		reader := bytes.NewReader(file)

		err = s.objectStore.CreateMultimediaObject(ctx, objectName, reader)
		if err != nil {
			return domain.Multimedia{}, logAndWrapError(ctx, err, descriptionFailedCreateMultimediaObject, logAttrs...)
		}

		multimediaObject, err = s.objectStore.GetMultimediaObject(ctx, objectName)
		if err != nil {
			return domain.Multimedia{}, logAndWrapError(ctx, err, descriptionFailedGetMultimediaObject, logAttrs...)
		}
	}

	err = s.readWriteTx(ctx, func(tx pgx.Tx) error {
		id, err := s.dataStore.CreateMultimedia(ctx, tx, multimediaObject)
		if err != nil {
			return err
		}

		multimedia, err = s.dataStore.GetMultimediaByID(ctx, tx, id)
		if err != nil {
			return err
		}

		return nil
	})
	if err != nil {
		return domain.Multimedia{}, logAndWrapError(ctx, err, descriptionFailedCreateMultimedia, logAttrs...)
	}

	return multimedia, nil
}
