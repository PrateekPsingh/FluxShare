package database

import (
	"database/sql"
	"fmt"

	_ "github.com/lib/pq"
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

// NewPostgresDB creates a connection pool to PostgreSQL.
func NewPostgresDB() (*sql.DB, error) {

	connStr := "host=localhost port=5432 user=postgres password=postgres dbname=filedb sslmode=disable"

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

	_, err := db.Exec(createFilesTableQuery)
	if err != nil {
		return err
	}

	fmt.Println("✅ files table is ready")

	return nil
}