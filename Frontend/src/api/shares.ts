// Share API service layer
// Connects to the backend share endpoints at http://localhost:8080

import axios from 'axios';
import type {
  Share,
  CreateShareRequest,
  CreateShareResponse,
  ListSharesResponse,
} from '../types';

const API_BASE_URL = 'http://localhost:8080';

const shareApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach auth token to every authenticated share request
shareApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('fluxshare-token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export class ShareApiError extends Error {
  code: 'network' | 'server' | 'not-found' | 'unauthorized';

  constructor(code: ShareApiError['code'], message: string) {
    super(message);
    this.code = code;
  }
}

// ---------------------------------------------------------------------------
// Authenticated share APIs
// ---------------------------------------------------------------------------

/**
 * POST /files/:id/share
 * Creates a share link for the given file.
 */
export async function createShare(
  fileId: string,
  expiresInHours: number,
): Promise<CreateShareResponse> {
  try {
    const body: CreateShareRequest = { expires_in_hours: expiresInHours };
    const response = await shareApi.post<CreateShareResponse>(
      `/files/${fileId}/share`,
      body,
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (!error.response) {
        throw new ShareApiError('network', 'Unable to connect to server. Please check your connection.');
      }
      if (error.response.status === 401) {
        throw new ShareApiError('unauthorized', 'Session expired. Please log in again.');
      }
      throw new ShareApiError('server', error.response?.data?.error || 'Failed to create share link');
    }
    throw new ShareApiError('server', 'Failed to create share link');
  }
}

/**
 * GET /shares
 * Lists all share links created by the authenticated user.
 */
export async function listShares(): Promise<Share[]> {
  try {
    const response = await shareApi.get<ListSharesResponse>('/shares');
    return response.data.shares.map(transformShare);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (!error.response) {
        throw new ShareApiError('network', 'Unable to connect to server. Please check your connection.');
      }
      if (error.response.status === 401) {
        throw new ShareApiError('unauthorized', 'Session expired. Please log in again.');
      }
      throw new ShareApiError('server', 'Failed to load share links');
    }
    throw new ShareApiError('server', 'Failed to load share links');
  }
}

/**
 * DELETE /shares/:id
 * Revokes (deletes) a share link.
 */
export async function revokeShare(shareId: string): Promise<void> {
  try {
    await shareApi.delete(`/shares/${shareId}`);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (!error.response) {
        throw new ShareApiError('network', 'Unable to connect to server. Please check your connection.');
      }
      if (error.response.status === 401) {
        throw new ShareApiError('unauthorized', 'Session expired. Please log in again.');
      }
      if (error.response.status === 404) {
        throw new ShareApiError('not-found', 'Share link not found');
      }
      throw new ShareApiError('server', error.response?.data?.error || 'Failed to revoke share link');
    }
    throw new ShareApiError('server', 'Failed to revoke share link');
  }
}

// ---------------------------------------------------------------------------
// Public share API (no auth token)
// ---------------------------------------------------------------------------

/**
 * GET /share/:token
 * Accesses a shared file. This is a PUBLIC endpoint — does NOT attach a JWT.
 * The token itself authorizes access.
 * Returns the file as a blob with Content-Disposition header.
 */
export async function getSharedFile(token: string): Promise<{
  blob: Blob;
  fileName: string;
  contentType: string;
  contentLength: number | undefined;
}> {
  const publicApi = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  try {
    const response = await publicApi.get<Blob>(`/share/${token}`, {
      responseType: 'blob',
    });

    const headers = response.headers as Record<string, unknown>;
    const contentDisposition = (headers['content-disposition'] as string) || '';
    let fileName = 'shared-file';
    if (contentDisposition) {
      const match = contentDisposition.match(/filename="?([^"]+)"?/);
      if (match && match[1]) {
        fileName = match[1];
      }
    }

    const contentType = (headers['content-type'] as string) || 'application/octet-stream';
    const contentLengthStr = headers['content-length'] ? String(headers['content-length']) : '';
    const contentLength = contentLengthStr ? parseInt(contentLengthStr, 10) : undefined;

    return {
      blob: response.data,
      fileName,
      contentType,
      contentLength,
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (!error.response) {
        throw new ShareApiError('network', 'Unable to connect to server. Please check your connection.');
      }
      if (error.response.status === 404) {
        throw new ShareApiError('not-found', 'Share link unavailable');
      }
      if (error.response.status === 410) {
        throw new ShareApiError('not-found', 'This share link has expired');
      }
      throw new ShareApiError('server', 'Failed to load shared file');
    }
    throw new ShareApiError('server', 'Failed to load shared file');
  }
}

/**
 * Downloads a shared file by token directly in the browser.
 * Uses the same pattern as downloadFile in files.ts but for public shares.
 */
export async function downloadSharedFile(token: string): Promise<void> {
  try {
    const result = await getSharedFile(token);
    const url = window.URL.createObjectURL(result.blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = result.fileName;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    if (error instanceof ShareApiError) {
      throw error;
    }
    throw new ShareApiError('server', 'Download failed');
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function transformShare(raw: Share): Share {
  return {
    id: raw.id,
    file_id: raw.file_id,
    file_name: raw.file_name,
    token: raw.token,
    share_url: raw.share_url,
    created_at: raw.created_at,
    expires_at: raw.expires_at,
    revoked_at: raw.revoked_at,
  };
}
