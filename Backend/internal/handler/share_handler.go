package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"

	"github.com/prateek/file-transfer-service/internal/service"
)

type ShareHandler struct {
	shareService *service.ShareService
	fileService  *service.FileService
}

func NewShareHandler(
	shareService *service.ShareService,
	fileService *service.FileService,
) *ShareHandler {
	return &ShareHandler{
		shareService: shareService,
		fileService:  fileService,
	}
}

type createShareRequest struct {
	ExpiresInHours int `json:"expires_in_hours"`
}

func (h *ShareHandler) CreateShare(c *gin.Context) {

	userID := getUserID(c)

	fileID := c.Param("id")

	var req createShareRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "invalid request body",
		})
		return
	}

	share, err := h.shareService.CreateShare(
		c.Request.Context(),
		userID,
		fileID,
		req.ExpiresInHours,
	)

	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": err.Error(),
		})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"share_id":  share.ID,
		"share_url": "/share/" + share.Token,
		"expires_at": share.ExpiresAt,
	})
}


func (h *ShareHandler) GetSharedFile(c *gin.Context) {

	token := c.Param("token")

	file, err := h.shareService.GetSharedFile(
		c.Request.Context(),
		token,
	)

	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"error": err.Error(),
		})
		return
	}

	stream, err := h.fileService.DownloadStream(
		c.Request.Context(),
		file.ObjectKey,
	)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "failed to download file",
		})
		return
	}

	defer stream.Close()

	c.Header(
		"Content-Disposition",
		`attachment; filename="`+file.FileName+`"`,
	)

	c.DataFromReader(
		http.StatusOK,
		file.Size,
		file.ContentType,
		stream,
		nil,
	)
}

func (h *ShareHandler) RevokeShare(c *gin.Context) {

	userID := getUserID(c)

	shareID := c.Param("id")

	err := h.shareService.RevokeShare(
		c.Request.Context(),
		userID,
		shareID,
	)

	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "share revoked successfully",
	})
}

func (h *ShareHandler) ListShares(c *gin.Context) {

	userID:= getUserID(c)

	shares, err := h.shareService.ListShares(
		c.Request.Context(),
		userID,
	)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "failed to list shares",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"shares": shares,
	})
}