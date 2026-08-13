import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-12">
      <div className="space-y-6">

        <h2 className="text-4xl font-bold tracking-tight">
          Distributed File Transfer Service
        </h2>

        <p className="max-w-2xl text-slate-600 text-lg">
          A backend application built using Go, Gin, PostgreSQL,
          MinIO and Docker for uploading, downloading,
          listing and deleting files.
        </p>

        <div className="flex gap-4">

          <Button>
            Upload File
          </Button>

          <Button variant="outline">
            View Swagger
          </Button>

        </div>

      </div>
    </section>
  );
}