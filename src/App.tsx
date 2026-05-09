import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import Header from "@/components/layout/Header";
import LandingPage from "@/pages/LandingPage";
import GeneratePage from "@/pages/GeneratePage";
import PresentationStudio from "@/pages/PresentationStudio";
import LibraryPage from "@/pages/LibraryPage";
import AuthPage from "@/pages/AuthPage";
import NotFound from "@/pages/NotFound";
import { AuthContext, useAuthState } from "@/hooks/useAuth";

function AppContent() {
  const authState = useAuthState();
  return (
    <AuthContext.Provider value={authState}>
      <BrowserRouter>
        <Header />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/generate" element={<GeneratePage />} />
          <Route path="/studio/:id" element={<PresentationStudio />} />
          <Route path="/library" element={<LibraryPage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Toaster richColors position="bottom-right" />
      </BrowserRouter>
    </AuthContext.Provider>
  );
}

export default function App() {
  return <AppContent />;
}
