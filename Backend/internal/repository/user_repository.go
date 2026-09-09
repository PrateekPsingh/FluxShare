package repository

import (
	"context"

	"github.com/prateek/file-transfer-service/internal/model"
)

type UserRepository interface {
	Create(ctx context.Context, user *model.User) error
	FindByEmail(ctx context.Context, email string) (*model.User, error)
}