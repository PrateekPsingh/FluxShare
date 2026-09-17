package model

import "time"

type SharedLinkResponse struct {
	ID        string     `json:"id"`
	FileID    string     `json:"file_id"`
	FileName  string     `json:"file_name"`
	Token     string     `json:"token"`
	ShareURL  string     `json:"share_url"`
	CreatedAt time.Time  `json:"created_at"`
	ExpiresAt *time.Time `json:"expires_at"`
	RevokedAt *time.Time `json:"revoked_at"`
}