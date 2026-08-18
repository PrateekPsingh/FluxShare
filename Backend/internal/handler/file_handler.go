package handler

import (
	"net/http"
     "io"
	"github.com/gin-gonic/gin"
	"fmt"

	"github.com/prateek/file-transfer-service/internal/model"
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

func (h *FileHandler) UploadFile(c *gin.Context) {

	// Get uploaded file metadata
	fileHeader, err := c.FormFile("file")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "file is required",
		})
		return
	}

	// Open uploaded file
	file, err := fileHeader.Open()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "unable to read uploaded file",
		})
		return
	}
	defer file.Close()

	// Convert HTTP request into UploadRequest
	req := &model.UploadRequest{
		FileName:    fileHeader.Filename,
		ContentType: fileHeader.Header.Get("Content-Type"),
		Size:        fileHeader.Size,
		Reader:      file,
	}

	// Call business layer
	err = h.service.UploadFile(c.Request.Context(), req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "file uploaded successfully",
	})
}

func (h *FileHandler) ListFiles(c *gin.Context) {

    files, err := h.service.ListFiles(c.Request.Context())
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

	response, err := h.service.DownloadFile(
		c.Request.Context(),
		id,
	)

	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"error": err.Error(),
		})
		return
	}

	defer response.Reader.Close()

	c.Header(
		"Content-Disposition",
		fmt.Sprintf(`attachment; filename="%s"`, response.FileName),
	)

	c.Header(
		"Content-Type",
		response.ContentType,
	)

	io.Copy(c.Writer, response.Reader)
}

func (h *FileHandler) DeleteFile(c *gin.Context) {

	id := c.Param("id")

	err := h.service.DeleteFile(c.Request.Context(), id)
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