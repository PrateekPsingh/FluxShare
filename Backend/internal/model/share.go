package model

import "time"

type Share struct {
	ID        string
	FileID    string
	Token     string
	CreatedAt time.Time
	ExpiresAt *time.Time
	RevokedAt *time.Time
}