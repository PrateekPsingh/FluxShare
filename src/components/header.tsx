import { Button } from "@/components/ui/button";

export function Header() {
  return (
    <header className="border-b bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">

        <div>
          <h1 className="text-2xl font-bold">
            📁 File Transfer Service
          </h1>

          <p className="text-sm text-slate-500">
            Backend Demo
          </p>
        </div>

        <div className="flex gap-3">

          <Button variant="outline">
            Swagger Docs
          </Button>

          <Button>
            GitHub
          </Button>

        </div>

      </div>
    </header>
  );
}