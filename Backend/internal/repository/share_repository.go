package repository

import (
	"context"

	"github.com/prateek/file-transfer-service/internal/model"
)

type ShareRepository interface {

	Create(
		ctx context.Context,
		share *model.Share,
	) error

	FindByToken(
		ctx context.Context,
		token string,
	) (*model.Share, error)

	FindByID(
		ctx context.Context,
		id string,
	) (*model.Share, error)

	ListByUserID(
		ctx context.Context,
		userID string,
	) ([]model.SharedLinkResponse, error)

	Revoke(
		ctx context.Context,
		id string,
	) error
}