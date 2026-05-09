import { Link, useLocation } from "react-router-dom";
import { Plus, Library, LogIn, LogOut, User } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { signOut } from "@/lib/authService";
import { toast } from "sonner";

export default function Header() {
  const location = useLocation();
  const isStudio = location.pathname.startsWith("/studio");
  const isGenerate = location.pathname === "/generate";
  const { user, logout } = useAuth();

  async function handleSignOut() {
    await signOut();
    logout();
    toast.success("Signed out");
  }

  return (
    <header
      className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-6 h-[60px]"
      style={{ background: "rgba(10,10,15,0.85)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}
    >
      {/* Logo */}
      <Link to="/" className="flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center text-base" style={{ background: "linear-gradient(135deg, #F5C518, #F0B429)" }}>
          🍌
        </div>
        <span className="text-sm font-black text-white">Nano Banana</span>
        <span className="text-[10px] text-white/30 hidden sm:block">AI Presentation Studio</span>
      </Link>

      {/* Nav */}
      <nav className="flex items-center gap-2">
        {isStudio && (
          <span className="text-xs text-white/40 px-3 py-1.5 rounded-lg" style={{ background: "rgba(245,197,24,0.08)", border: "1px solid rgba(245,197,24,0.2)", color: "#F5C518" }}>
            Studio
          </span>
        )}

        <Link
          to="/library"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
          style={{ color: "rgba(255,255,255,0.5)" }}
          onMouseEnter={(e) => { e.currentTarget.style.color = "white"; e.currentTarget.style.background = "rgba(255,255,255,0.06)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.5)"; e.currentTarget.style.background = "transparent"; }}
        >
          <Library className="w-3.5 h-3.5" />
          Library
        </Link>

        {!isGenerate && (
          <Link to="/generate" className="btn-banana flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold">
            <Plus className="w-3.5 h-3.5" />
            New Presentation
          </Link>
        )}

        {/* Auth */}
        {user ? (
          <div className="flex items-center gap-2 ml-1">
            <div
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
            >
              <User className="w-3 h-3 text-white/40" />
              <span className="text-xs text-white/60 max-w-[80px] truncate">{user.username}</span>
            </div>
            <button
              onClick={handleSignOut}
              className="p-1.5 rounded-lg transition-all"
              style={{ color: "rgba(255,255,255,0.3)" }}
              onMouseEnter={(e) => { e.currentTarget.style.color = "white"; e.currentTarget.style.background = "rgba(255,255,255,0.06)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.3)"; e.currentTarget.style.background = "transparent"; }}
              title="Sign out"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <Link
            to="/auth"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium ml-1 transition-all"
            style={{ color: "rgba(255,255,255,0.5)", border: "1px solid rgba(255,255,255,0.08)" }}
            onMouseEnter={(e) => { e.currentTarget.style.color = "white"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.5)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; }}
          >
            <LogIn className="w-3.5 h-3.5" />
            Sign In
          </Link>
        )}
      </nav>
    </header>
  );
}
