
import { useEffect, useState } from "react";
import { listFiles } from "@/api/files";
import type { FileMetadata } from "@/types/file";
import { Header } from "./components/header"
import { Hero } from "./components/hero"
import { UploadSection } from "./components/UploadSection"
import { FilesTable } from "./components/FilesTable"

function App() {

   const [files, setFiles] = useState<FileMetadata[]>([]);
    const [loading, setLoading] = useState(true);

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
  
    useEffect(() => {
      
  
      fetchFiles();
    }, []);

  return (
   <main className="min-h-screen bg-slate-100 pb-10">
      <Header />
      <Hero />
      <UploadSection onUploadSuccess={fetchFiles} />
      <FilesTable files={files} loading={loading} onRefresh={fetchFiles} />
    </main>
  )
}

export default App