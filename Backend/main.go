package main

import (
    
	"log"

	"github.com/gin-gonic/gin"
    _ "github.com/prateek/file-transfer-service/docs"
	"github.com/prateek/file-transfer-service/internal/database"
	"github.com/prateek/file-transfer-service/internal/handler"
	"github.com/prateek/file-transfer-service/internal/repository"
	"github.com/prateek/file-transfer-service/internal/service"
	"github.com/prateek/file-transfer-service/internal/storage"
	"github.com/gin-contrib/cors"
)

func main() {

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

	// Create MinIO Storage
	repo := repository.NewPostgresRepository(db)
	storage, err := storage.NewMinIOStorage()
	if err != nil {
		log.Fatal(err)
	}

	// Create business layer
	fileService := service.NewFileService(repo, storage)

	// Create HTTP layer
	fileHandler := handler.NewFileHandler(fileService)

	// Create router
	router := gin.Default()
	router.Use(cors.New(cors.Config{
    AllowOrigins: []string{
        "http://localhost:5173",
    },
	AllowMethods: []string{
		"GET",
		"POST",
		"PUT",
		"PATCH",
		"DELETE",
		"HEAD",
		"OPTIONS",
	},AllowHeaders: []string{
		"Origin",
		"Content-Type",
		"Accept",
		"Authorization",
	},
}))

	router.POST("/files", fileHandler.UploadFile)
	router.GET("/files", fileHandler.ListFiles)
	router.GET("/files/:id", fileHandler.DownloadFile)
	router.DELETE("/files/:id", fileHandler.DeleteFile)
    router.Static("/docs", "./docs")
    router.Static("/swagger", "./swagger-ui")
	log.Println("Server started on :8080")

	if err := router.Run(":8080"); err != nil {
		log.Fatal(err)
	}
}

