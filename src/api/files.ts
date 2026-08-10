import api from "./axios";
import type { FileMetadata } from "@/types/file";

export async function listFiles(): Promise<FileMetadata[]> {
  const response = await api.get("/files");

  return response.data;
}

export async function uploadFile(file: File) {
  const formData = new FormData();

  formData.append("file", file);

  const response = await api.post("/files", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
}