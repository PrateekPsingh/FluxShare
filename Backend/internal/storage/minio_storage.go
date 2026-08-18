package storage

import (
	"context"
	"io"

	"github.com/minio/minio-go/v7"
	"github.com/minio/minio-go/v7/pkg/credentials"
)

type MinIOStorage struct {
	client *minio.Client
	bucket string
}

func NewMinIOStorage() (*MinIOStorage, error) {

	client, err := minio.New(
		"localhost:9000",
		&minio.Options{
			Creds: credentials.NewStaticV4(
				"minioadmin",
				"minioadmin",
				"",
			),
			Secure: false,
		},
	)

	ctx := context.Background()

	exists, err := client.BucketExists(
		ctx,
		"uploads",
	)

	if err != nil {
		return nil, err
	}

	if !exists {

		err = client.MakeBucket(
			ctx,
			"uploads",
			minio.MakeBucketOptions{},
		)

		if err != nil {
			return nil, err
		}
	}

	return &MinIOStorage{
		client: client,
		bucket: "uploads",
	}, nil

}

func (s *MinIOStorage) Upload(
	ctx context.Context,
	objectKey string,
	reader io.Reader,
	size int64,
	contentType string,
) error {

	_, err := s.client.PutObject(
		ctx,
		s.bucket,
		objectKey,
		reader,
		size,
		minio.PutObjectOptions{
			ContentType: contentType,
		},
	)

	if err != nil {
		return err
	}

	return nil
}

func (s *MinIOStorage) Download(
	ctx context.Context,
	objectKey string,
) (io.ReadCloser, error) {

	object, err := s.client.GetObject(
		ctx,
		s.bucket,
		objectKey,
		minio.GetObjectOptions{},
	)

	if err != nil {
		return nil, err
	}

	return object, nil
}

func (s *MinIOStorage) Delete(
	ctx context.Context,
	objectKey string,
) error {

	err := s.client.RemoveObject(
		ctx,
		s.bucket,
		objectKey,
		minio.RemoveObjectOptions{},
	)

	if err != nil {
		return err
	}

	return nil
}
