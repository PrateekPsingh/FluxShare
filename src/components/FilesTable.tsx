import { useEffect, useState } from "react";

import { listFiles } from "@/api/files";
import type { FileMetadata } from "@/types/file";

export function FilesTable() {
  const [files, setFiles] = useState<FileMetadata[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFiles() {
      try {
        const data = await listFiles();
        setFiles(data || []);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    fetchFiles();
  }, []);

  if (loading) {
    return (
      <section className="mx-auto mt-8 max-w-6xl rounded-xl border bg-white p-6 shadow-sm">
        <p>Loading files...</p>
      </section>
    );
  }

  return (
    <section className="mx-auto mt-8 mb-8 max-w-6xl rounded-xl border bg-white p-6 shadow-sm">
      <h2 className="mb-6 text-xl font-semibold">
        Uploaded Files
      </h2>

      {files.length === 0 ? (
        <p className="text-slate-500">
          No files uploaded yet.
        </p>
      ) : (
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b">
              <th className="py-3 text-left">File Name</th>
              <th className="py-3 text-left">Size</th>
              <th className="py-3 text-left">Content Type</th>
              <th className="py-3 text-left">Status</th>
              <th className="py-3 text-left">Uploaded At</th>
            </tr>
          </thead>

          <tbody>
            {files.map((file) => (
              <tr key={file.ID} className="border-b">
                <td className="py-3">
                  {file.FileName}
                </td>

                <td>
                  {(file.Size / 1024).toFixed(2)} KB
                </td>

                <td>
                  {file.ContentType}
                </td>

                <td>
                  {file.Status}
                </td>

                <td>
                  {new Date(file.UploadedAt).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}