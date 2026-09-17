package main

import (
	"log"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	_ "github.com/prateek/file-transfer-service/docs"
	"github.com/prateek/file-transfer-service/internal/config"
	"github.com/prateek/file-transfer-service/internal/database"
	"github.com/prateek/file-transfer-service/internal/handler"
	"github.com/prateek/file-transfer-service/internal/middleware"
	"github.com/prateek/file-transfer-service/internal/repository"
	"github.com/prateek/file-transfer-service/internal/service"
	"github.com/prateek/file-transfer-service/internal/storage"
)

func main() {

	// Loading config items

	cfg, err := config.Load()

	if err != nil {
		log.Fatal(err)
	}

	// --------------------------
	// Connect to PostgreSQL
	// --------------------------
	db, err := database.NewPostgresDB()
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()

	// --------------------------
	// Create tables if required
	// --------------------------
	err = database.CreateTables(db)
	if err != nil {
		log.Fatal(err)
	}

	// user

	userRepo := repository.NewPostgresUserRepository(db)
	shareRepo := repository.NewPostgresShareRepository(db)
	authService := service.NewAuthService(userRepo)

	// Create MinIO Storage
	repo := repository.NewPostgresRepository(db)
	storage, err := storage.NewMinIOStorage()
	if err != nil {
		log.Fatal(err)
	}

	// Create business layer
	fileService := service.NewFileService(repo, storage)
	shareService := service.NewShareService(repo, shareRepo)

	// Create HTTP layer
	fileHandler := handler.NewFileHandler(fileService)

	authHandler := handler.NewAuthHandler(authService, cfg.JWTSecret)

	shareHandler := handler.NewShareHandler(
		shareService,
		fileService,
	)

	// Create router
	router := gin.Default()
	router.Use(cors.New(cors.Config{
		AllowOrigins: []string{
			cfg.FrontendHost,
		},
		AllowMethods: []string{
			"GET",
			"POST",
			"PUT",
			"PATCH",
			"DELETE",
			"HEAD",
			"OPTIONS",
		}, AllowHeaders: []string{
			"Origin",
			"Content-Type",
			"Accept",
			"Authorization",
		},
	}))

	authMiddleware := middleware.AuthMiddleware(cfg.JWTSecret)
	protected := router.Group("/")
	protected.Use(authMiddleware)

	protected.POST("/files", fileHandler.UploadFile)
	protected.GET("/files", fileHandler.ListFiles)
	protected.GET("/files/:id", fileHandler.DownloadFile)
	protected.DELETE("/files/:id", fileHandler.DeleteFile)
	protected.POST(
		"/files/:id/share",
		shareHandler.CreateShare,
	)

	protected.DELETE(
		"/shares/:id",
		shareHandler.RevokeShare,
	)

	protected.GET(
	"/shares",
	shareHandler.ListShares,
)
	router.POST("/auth/register", authHandler.Register)
	router.POST("/auth/login", authHandler.Login)
	router.GET("/share/:token", shareHandler.GetSharedFile)
	router.Static("/docs", "./docs")
	router.Static("/swagger", "./swagger-ui")
	log.Printf("Server started on %s", cfg.AppPort)

	if err := router.Run(":" + cfg.AppPort); err != nil {
		log.Fatal(err)
	}
}
