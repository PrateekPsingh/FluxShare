package repository

import (
	"context"
	"errors"
	"sync"

	"github.com/prateek/file-transfer-service/internal/model"
)

type MemoryRepository struct {
	mu    sync.RWMutex
	files map[string]model.File
}


// it is like a constructor that is used to initialise repository
func NewMemoryRepository() *MemoryRepository {
	return &MemoryRepository{
		files: make(map[string]model.File),
	}
} 

func (r *MemoryRepository) Save(ctx context.Context, file *model.File) error {
	r.mu.Lock()
	defer r.mu.Unlock()

	r.files[file.ID] = *file

	return nil
}

func (r *MemoryRepository) FindByID(ctx context.Context, id string, userID string) (*model.File, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()

	for _, file := range r.files {
		if file.ID == id && file.UserID == userID {
			return &file, nil
		}
	}

	return nil, errors.New("file not found")
}

func (r *MemoryRepository) List(ctx context.Context, userID string) ([]model.File, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()

	var files []model.File

	for _, file := range r.files {
		if file.UserID == userID {
			files = append(files, file)
		}
	}

	return files, nil
}