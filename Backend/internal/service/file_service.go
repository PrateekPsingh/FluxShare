package service

import (
	"context"
	"fmt"

	"time"

	"github.com/google/uuid"

	"github.com/prateek/file-transfer-service/internal/model"
	"github.com/prateek/file-transfer-service/internal/repository"
	"github.com/prateek/file-transfer-service/internal/storage"
)

type FileService struct {
	repo    repository.FileRepository
	storage storage.ObjectStorage
}

func NewFileService(
	repo repository.FileRepository,
	storage storage.ObjectStorage,
) *FileService {
	return &FileService{
		repo:    repo,
		storage: storage,
	}
}

func (s *FileService) UploadFile(ctx context.Context, file *model.UploadRequest) error {
	// Upload workflow will be implemented later

	// 1. Generate business values
	id := uuid.NewString()
	objectKey := fmt.Sprintf("%s_%s", id, file.FileName)

	// 2. Store the file bytes
	if err := s.storage.Upload(
		ctx,
		objectKey,
		file.Reader,
		file.Size,
		file.ContentType,
	); err != nil {
		return err
	}

	// 3. Create the domain model
	files := &model.File{
		ID:          id,
		FileName:    file.FileName,
		ObjectKey:   objectKey,
		Size:        file.Size,
		ContentType: file.ContentType,
		Status:      "uploaded",
		UploadedAt:  time.Now(),
	}

	// 4. Save the metadata
	if err := s.repo.Save(ctx, files); err != nil {
		return err
	}

	return nil
}

func (s *FileService) DownloadFile(
	ctx context.Context,
	id string,
) (*model.DownloadResponse, error) {

	// Step 1: Find file metadata
	file, err := s.repo.FindByID(ctx, id)
	if err != nil {
		return nil, err
	}

	// Step 2: Download file content
	reader, err := s.storage.Download(ctx, file.ObjectKey)
	if err != nil {
		return nil, err
	}

	// Step 3: Build response
	return &model.DownloadResponse{
		FileName:    file.FileName,
		ContentType: file.ContentType,
		Reader:      reader,
	}, nil
}

func (s *FileService) ListFiles(ctx context.Context) ([]model.File, error) {
	// List workflow will be implemented later
	return s.repo.List(ctx)
}

func (s *FileService) DeleteFile(
	ctx context.Context,
	id string,
) error {

	file, err := s.repo.FindByID(ctx, id)
	if err != nil {
		return err
	}

	if err := s.storage.Delete(ctx, file.ObjectKey); err != nil {
		return err
	}

	if err := s.repo.Delete(ctx, id); err != nil {
		return err
	}

	return nil
}
