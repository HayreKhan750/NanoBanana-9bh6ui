import { Link } from "react-router-dom";
import { Home, Zap } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "#0A0A0F" }}>
      <div className="text-center">
        <div className="text-8xl font-black gradient-text-banana mb-4">404</div>
        <h2 className="text-2xl font-bold text-white mb-3">Slide Not Found</h2>
        <p className="text-white/50 mb-8 max-w-sm mx-auto">
          This page doesn't exist in our presentation. Let's get you back on stage.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link
            to="/"
            className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-medium transition-all"
            style={{ background: "rgba(255,255,255,0.06)", color: "white", border: "1px solid rgba(255,255,255,0.1)" }}
          >
            <Home className="w-4 h-4" />
            Go Home
          </Link>
          <Link
            to="/generate"
            className="btn-banana flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold"
          >
            <Zap className="w-4 h-4" />
            Create Presentation
          </Link>
        </div>
      </div>
    </div>
  );
}
