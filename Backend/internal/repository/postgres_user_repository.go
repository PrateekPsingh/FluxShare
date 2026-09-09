package repository

import (
	"context"
	"database/sql"
	"errors"

	"github.com/prateek/file-transfer-service/internal/model"
)

type PostgresUserRepository struct {
	db *sql.DB
}

func NewPostgresUserRepository(db *sql.DB) *PostgresUserRepository {
	return &PostgresUserRepository{
		db: db,
	}
}

func (r *PostgresUserRepository) Create(
	ctx context.Context,
	user *model.User,
) error {

	query := `
		INSERT INTO users (
			id,
			email,
			password_hash,
			created_at
		)
		VALUES ($1, $2, $3, $4)
	`

	_, err := r.db.ExecContext(
		ctx,
		query,
		user.ID,
		user.Email,
		user.PasswordHash,
		user.CreatedAt,
	)

	return err
}

func (r *PostgresUserRepository) FindByEmail(
	ctx context.Context,
	email string,
) (*model.User, error) {

	query := `
		SELECT
			id,
			email,
			password_hash,
			created_at
		FROM users
		WHERE email = $1
	`

	var user model.User

	err := r.db.QueryRowContext(
		ctx,
		query,
		email,
	).Scan(
		&user.ID,
		&user.Email,
		&user.PasswordHash,
		&user.CreatedAt,
	)

	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, errors.New("user not found")
		}

		return nil, err
	}

	return &user, nil
}