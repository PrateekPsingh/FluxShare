
import { Header } from "./components/header"
import { Hero } from "./components/hero"
import { UploadSection } from "./components/UploadSection"
import { FilesTable } from "./components/FilesTable"

function App() {
  return (
   <main className="min-h-screen bg-slate-100 pb-10">
      <Header />
      <Hero />
      <UploadSection />
      <FilesTable />
    </main>
  )
}

export default App