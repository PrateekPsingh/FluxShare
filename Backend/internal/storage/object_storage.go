package storage

import (
	"context"
	"io"
)

type ObjectStorage interface {
	Upload(
		ctx context.Context,
		objectKey string,
		reader io.Reader,
		size int64,
		contentType string,
	) error

	Download(
		ctx context.Context,
		objectKey string,
	) (io.ReadCloser, error)

	Delete(
		ctx context.Context,
		objectKey string,
	) error
}

