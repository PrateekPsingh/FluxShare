package storage

import (
	"bytes"
	"context"
	"io"
	"sync"
)

type MemoryStorage struct {
	mu      sync.RWMutex
	objects map[string][]byte
}

func NewMemoryStorage() *MemoryStorage {
	return &MemoryStorage{
		objects: make(map[string][]byte),
	}
}

func (s *MemoryStorage) Upload(
	ctx context.Context,
	objectKey string,
	reader io.Reader,
	size int64,
	contentType string,
) error {

	s.mu.Lock()
	defer s.mu.Unlock()

	data, err := io.ReadAll(reader)
	if err != nil {
		return err
	}

	s.objects[objectKey] = data

	return nil
}

func (s *MemoryStorage) Download(
	ctx context.Context,
	objectKey string,
) (io.ReadCloser, error) {

	s.mu.RLock()
	defer s.mu.RUnlock()

	data, exists := s.objects[objectKey]
	if !exists {
		return nil, io.EOF
	}

	return io.NopCloser(bytes.NewReader(data)), nil
}