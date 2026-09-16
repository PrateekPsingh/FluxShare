package service

import (
	"context"
	"fmt"
	"io"
	"mime/multipart"
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

func (s *FileService) UploadFile(
	ctx context.Context,
	userID string,
	fileHeader *multipart.FileHeader,
) (*model.File, error) {

	file, err := fileHeader.Open()
	if err != nil {
		return nil, fmt.Errorf("failed to open uploaded file: %w", err)
	}
	defer file.Close()

	fileID := uuid.New().String()

	objectKey := fileID + "-" + fileHeader.Filename

	err = s.storage.Upload(
		ctx,
		objectKey,
		file,
		fileHeader.Size,
		fileHeader.Header.Get("Content-Type"),
	)
	if err != nil {
		return nil, fmt.Errorf("failed to upload file to storage: %w", err)
	}

	fileModel := &model.File{
		ID:          fileID,
		UserID:      userID,
		FileName:    fileHeader.Filename,
		ObjectKey:   objectKey,
		Size:        fileHeader.Size,
		ContentType: fileHeader.Header.Get("Content-Type"),
		Status:      "uploaded",
		UploadedAt:  time.Now(),
	}

	err = s.repo.Save(ctx, fileModel)
	if err != nil {
		return nil, fmt.Errorf("failed to save file metadata: %w", err)
	}

	return fileModel, nil
}

func (s *FileService) DownloadFile(
	ctx context.Context,
	id string,
	userID string,
) (*model.File, error) {

	file, err := s.repo.FindByID(ctx, id, userID)
	if err != nil {
		return nil, err
	}

	return file, nil
}

func (s *FileService) DownloadStream(
	ctx context.Context,
	objectKey string,
) (io.ReadCloser, error) {

	return s.storage.Download(ctx, objectKey)
}

func (s *FileService) ListFiles(
	ctx context.Context,
	userID string,
) ([]model.File, error) {

	files, err := s.repo.List(ctx, userID)
	if err != nil {
		return nil, err
	}

	return files, nil
}

func (s *FileService) DeleteFile(
	ctx context.Context,
	id string,
	userID string,
) error {

	file, err := s.repo.FindByID(ctx, id, userID)
	if err != nil {
		return err
	}

	err = s.storage.Delete(ctx, file.ObjectKey)
	if err != nil {
		return fmt.Errorf("failed to delete file from storage: %w", err)
	}

	err = s.repo.Delete(ctx, id, userID)
	if err != nil {
		return fmt.Errorf("failed to delete file metadata: %w", err)
	}

	return nil
}