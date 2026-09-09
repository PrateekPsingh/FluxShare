package database

import (
	"database/sql"
	"fmt"
	"log"

	_ "github.com/lib/pq"

		"github.com/prateek/file-transfer-service/internal/config"
)

const createFilesTableQuery = `
CREATE TABLE IF NOT EXISTS files (
	id TEXT PRIMARY KEY,
	file_name TEXT NOT NULL,
	object_key TEXT NOT NULL,
	size BIGINT NOT NULL,
	content_type TEXT NOT NULL,
	status TEXT NOT NULL,
	uploaded_at TIMESTAMP NOT NULL
);
`

const createUsersTableQuery = `
CREATE TABLE IF NOT EXISTS users (
	id TEXT PRIMARY KEY,
	email TEXT NOT NULL UNIQUE,
	password_hash TEXT NOT NULL,
	created_at TIMESTAMP NOT NULL
);
`


// NewPostgresDB creates a connection pool to PostgreSQL.
func NewPostgresDB() (*sql.DB, error) {

	cfg, err := config.Load();

	if err != nil{
		log.Fatal(err)
	}

	connStr := fmt.Sprintf(
	"host=%s port=%s user=%s password=%s dbname=%s sslmode=disable",
	cfg.DBHost,
	cfg.DBPort,
	cfg.DBUser,
	cfg.DBPassword,
	cfg.DBName,
)

	db, err := sql.Open("postgres", connStr)
	if err != nil {
		return nil, err
	}

	// Verify that the database is reachable.
	if err := db.Ping(); err != nil {
		return nil, err
	}

	fmt.Println("✅ Connected to PostgreSQL")

	return db, nil
}

// CreateTables creates all required database tables.
func CreateTables(db *sql.DB) error {

	_, err := db.Exec(createUsersTableQuery)
	if err != nil {
		return err
	}

	fmt.Println("✅ users table is ready")

	_, err = db.Exec(createFilesTableQuery)
	if err != nil {
		return err
	}

	fmt.Println("✅ files table is ready")

	return nil
}