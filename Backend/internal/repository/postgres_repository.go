package repository

import (
	"context"
	"database/sql"
	"errors"

	"github.com/prateek/file-transfer-service/internal/model"
	
)

type PostgresRepository struct {
	db *sql.DB
}

func NewPostgresRepository(db *sql.DB) *PostgresRepository{
	return &PostgresRepository{
		db : db,
	}
}

func (r *PostgresRepository) Save(ctx context.Context, file *model.File) error {

	query := `
	INSERT INTO files (
		id,
		file_name,
		object_key,
		size,
		content_type,
		status,
		uploaded_at
	)
	VALUES ($1, $2, $3, $4, $5, $6, $7)
	`

	_, err := r.db.ExecContext(
		ctx,
		query,
		file.ID,
		file.FileName,
		file.ObjectKey,
		file.Size,
		file.ContentType,
		file.Status,
		file.UploadedAt,
	)

	return err
}

func (r *PostgresRepository) FindByID(ctx context.Context, id string) (*model.File, error) {

	query := `
	SELECT
		id,
		file_name,
		object_key,
		size,
		content_type,
		status,
		uploaded_at
	FROM files
	WHERE id = $1
	`

	var file model.File

	err := r.db.QueryRowContext(ctx, query, id).Scan(
		&file.ID,
		&file.FileName,
		&file.ObjectKey,
		&file.Size,
		&file.ContentType,
		&file.Status,
		&file.UploadedAt,
	)

	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, errors.New("file not found")
		}
		return nil, err
	}

	return &file, nil
}

func (r *PostgresRepository) List(ctx context.Context) ([]model.File, error) {

	query := `
	SELECT
		id,
		file_name,
		object_key,
		size,
		content_type,
		status,
		uploaded_at
	FROM files
	ORDER BY uploaded_at DESC
	`

	rows, err := r.db.QueryContext(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var files []model.File

	for rows.Next() {

		var file model.File

		err := rows.Scan(
			&file.ID,
			&file.FileName,
			&file.ObjectKey,
			&file.Size,
			&file.ContentType,
			&file.Status,
			&file.UploadedAt,
		)
		if err != nil {
			return nil, err
		}

		files = append(files, file)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return files, nil
}


func (r *PostgresRepository) Delete(ctx context.Context, id string) error {

	_, err := r.db.ExecContext(
		ctx,
		`DELETE FROM files WHERE id = $1`,
		id,
	)

	return err
}
