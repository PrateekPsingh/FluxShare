package model

import "time"

type File struct {
	ID          string
	FileName    string
	ObjectKey   string
	Size        int64
	ContentType string
	Status      string
	UploadedAt  time.Time
}