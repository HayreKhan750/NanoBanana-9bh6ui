import { useState } from "react";
import type { Slide, Presentation } from "@/types/presentation";
import { Sparkles, Loader2, BookOpen, Minimize2, Eye, Palette, MessageSquare, AlignLeft, TrendingUp } from "lucide-react";

interface CoachPanelProps {
  presentation: Presentation;
}

interface RefinementPanelProps {
  slide: Slide | null;
  isRefining: boolean;
  onRefine: (action: string) => void;
  presentation?: Presentation;
  showCoach?: boolean;
}

const REFINEMENT_ACTIONS = [
  { id: "simplify", label: "Simplify Slide", icon: Minimize2, color: "#06B6D4", description: "Reduce complexity" },
  { id: "add_visuals", label: "Add More Visuals", icon: Eye, color: "#8B5CF6", description: "Enhance imagery" },
  { id: "improve_story", label: "Improve Storytelling", icon: BookOpen, color: "#F5C518", description: "Better narrative flow" },
  { id: "more_professional", label: "Make Professional", icon: Palette, color: "#10B981", description: "Polish language" },
  { id: "reduce_text", label: "Reduce Text", icon: AlignLeft, color: "#F97316", description: "Less is more" },
];

const SCORE_COLOR = (score: number) => {
  if (score >= 85) return "#10B981";
  if (score >= 70) return "#F5C518";
  return "#EF4444";
};

function ScoreBar({ label, value }: { label: string; value: number }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-xs text-white/50">{label}</span>
        <span className="text-xs font-bold" style={{ color: SCORE_COLOR(value) }}>{value}</span>
      </div>
      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${value}%`, background: SCORE_COLOR(value) }} />
      </div>
    </div>
  );
}

function CoachPanel({ presentation }: CoachPanelProps) {
  const score = presentation.coachScore;
  if (!score) return null;

  return (
    <div className="space-y-4">
      {/* Overall Score */}
      <div
        className="p-4 rounded-xl text-center"
        style={{
          background: `rgba(${score.overall >= 85 ? "16,185,129" : "245,197,24"},0.08)`,
          border: `1px solid rgba(${score.overall >= 85 ? "16,185,129" : "245,197,24"},0.2)`,
        }}
      >
        <div className="text-4xl font-black" style={{ color: SCORE_COLOR(score.overall) }}>{score.overall}</div>
        <div className="text-xs text-white/50 mt-1">Presentation Score</div>
      </div>

      {/* Individual Scores */}
      <div className="space-y-2">
        <ScoreBar label="Readability" value={score.readability} />
        <ScoreBar label="Visual Balance" value={score.visualBalance} />
        <ScoreBar label="Storytelling" value={score.storytelling} />
        <ScoreBar label="Engagement" value={score.engagement} />
        <ScoreBar label="Pacing" value={score.pacing} />
      </div>

      {/* Suggestions */}
      <div>
        <div className="text-xs font-semibold text-white/60 mb-2 uppercase tracking-wider">AI Suggestions</div>
        <div className="space-y-2">
          {score.suggestions.slice(0, 4).map((s, i) => (
            <div key={i} className="flex items-start gap-2 p-2 rounded-lg" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <span className="text-sm flex-shrink-0">💡</span>
              <span className="text-xs text-white/60 leading-relaxed">{s}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function AIRefinementPanel({
  slide,
  isRefining,
  onRefine,
  presentation,
  showCoach = false,
}: RefinementPanelProps) {
  const [activeTab, setActiveTab] = useState<"refine" | "coach">(showCoach ? "coach" : "refine");

  return (
    <div
      className="flex flex-col h-full"
      style={{
        width: "220px",
        borderLeft: "1px solid rgba(255,255,255,0.07)",
        background: "rgba(10,10,15,0.6)",
      }}
    >
      {/* Header */}
      <div className="px-4 py-3 border-b" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-3.5 h-3.5" style={{ color: "#F5C518" }} />
          <span className="text-xs font-semibold text-white/70">AI Assistant</span>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 rounded-lg" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
          {[
            { id: "refine", label: "Refine", icon: Sparkles },
            { id: "coach", label: "Coach", icon: TrendingUp },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as "refine" | "coach")}
              className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded-md text-xs font-medium transition-all"
              style={{
                background: activeTab === tab.id ? "rgba(245,197,24,0.15)" : "transparent",
                color: activeTab === tab.id ? "#F5C518" : "rgba(255,255,255,0.4)",
                border: activeTab === tab.id ? "1px solid rgba(245,197,24,0.3)" : "1px solid transparent",
              }}
            >
              <tab.icon className="w-3 h-3" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-3">
        {activeTab === "refine" && (
          <div className="space-y-2">
            <p className="text-[10px] text-white/40 mb-3">Refine active slide:</p>
            {REFINEMENT_ACTIONS.map((action) => (
              <button
                key={action.id}
                onClick={() => onRefine(action.id)}
                disabled={isRefining || !slide}
                className="w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all text-left disabled:opacity-40"
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.07)",
                }}
                onMouseEnter={(e) => {
                  if (!isRefining) {
                    e.currentTarget.style.background = `${action.color}10`;
                    e.currentTarget.style.borderColor = `${action.color}40`;
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.03)";
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)";
                }}
              >
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: `${action.color}15` }}
                >
                  {isRefining ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" style={{ color: action.color }} />
                  ) : (
                    <action.icon className="w-3.5 h-3.5" style={{ color: action.color }} />
                  )}
                </div>
                <div>
                  <div className="text-xs font-medium text-white/80">{action.label}</div>
                  <div className="text-[10px] text-white/40">{action.description}</div>
                </div>
              </button>
            ))}

            {/* Quick notes */}
            {slide?.speakerNotes && (
              <div className="mt-4 p-3 rounded-lg" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
                <div className="flex items-center gap-1.5 mb-2">
                  <MessageSquare className="w-3 h-3" style={{ color: "#06B6D4" }} />
                  <span className="text-[10px] font-semibold text-white/50 uppercase tracking-wider">Speaker Notes</span>
                </div>
                <p className="text-[10px] text-white/40 leading-relaxed">
                  {slide.speakerNotes.length > 120 ? slide.speakerNotes.substring(0, 120) + "..." : slide.speakerNotes}
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === "coach" && presentation && (
          <CoachPanel presentation={presentation} />
        )}
      </div>
    </div>
  );
}
