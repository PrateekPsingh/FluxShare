// Auth API service layer
// Connects to the backend auth endpoints at http://localhost:8080

import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080';

const authApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface RegisterResponse {
  id: string;
  email: string;
}

export interface LoginResponse {
  token: string;
}

export interface AuthError {
  error: string;
}

export class AuthApiError extends Error {
  message: string;

  constructor(message: string) {
    super(message);
    this.message = message;
  }
}

/**
 * POST /auth/register
 * Registers a new user with email and password.
 * Backend expects: { email: string, password: string }
 * Returns: { id, email } on success (201)
 */
export async function register(
  email: string,
  password: string
): Promise<RegisterResponse> {
  try {
    const response = await authApi.post<RegisterResponse>('/auth/register', {
      email,
      password,
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      const data = error.response.data as AuthError;
      throw new AuthApiError(data.error || 'Registration failed');
    }
    throw new AuthApiError('Unable to connect to server. Please check your connection.');
  }
}

/**
 * POST /auth/login
 * Logs in a user with email and password.
 * Backend expects: { email: string, password: string }
 * Returns: { token } on success (200)
 */
export async function login(
  email: string,
  password: string
): Promise<LoginResponse> {
  try {
    const response = await authApi.post<LoginResponse>('/auth/login', {
      email,
      password,
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      const data = error.response.data as AuthError;
      throw new AuthApiError(data.error || 'Login failed');
    }
    throw new AuthApiError('Unable to connect to server. Please check your connection.');
  }
}
