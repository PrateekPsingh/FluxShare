package repository

import (
	"context"

	"github.com/prateek/file-transfer-service/internal/model"
)

type FileRepository interface {
	Save(ctx context.Context, file *model.File) error

	FindByID(ctx context.Context, id string, userID string,) (*model.File, error)

	List(ctx context.Context, userID string,) ([]model.File, error)

	Delete(ctx context.Context, id string, userID string,) error
}