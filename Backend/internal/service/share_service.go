package service

import (
	"context"
	"crypto/rand"
	"encoding/base64"
	"errors"
	"fmt"
	"time"

	"github.com/google/uuid"

	"github.com/prateek/file-transfer-service/internal/model"
	"github.com/prateek/file-transfer-service/internal/repository"
)

type ShareService struct {
	fileRepo  repository.FileRepository
	shareRepo repository.ShareRepository
}

func NewShareService(
	fileRepo repository.FileRepository,
	shareRepo repository.ShareRepository,
) *ShareService {

	return &ShareService{
		fileRepo:  fileRepo,
		shareRepo: shareRepo,
	}
}

func generateShareToken() (string, error) {

	bytes := make([]byte, 32)

	_, err := rand.Read(bytes)
	if err != nil {
		return "", fmt.Errorf("failed to generate share token: %w", err)
	}

	return base64.RawURLEncoding.EncodeToString(bytes), nil
}

func (s *ShareService) CreateShare(
	ctx context.Context,
	userID string,
	fileID string,
	expiresInHours int,
) (*model.Share, error) {

	_, err := s.fileRepo.FindByID(
		ctx,
		fileID,
		userID,
	)

	if err != nil {
		return nil, errors.New("file not found")
	}

	token, err := generateShareToken()
	if err != nil {
		return nil, err
	}

	var expiresAt *time.Time

	if expiresInHours > 0 {
		expiry := time.Now().Add(
			time.Duration(expiresInHours) * time.Hour,
		)

		expiresAt = &expiry
	}

	share := &model.Share{
		ID:        uuid.New().String(),
		FileID:    fileID,
		Token:     token,
		CreatedAt: time.Now(),
		ExpiresAt: expiresAt,
		RevokedAt: nil,
	}

	err = s.shareRepo.Create(
		ctx,
		share,
	)

	if err != nil {
		return nil, fmt.Errorf("failed to create share: %w", err)
	}

	return share, nil
}

func (s *ShareService) GetSharedFile(ctx context.Context, token string)(*model.File, error){
share, err := s.shareRepo.FindByToken(ctx, token)

    if err != nil {
        return nil, errors.New("invalid share link")
    }

    if share.RevokedAt != nil {
        return nil, errors.New("share link has been revoked")
    }

    if share.ExpiresAt != nil &&
        time.Now().After(*share.ExpiresAt) {
        return nil, errors.New("share link has expired")
    }

    file, err := s.fileRepo.FindByIDForShare(
        ctx,
        share.FileID,
    )

    if err != nil {
        return nil, errors.New("file not found")
    }

    return file, nil

}

func (s *ShareService) RevokeShare(
    ctx context.Context,
    userID string,
    shareID string,
) error {

    share, err := s.shareRepo.FindByID(
        ctx,
        shareID,
    )

    if err != nil {
        return errors.New("share not found")
    }

    _, err = s.fileRepo.FindByID(
        ctx,
        share.FileID,
        userID,
    )

    if err != nil {
        return errors.New("file not found")
    }

    err = s.shareRepo.Revoke(
        ctx,
        shareID,
    )

    if err != nil {
        return err
    }

    return nil
}

func (s *ShareService) ListShares(
	ctx context.Context,
	userID string,
) ([]model.SharedLinkResponse, error) {

	shares, err := s.shareRepo.ListByUserID(
		ctx,
		userID,
	)

	if err != nil {
		return nil, fmt.Errorf(
			"failed to list shares: %w",
			err,
		)
	}

	return shares, nil
}