package handler

import (
	"net/http"
	"io"
	"github.com/gin-gonic/gin"
	"fmt"

	"github.com/prateek/file-transfer-service/internal/service"
)

type FileHandler struct {
	service *service.FileService
}

func NewFileHandler(service *service.FileService) *FileHandler {
	return &FileHandler{
		service: service,
	}
}

func getUserID(c *gin.Context) string {
	val, exists := c.Get("user_id")
	if !exists {
		return ""
	}
	id, ok := val.(string)
	if !ok {
		return ""
	}
	return id
}

func (h *FileHandler) UploadFile(c *gin.Context) {

	userID := getUserID(c)
	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error": "user ID is required",
		})
		return
	}

	// Get uploaded file metadata
	fileHeader, err := c.FormFile("file")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "file is required",
		})
		return
	}

	// Call business layer
	file, err := h.service.UploadFile(c.Request.Context(), userID, fileHeader)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"id":          file.ID,
		"fileName":    file.FileName,
		"objectKey":   file.ObjectKey,
		"size":        file.Size,
		"contentType": file.ContentType,
		"status":      file.Status,
	})
}

func (h *FileHandler) ListFiles(c *gin.Context) {

	userID := getUserID(c)
	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error": "user ID is required",
		})
		return
	}

    files, err := h.service.ListFiles(c.Request.Context(), userID)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{
            "error": err.Error(),
        })
        return
    }

    c.JSON(http.StatusOK, files)
}

func (h *FileHandler) DownloadFile(c *gin.Context) {

	id := c.Param("id")
	userID := getUserID(c)

	file, err := h.service.DownloadFile(
		c.Request.Context(),
		id,
		userID,
	)

	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"error": err.Error(),
		})
		return
	}

	c.Header(
		"Content-Disposition",
		fmt.Sprintf(`attachment; filename="%s"`, file.FileName),
	)

	c.Header(
		"Content-Type",
		file.ContentType,
	)

	// Stream the file from MinIO
	reader, err := h.service.DownloadStream(c.Request.Context(), file.ObjectKey)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": err.Error(),
		})
		return
	}
	defer reader.Close()

	io.Copy(c.Writer, reader)
}

func (h *FileHandler) DeleteFile(c *gin.Context) {

	id := c.Param("id")
	userID := getUserID(c)

	err := h.service.DeleteFile(c.Request.Context(), id, userID)


	if err != nil {

		if err.Error() == "file not found" {
			c.JSON(http.StatusNotFound, gin.H{
				"error": err.Error(),
			})
			return
		}

		c.JSON(http.StatusInternalServerError, gin.H{
			"error": err.Error(),
		})
		return
	}

	c.Status(http.StatusNoContent)
}