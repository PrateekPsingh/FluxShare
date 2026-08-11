import { deleteFile, downloadFile } from "@/api/files";
import type { FileMetadata } from "@/types/file";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface FilesTableProps {
  files: FileMetadata[];
  loading: boolean;
  onRefresh: () => Promise<void>;
}

export function FilesTable(props: FilesTableProps) {
  const files = props.files;
  const loading = props.loading;
  const onRefresh = props.onRefresh;

  const [selectedFileId, setSelectedFileId] =
    useState<string | null>(null);

  async function handleDelete() {

    if (!selectedFileId) return;

    try {

        await deleteFile(selectedFileId);

        await onRefresh();

        toast.success("File deleted successfully.");

    } catch (error) {

        console.error(error);

        toast.error("Failed to delete file.");

    } finally {

        setSelectedFileId(null);

    }

}

  async function handleDownload(
    id: string,
    fileName: string
) {
    try {

        const blob = await downloadFile(id);

        const url =
            window.URL.createObjectURL(blob);

        const link =
            document.createElement("a");

        link.href = url;

        link.download = fileName;

        document.body.appendChild(link);

        link.click();

        document.body.removeChild(link);

        window.URL.revokeObjectURL(url);

    } catch (error) {

        console.error(error);

        toast.error("Download failed.");

    }
}

  if (loading) {
    return (
      <section className="mx-auto mt-10 max-w-6xl">
        <Card>
          <CardContent className="py-10 text-center text-slate-500">
            Loading files...
          </CardContent>
        </Card>
      </section>
    );
  }

  return (
    <section className="mx-auto mt-10 max-w-6xl">
      <Card>

        <CardHeader>
          <CardTitle className="text-2xl">
            Uploaded Files
          </CardTitle>
        </CardHeader>

        <CardContent>

          {files.length === 0 ? (
            <div className="py-12 text-center text-slate-500">
              No files uploaded yet.
            </div>
          ) : (
            <div className="overflow-x-auto">

              <table className="w-full border-collapse">

                <thead>

                  <tr className="border-b">

                    <th className="py-4 text-left">
                      File Name
                    </th>

                    <th className="text-left">
                      Size
                    </th>

                    <th className="text-left">
                      Content Type
                    </th>

                    <th className="text-left">
                      Status
                    </th>

                    <th className="text-left">
                      Uploaded At
                    </th>

                    <th className="text-center">
                      Actions
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {files.map((file) => (

                    <tr
                      key={file.ID}
                      className="border-b hover:bg-slate-50 transition-colors"
                    >

                      <td className="py-4 font-medium">
                        {file.FileName}
                      </td>

                      <td>
                        {(file.Size / 1024).toFixed(2)} KB
                      </td>

                      <td>
                        {file.ContentType}
                      </td>

                      <td>

                        <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-700">
                          {file.Status}
                        </span>

                      </td>

                      <td>
                        {new Date(
                          file.UploadedAt
                        ).toLocaleString()}
                      </td>

                      <td>

                        <div className="flex justify-center gap-2">

                          <Button
                            variant="secondary"
                            onClick={() =>
                              handleDownload(file.ID,file.FileName)
                            }
                          >
                            Download
                          </Button>

                          <AlertDialog>

    <AlertDialogTrigger>

        <Button
            variant="destructive"
            onClick={() =>
                setSelectedFileId(file.ID)
            }
        >
            Delete
        </Button>

    </AlertDialogTrigger>

    <AlertDialogContent>

        <AlertDialogHeader>

            <AlertDialogTitle>

                Delete File?

            </AlertDialogTitle>

            <AlertDialogDescription>

                This action cannot be undone.
                The selected file will be permanently deleted.

            </AlertDialogDescription>

        </AlertDialogHeader>

        <AlertDialogFooter>

            <AlertDialogCancel>

                Cancel

            </AlertDialogCancel>

            <AlertDialogAction
                onClick={handleDelete}
            >
                Delete
            </AlertDialogAction>

        </AlertDialogFooter>

    </AlertDialogContent>

</AlertDialog>

                        </div>

                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>
          )}

        </CardContent>

      </Card>
    </section>
  );
}