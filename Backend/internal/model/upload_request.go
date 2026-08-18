package model

import "io"

type UploadRequest struct {
	FileName    string
	ContentType string
	Size        int64
	Reader      io.Reader
}