package repository

import (
	"context"

	"github.com/prateek/file-transfer-service/internal/model"
)

type FileRepository interface {
	Save(ctx context.Context, file *model.File) error

	FindByID(ctx context.Context, id string) (*model.File, error)

	List(ctx context.Context) ([]model.File, error)

	Delete(ctx context.Context, id string) error
}