import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { BrowserRouter } from "react-router"

import "./index.css"
import App from "./App.tsx"
import { ThemeProvider } from "@/components/theme-provider.tsx"
import { Toaster } from "@/components/ui/sonner"
import { AppProviders } from "@/providers"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AppProviders>
      <ThemeProvider>
        <BrowserRouter>
          <App />
          <Toaster />
        </BrowserRouter>
      </ThemeProvider>
    </AppProviders>
  </StrictMode>
)
