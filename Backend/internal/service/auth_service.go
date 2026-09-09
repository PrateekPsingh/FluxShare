package service

import (
	"context"
	"errors"
	"strings"
	"time"

	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"

	"github.com/prateek/file-transfer-service/internal/model"
	"github.com/prateek/file-transfer-service/internal/repository"
	"github.com/prateek/file-transfer-service/internal/auth"

)

type AuthService struct {
	userRepo repository.UserRepository
}

func NewAuthService(userRepo repository.UserRepository) *AuthService {
	return &AuthService{
		userRepo: userRepo,
	}
}

func (s *AuthService) Register(
	ctx context.Context,
	email string,
	password string,
) (*model.User, error) {

	// 1. Basic validation
	email = strings.TrimSpace(strings.ToLower(email))

	if email == "" {
		return nil, errors.New("email is required")
	}

	if password == "" {
		return nil, errors.New("password is required")
	}

	if len(password) < 8 {
		return nil, errors.New("password must be at least 8 characters")
	}

	// 2. Check whether user already exists
	existingUser, err := s.userRepo.FindByEmail(ctx, email)

	if err == nil && existingUser != nil {
		return nil, errors.New("user already exists")
	}

	// 3. Hash password
	passwordHash, err := bcrypt.GenerateFromPassword(
		[]byte(password),
		bcrypt.DefaultCost,
	)
	if err != nil {
		return nil, err
	}

	// 4. Create user
	user := &model.User{
		ID:           uuid.New().String(),
		Email:        email,
		PasswordHash: string(passwordHash),
		CreatedAt:    time.Now(),
	}

	// 5. Save user
	err = s.userRepo.Create(ctx, user)
	if err != nil {
		return nil, err
	}

	return user, nil
}

func (s *AuthService) Login(
	ctx context.Context,
	email string,
	password string,
	jwtSecret string,
) (string, error) {

	email = strings.TrimSpace(strings.ToLower(email))

	if email == "" || password == "" {
		return "", errors.New("email and password are required")
	}

	// Find user
	user, err := s.userRepo.FindByEmail(ctx, email)
	if err != nil {
		return "", errors.New("invalid email or password")
	}

	// Compare supplied password with stored bcrypt hash
	err = bcrypt.CompareHashAndPassword(
		[]byte(user.PasswordHash),
		[]byte(password),
	)

	if err != nil {
		return "", errors.New("invalid email or password")
	}

	// Generate JWT
	token, err := auth.GenerateToken(
		user.ID,
		user.Email,
		jwtSecret,
	)

	if err != nil {
		return "", err
	}

	return token, nil
}