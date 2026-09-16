package repository

import (
	"context"
	"database/sql"
	"errors"
	"fmt"

	"github.com/prateek/file-transfer-service/internal/model"
)

type PostgresRepository struct {
	db *sql.DB
}

func NewPostgresRepository(db *sql.DB) *PostgresRepository {
	return &PostgresRepository{
		db: db,
	}
}

func (r *PostgresRepository) Save(
	ctx context.Context,
	file *model.File,
) error {

	query := `
		INSERT INTO files (
			id,
			user_id,
			file_name,
			object_key,
			size,
			content_type,
			status,
			uploaded_at
		)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
	`

	_, err := r.db.ExecContext(
		ctx,
		query,
		file.ID,
		file.UserID,
		file.FileName,
		file.ObjectKey,
		file.Size,
		file.ContentType,
		file.Status,
		file.UploadedAt,
	)

	if err != nil {
		return fmt.Errorf("failed to save file: %w", err)
	}

	return nil
}

func (r *PostgresRepository) FindByID(
	ctx context.Context,
	id string,
	userID string,
) (*model.File, error) {

	query := `
		SELECT
			id,
			user_id,
			file_name,
			object_key,
			size,
			content_type,
			status,
			uploaded_at
		FROM files
		WHERE id = $1
		AND user_id = $2
	`

	var file model.File

	err := r.db.QueryRowContext(
		ctx,
		query,
		id,
		userID,
	).Scan(
		&file.ID,
		&file.UserID,
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

		return nil, fmt.Errorf("failed to find file: %w", err)
	}

	return &file, nil
}

func (r *PostgresRepository) List(
	ctx context.Context,
	userID string,
) ([]model.File, error) {

	query := `
		SELECT
			id,
			user_id,
			file_name,
			object_key,
			size,
			content_type,
			status,
			uploaded_at
		FROM files
		WHERE user_id = $1
		ORDER BY uploaded_at DESC
	`

	rows, err := r.db.QueryContext(
		ctx,
		query,
		userID,
	)

	if err != nil {
		return nil, fmt.Errorf("failed to list files: %w", err)
	}

	defer rows.Close()

	var files []model.File

	for rows.Next() {

		var file model.File

		err := rows.Scan(
			&file.ID,
			&file.UserID,
			&file.FileName,
			&file.ObjectKey,
			&file.Size,
			&file.ContentType,
			&file.Status,
			&file.UploadedAt,
		)

		if err != nil {
			return nil, fmt.Errorf("failed to scan file: %w", err)
		}

		files = append(files, file)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("failed while reading files: %w", err)
	}

	return files, nil
}

func (r *PostgresRepository) Delete(
	ctx context.Context,
	id string,
	userID string,
) error {

	query := `
		DELETE FROM files
		WHERE id = $1
		AND user_id = $2
	`

	result, err := r.db.ExecContext(
		ctx,
		query,
		id,
		userID,
	)

	if err != nil {
		return fmt.Errorf("failed to delete file: %w", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to check deleted file: %w", err)
	}

	if rowsAffected == 0 {
		return errors.New("file not found")
	}

	return nil
}