package model

import "io"

type DownloadResponse struct {
	FileName    string
	ContentType string
	Reader      io.ReadCloser
}