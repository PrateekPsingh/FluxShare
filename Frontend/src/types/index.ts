// File types and interfaces

export type FileStatus = 'uploading' | 'uploaded' | 'processing' | 'failed' | 'downloading' | 'deleted';

export interface FileData {
  id: string;
  name: string;
  type: string;
  size: number;
  status: FileStatus;
  uploadDate: Date;
  progress?: number;
  error?: string;
}

export interface UploadFile {
  id: string;
  file: File;
  name: string;
  size: number;
  type: string;
  status: 'ready' | 'uploading' | 'uploaded' | 'failed';
  progress: number;
  error?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

export interface FileStats {
  totalFiles: number;
  uploadedFiles: number;
  downloadedFiles: number;
  storageUsed: number; // in bytes
  storageLimit: number; // in bytes
}

// API Response types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

// Filter types
export type FileFilter = 'all' | 'uploaded' | 'failed' | 'processing';

// Theme types
export type Theme = 'light' | 'dark' | 'system';

// ---------------------------------------------------------------------------
// Share types
// ---------------------------------------------------------------------------

export type ShareStatus = 'active' | 'expired' | 'revoked';

export interface Share {
  id: string;
  file_id: string;
  file_name: string;
  token: string;
  share_url: string;
  created_at: string;
  expires_at: string;
  revoked_at: string | null;
  status?: ShareStatus;
}

export interface CreateShareRequest {
  expires_in_hours: number;
}

export interface CreateShareResponse {
  share_id: string;
  share_url: string;
  expires_at: string;
}

export interface ListSharesResponse {
  shares: Share[];
}

export interface SharedFileInfo {
  id: string;
  fileId: string;
  fileName: string;
  fileSize?: number;
  fileType?: string;
  token: string;
  shareUrl: string;
  createdAt: string;
  expiresAt: string;
  revokedAt: string | null;
}

export interface GetSharedFileResponse {
  file: {
    id: string;
    name: string;
    size?: number;
    contentType?: string;
    expiresAt?: string;
  };
  error?: string;
}
