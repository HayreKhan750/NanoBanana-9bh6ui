import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { loadFromCloud, loadLocal, deleteFromCloud, deleteLocal } from "@/lib/presentationApi";
import type { Presentation } from "@/types/presentation";
import { STYLE_PRESETS } from "@/constants/presets";
import { Plus, Trash2, ExternalLink, Clock, Layers, Zap, Cloud, HardDrive } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

function PresentationCard({ pres, onDelete }: { pres: Presentation; onDelete: (id: string) => void }) {
  const preset = STYLE_PRESETS.find((p) => p.id === pres.theme);
  const score = pres.coachScore?.overall;

  return (
    <div className="glass-panel overflow-hidden group transition-all hover:border-white/15">
      <div
        className="h-32 relative overflow-hidden flex items-center justify-center"
        style={{ background: `linear-gradient(135deg, ${preset?.backgroundColor || "#0A0A0F"}, ${preset?.primaryColor}20)` }}
      >
        <div className="text-center z-10">
          <div className="text-4xl mb-2">{preset?.emoji || "📊"}</div>
          <div className="text-xs font-bold text-white/70 px-2 text-center line-clamp-1">{pres.title}</div>
        </div>
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center" style={{ background: "rgba(0,0,0,0.3)" }}>
          <Link to={`/studio/${pres.id}`} className="px-4 py-2 rounded-lg text-xs font-bold text-white" style={{ background: "rgba(245,197,24,0.2)", border: "1px solid rgba(245,197,24,0.4)" }}>
            Open Studio
          </Link>
        </div>
        {score !== undefined && (
          <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-bold"
            style={{ background: score >= 85 ? "rgba(16,185,129,0.2)" : "rgba(245,197,24,0.2)", color: score >= 85 ? "#10B981" : "#F5C518", border: `1px solid ${score >= 85 ? "rgba(16,185,129,0.4)" : "rgba(245,197,24,0.4)"}` }}>
            Score: {score}
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="text-sm font-bold text-white mb-1 truncate">{pres.title}</h3>
        {pres.subtitle && <p className="text-xs text-white/40 truncate mb-3">{pres.subtitle}</p>}

        <div className="flex items-center gap-3 mb-4">
          <div className="flex items-center gap-1 text-[10px] text-white/40"><Layers className="w-3 h-3" />{pres.totalSlides} slides</div>
          <div className="flex items-center gap-1 text-[10px] text-white/40"><Clock className="w-3 h-3" />{pres.estimatedDuration} min</div>
          <div className="text-[10px] text-white/40">{preset?.emoji} {preset?.name}</div>
        </div>

        <div className="flex items-center gap-2">
          <Link to={`/studio/${pres.id}`}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all"
            style={{ background: "rgba(245,197,24,0.1)", color: "#F5C518", border: "1px solid rgba(245,197,24,0.2)" }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(245,197,24,0.18)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(245,197,24,0.1)"; }}
          >
            <ExternalLink className="w-3 h-3" />Open Studio
          </Link>
          <button
            onClick={() => onDelete(pres.id)}
            className="px-3 py-2 rounded-lg transition-all"
            style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.15)" }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(239,68,68,0.18)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(239,68,68,0.08)"; }}
          >
            <Trash2 className="w-3.5 h-3.5 text-red-400" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function LibraryPage() {
  const { user } = useAuth();
  const [presentations, setPresentations] = useState<Presentation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        if (user) {
          const cloud = await loadFromCloud(user.id);
          setPresentations(cloud);
        } else {
          setPresentations(loadLocal());
        }
      } catch (err) {
        console.error(err);
        setPresentations(loadLocal());
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user]);

  async function handleDelete(id: string) {
    try {
      if (user) await deleteFromCloud(id);
      else deleteLocal(id);
      setPresentations((prev) => prev.filter((p) => p.id !== id));
      toast.success("Presentation deleted");
    } catch (err) {
      toast.error("Failed to delete");
    }
  }

  return (
    <div className="min-h-screen" style={{ background: "#0A0A0F", paddingTop: "60px" }}>
      <div className="max-w-6xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-3xl font-black text-white mb-1">My Presentations</h1>
            <p className="text-white/40 text-sm flex items-center gap-2">
              {user ? (
                <><Cloud className="w-3.5 h-3.5" /> {presentations.length} presentations · Synced to cloud</>
              ) : (
                <><HardDrive className="w-3.5 h-3.5" /> {presentations.length} presentations · Saved locally · <Link to="/auth" style={{ color: "#F5C518" }}>Sign in to sync</Link></>
              )}
            </p>
          </div>
          <Link to="/generate" className="btn-banana flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm">
            <Plus className="w-4 h-4" />New Presentation
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[1,2,3,4].map((i) => (
              <div key={i} className="glass-panel h-64 shimmer rounded-2xl" />
            ))}
          </div>
        ) : presentations.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🍌</div>
            <h3 className="text-xl font-bold text-white mb-2">No presentations yet</h3>
            <p className="text-white/40 mb-8">Generate your first AI-powered presentation to get started.</p>
            <div className="flex items-center justify-center gap-4">
              <Link to="/generate" className="btn-banana flex items-center gap-2 px-8 py-3 rounded-xl font-bold">
                <Zap className="w-4 h-4" />Create First Presentation
              </Link>
              <Link to="/studio/demo"
                className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-medium transition-all"
                style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.6)", border: "1px solid rgba(255,255,255,0.1)" }}
              >
                View Demo →
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {/* Demo card */}
            <div className="glass-panel overflow-hidden group transition-all hover:border-white/15">
              <div className="h-32 relative overflow-hidden flex items-center justify-center" style={{ background: "linear-gradient(135deg, #050510, rgba(245,197,24,0.15))" }}>
                <div className="text-center z-10">
                  <div className="text-4xl mb-2">🤖</div>
                  <div className="text-xs font-bold text-white/70">Demo Presentation</div>
                </div>
                <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-bold" style={{ background: "rgba(6,182,212,0.2)", color: "#06B6D4", border: "1px solid rgba(6,182,212,0.4)" }}>DEMO</div>
              </div>
              <div className="p-4">
                <h3 className="text-sm font-bold text-white mb-1">The Future of AI-Powered Work</h3>
                <p className="text-xs text-white/40 mb-3">Nano Banana AI Demo · TED Talk Style</p>
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex items-center gap-1 text-[10px] text-white/40"><Layers className="w-3 h-3" />8 slides</div>
                  <div className="flex items-center gap-1 text-[10px] text-white/40"><Clock className="w-3 h-3" />12 min</div>
                </div>
                <Link to="/studio/demo" className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all"
                  style={{ background: "rgba(245,197,24,0.1)", color: "#F5C518", border: "1px solid rgba(245,197,24,0.2)" }}>
                  Open Demo
                </Link>
              </div>
            </div>

            {presentations.map((pres) => (
              <PresentationCard key={pres.id} pres={pres} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
