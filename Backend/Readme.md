# File Transfer Service

A RESTful file transfer service built with **Go** and the **Gin** framework. The application allows users to upload, download, list, and delete files. File metadata is stored in **PostgreSQL**, while file contents are stored in **MinIO** object storage.

## Features

* Upload files using multipart/form-data
* Download files by ID
* List uploaded file metadata
* Delete files
* Store metadata in PostgreSQL
* Store file contents in MinIO
* Dockerized development environment
* Layered architecture with dependency injection

---

## Tech Stack

* Go
* Gin
* PostgreSQL
* MinIO
* Docker
* Docker Compose

---

## Architecture

```text
                  Client
                     │
               HTTP REST API
                     │
               Gin Handlers
                     │
                File Service
           ┌─────────┴─────────┐
           │                   │
 Repository Interface   Storage Interface
           │                   │
 PostgreSQL Repo        MinIO Storage
           │                   │
      PostgreSQL            MinIO
```

### Design Overview

* **Handlers** receive HTTP requests and generate HTTP responses.
* **Service** contains the business logic.
* **Repository** manages file metadata stored in PostgreSQL.
* **Storage** manages file objects stored in MinIO.
* The service depends on interfaces rather than concrete implementations, making the application easy to extend and test.

---

## Project Structure

```text
.
├── internal/
│   ├── handler/
│   ├── model/
│   ├── repository/
│   ├── service/
│   └── storage/
├── docs/
│   └── openapi.yaml
├── Dockerfile
├── docker-compose.yml
├── go.mod
├── go.sum
├── main.go
└── README.md
```

---

## API Endpoints

| Method | Endpoint    | Description         |
| ------ | ----------- | ------------------- |
| POST   | /files      | Upload a file       |
| GET    | /files      | List uploaded files |
| GET    | /files/{id} | Download a file     |
| DELETE | /files/{id} | Delete a file       |

---

## Running the Application

### Prerequisites

* Go
* Docker
* Docker Compose

### Start Infrastructure

```bash
docker compose up -d
```

### Run the API

```bash
go run .
```

---

## OpenAPI Documentation

The OpenAPI specification is available at:

```text
docs/openapi.yaml
```

This document describes all API endpoints, request bodies, response schemas, and error responses.

---

## Design Decisions

* PostgreSQL is used to store file metadata.
* MinIO is used to store file contents.
* Metadata and file storage are intentionally separated to improve scalability and maintainability.
* Dependency Injection and interfaces are used to decouple the service layer from storage implementations.

---

## Author

Prateek
