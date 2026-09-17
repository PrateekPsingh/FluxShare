package repository

import (
	"context"
	"database/sql"
	"errors"
	"fmt"

	"github.com/prateek/file-transfer-service/internal/model"
)

type PostgresShareRepository struct {
	db *sql.DB
}

func NewPostgresShareRepository(db *sql.DB) *PostgresShareRepository {
	return &PostgresShareRepository{
		db: db,
	}
}

func (r *PostgresShareRepository) Create(
	ctx context.Context,
	share *model.Share,
) error {

	query := `
		INSERT INTO shares (
			id,
			file_id,
			token,
			created_at,
			expires_at,
			revoked_at
		)
		VALUES ($1, $2, $3, $4, $5, $6)
	`

	_, err := r.db.ExecContext(
		ctx,
		query,
		share.ID,
		share.FileID,
		share.Token,
		share.CreatedAt,
		share.ExpiresAt,
		share.RevokedAt,
	)

	if err != nil {
		return fmt.Errorf("failed to create share: %w", err)
	}

	return nil
}

func (r *PostgresShareRepository) FindByToken(
	ctx context.Context,
	token string,
) (*model.Share, error) {

	query := `
		SELECT
			id,
			file_id,
			token,
			created_at,
			expires_at,
			revoked_at
		FROM shares
		WHERE token = $1
	`

	var share model.Share

	err := r.db.QueryRowContext(
		ctx,
		query,
		token,
	).Scan(
		&share.ID,
		&share.FileID,
		&share.Token,
		&share.CreatedAt,
		&share.ExpiresAt,
		&share.RevokedAt,
	)

	if err != nil {

		if errors.Is(err, sql.ErrNoRows) {
			return nil, errors.New("share not found")
		}

		return nil, fmt.Errorf("failed to find share: %w", err)
	}

	return &share, nil
}

func (r *PostgresShareRepository) FindByID(
	ctx context.Context,
	id string,
) (*model.Share, error) {

	query := `
		SELECT
			id,
			file_id,
			token,
			created_at,
			expires_at,
			revoked_at
		FROM shares
		WHERE id = $1
	`

	var share model.Share

	err := r.db.QueryRowContext(
		ctx,
		query,
		id,
	).Scan(
		&share.ID,
		&share.FileID,
		&share.Token,
		&share.CreatedAt,
		&share.ExpiresAt,
		&share.RevokedAt,
	)

	if err != nil {

		if errors.Is(err, sql.ErrNoRows) {
			return nil, errors.New("share not found")
		}

		return nil, fmt.Errorf("failed to find share: %w", err)
	}

	return &share, nil
}

func (r *PostgresShareRepository) Revoke(
	ctx context.Context,
	id string,
) error {

	query := `
		UPDATE shares
		SET revoked_at = NOW()
		WHERE id = $1
		AND revoked_at IS NULL
	`

	result, err := r.db.ExecContext(
		ctx,
		query,
		id,
	)

	if err != nil {
		return fmt.Errorf("failed to revoke share: %w", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to check revoked share: %w", err)
	}

	if rowsAffected == 0 {
		return errors.New("share not found or already revoked")
	}

	return nil
}

func (r *PostgresShareRepository) ListByUserID(
	ctx context.Context,
	userID string,
) ([]model.SharedLinkResponse, error) {

	query := `
		SELECT
			s.id,
			s.file_id,
			f.file_name,
			s.token,
			s.created_at,
			s.expires_at,
			s.revoked_at
		FROM shares s
		JOIN files f
			ON s.file_id = f.id
		WHERE f.user_id = $1
		ORDER BY s.created_at DESC
	`

	rows, err := r.db.QueryContext(
		ctx,
		query,
		userID,
	)

	if err != nil {
		return nil, fmt.Errorf(
			"failed to list shares: %w",
			err,
		)
	}

	defer rows.Close()

	var shares []model.SharedLinkResponse

	for rows.Next() {

		var share model.SharedLinkResponse

		err := rows.Scan(
			&share.ID,
			&share.FileID,
			&share.FileName,
			&share.Token,
			&share.CreatedAt,
			&share.ExpiresAt,
			&share.RevokedAt,
		)

		if err != nil {
			return nil, fmt.Errorf(
				"failed to scan share: %w",
				err,
			)
		}

		share.ShareURL = "/share/" + share.Token

		shares = append(shares, share)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf(
			"failed while reading shares: %w",
			err,
		)
	}

	return shares, nil
}