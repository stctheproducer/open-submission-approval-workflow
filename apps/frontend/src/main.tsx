import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { BrowserRouter } from "react-router"

import "./index.css"
import App from "./App.tsx"
import { ThemeProvider } from "@/components/theme-provider.tsx"
import { Toaster } from "@/components/ui/sonner"
import { AppProviders } from "@/providers"
import { DocumentMeta, PageMetaProvider } from "@/routing/page-meta"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AppProviders>
      <ThemeProvider>
        <BrowserRouter>
          <PageMetaProvider>
            <DocumentMeta />
            <App />
            <Toaster />
          </PageMetaProvider>
        </BrowserRouter>
      </ThemeProvider>
    </AppProviders>
  </StrictMode>,
)
