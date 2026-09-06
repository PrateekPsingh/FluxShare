// API service layer - connects to the real backend
// Backend runs on http://localhost:8080

import axios from 'axios';
import type { FileData, FileStats } from '../types';

const API_BASE_URL = 'http://localhost:8080';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export class ApiError extends Error {
  code: 'network' | 'server' | 'too-large' | 'not-found' | 'unauthorized';

  constructor(code: ApiError['code'], message: string) {
    super(message);
    this.code = code;
  }
}

const MAX_FILE_SIZE_MB = 100;

// Transform backend file format to frontend FileData format
function transformFile(backendFile: BackendFile): FileData {
  return {
    id: backendFile.ID,
    name: backendFile.FileName,
    type: backendFile.ContentType,
    size: backendFile.Size,
    status: mapStatus(backendFile.Status),
    uploadDate: new Date(backendFile.UploadedAt),
    progress: 100,
  };
}

function mapStatus(backendStatus: string): FileData['status'] {
  const statusMap: Record<string, FileData['status']> = {
    uploaded: 'uploaded',
    uploading: 'uploading',
    processing: 'processing',
    failed: 'failed',
  };
  return statusMap[backendStatus.toLowerCase()] || 'uploaded';
}

// Backend file format from the Go API
interface BackendFile {
  ID: string;
  FileName: string;
  ObjectKey: string;
  Size: number;
  ContentType: string;
  Status: string;
  UploadedAt: string;
}

// ---------------------------------------------------------------------------
// Public API — REST endpoints
//   POST /files              → uploadFile
//   GET /files               → getFiles
//   GET /files/:id           → getFile (for download)
//   DELETE /files/:id        → deleteFile
// ---------------------------------------------------------------------------

/** GET /files - List all files */
export async function getFiles(): Promise<FileData[]> {
  try {
    const response = await api.get<BackendFile[]>('/files');
    return response.data.map(transformFile);
  } catch (error) {
    if (axios.isAxiosError(error) && !error.response) {
      throw new ApiError('network', 'Unable to connect to server. Please check your connection.');
    }
    throw new ApiError('server', 'Failed to load files');
  }
}

/** GET /files/:id - Get single file metadata */
export async function getFile(id: string): Promise<FileData> {
  try {
    // The backend doesn't have a dedicated GET /files/:id endpoint for metadata
    // So we fetch all files and find the one we need
    const files = await getFiles();
    const file = files.find((f) => f.id === id);
    if (!file) {
      throw new ApiError('not-found', `File "${id}" could not be found.`);
    }
    return file;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError('server', 'Failed to load file');
  }
}

/**
 * POST /files — uploads a file.
 * onProgress reports 0–100 so the UI can render a progress bar.
 */
export async function uploadFile(
  file: File,
  onProgress?: (percent: number) => void,
): Promise<FileData> {
  if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
    throw new ApiError('too-large', `File is larger than the allowed ${MAX_FILE_SIZE_MB} MB limit.`);
  }

  const formData = new FormData();
  formData.append('file', file);

  try {
    await api.post('/files', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total && onProgress) {
          const percent = Math.round((progressEvent.loaded / progressEvent.total) * 100);
          onProgress(percent);
        }
      },
    });

    // Backend returns { message: "file uploaded successfully" } not the file object
    // So we return a constructed FileData object
    // The file list will be refreshed to show the actual uploaded file
    return {
      id: generateId(), // Temporary ID until list is refreshed
      name: file.name,
      type: file.type || 'application/octet-stream',
      size: file.size,
      status: 'uploaded',
      uploadDate: new Date(),
      progress: 100,
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (!error.response) {
        throw new ApiError('network', 'Upload interrupted. Check your connection and try again.');
      }
      if (error.response.status === 413) {
        throw new ApiError('too-large', `File is larger than the allowed ${MAX_FILE_SIZE_MB} MB limit.`);
      }
      throw new ApiError('server', error.response?.data?.error || 'Upload failed');
    }
    throw new ApiError('server', 'Upload failed');
  }
}

/** GET /files/:id/download - Download file */
export async function downloadFile(file: FileData): Promise<void> {
  try {
    const response = await api.get(`/files/${file.id}`, {
      responseType: 'blob',
    });

    const url = window.URL.createObjectURL(response.data);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = file.name;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 404) {
        throw new ApiError('not-found', 'File not found');
      }
      if (!error.response) {
        throw new ApiError('network', 'Download failed. Check your connection.');
      }
    }
    throw new ApiError('server', 'Download failed');
  }
}

/** DELETE /files/:id */
export async function deleteFile(id: string): Promise<void> {
  try {
    await api.delete(`/files/${id}`);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 404) {
        throw new ApiError('not-found', 'File not found');
      }
      if (!error.response) {
        throw new ApiError('network', 'Delete failed. Check your connection.');
      }
    }
    throw new ApiError('server', 'Delete failed');
  }
}

/** GET /stats - Calculate stats from files */
export async function getStats(): Promise<FileStats> {
  const files = await getFiles();
  const GB = 1024 ** 3;

  return {
    totalFiles: files.length,
    uploadedFiles: files.filter((f) => f.status === 'uploaded').length,
    downloadedFiles: 0, // Backend doesn't track this yet
    storageUsed: files.reduce((sum, f) => sum + f.size, 0),
    storageLimit: 10 * GB,
  };
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

export { MAX_FILE_SIZE_MB };
