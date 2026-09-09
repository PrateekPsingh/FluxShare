package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"

	"github.com/prateek/file-transfer-service/internal/service"
)

type AuthHandler struct {
	authService *service.AuthService
	jwtSecret   string
}

func NewAuthHandler(
	authService *service.AuthService,
	jwtSecret string,
) *AuthHandler {

	return &AuthHandler{
		authService: authService,
		jwtSecret:   jwtSecret,
	}
}

type registerRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type loginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}


func (h *AuthHandler) Register(c *gin.Context) {

	var req registerRequest

	// Read JSON body
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "invalid request body",
		})
		return
	}

	// Call business logic
	user, err := h.authService.Register(
		c.Request.Context(),
		req.Email,
		req.Password,
	)

	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": err.Error(),
		})
		return
	}

	// Don't send password hash to frontend
	c.JSON(http.StatusCreated, gin.H{
		"id":    user.ID,
		"email": user.Email,
	})
}

func (h *AuthHandler) Login(c *gin.Context) {

	var req loginRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "invalid request body",
		})
		return
	}

	token, err := h.authService.Login(
		c.Request.Context(),
		req.Email,
		req.Password,
		h.jwtSecret,
	)

	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"token": token,
	})
}