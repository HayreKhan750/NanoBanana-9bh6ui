import { useState } from "react";
import type { StylePreset } from "@/types/presentation";
import { STYLE_PRESETS } from "@/constants/presets";
import { Check } from "lucide-react";

interface ThemeSelectorProps {
  selected: StylePreset;
  onChange: (preset: StylePreset) => void;
  compact?: boolean;
}

export default function ThemeSelector({ selected, onChange, compact = false }: ThemeSelectorProps) {
  const [search, setSearch] = useState("");

  const filtered = STYLE_PRESETS.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.tags.some((t) => t.includes(search.toLowerCase()))
  );

  if (compact) {
    return (
      <div className="grid grid-cols-3 gap-2">
        {STYLE_PRESETS.slice(0, 9).map((preset) => (
          <button
            key={preset.id}
            onClick={() => onChange(preset.id)}
            className={`preset-card text-center ${selected === preset.id ? "selected" : ""}`}
          >
            <div className="text-xl mb-1">{preset.emoji}</div>
            <div className="text-[10px] font-medium text-white/70">{preset.name}</div>
          </button>
        ))}
      </div>
    );
  }

  return (
    <div>
      <input
        type="text"
        placeholder="Search themes..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="studio-input w-full px-4 py-2.5 text-sm mb-4"
      />

      <div className="grid grid-cols-2 gap-2">
        {filtered.map((preset) => {
          const isSelected = selected === preset.id;
          return (
            <button
              key={preset.id}
              onClick={() => onChange(preset.id)}
              className={`preset-card text-left group relative ${isSelected ? "selected" : ""}`}
            >
              {/* Color preview */}
              <div className="flex gap-1 mb-2">
                <div className="w-3 h-3 rounded-full" style={{ background: preset.primaryColor }} />
                <div className="w-3 h-3 rounded-full" style={{ background: preset.accentColor }} />
                <div className="w-3 h-3 rounded-full" style={{ background: preset.backgroundColor, border: "1px solid rgba(255,255,255,0.15)" }} />
              </div>

              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-white">{preset.emoji} {preset.name}</span>
                {isSelected && <Check className="w-3 h-3" style={{ color: "#F5C518" }} />}
              </div>
              <p className="text-[10px] text-white/40">{preset.description}</p>

              {/* Tags */}
              <div className="flex gap-1 mt-2 flex-wrap">
                {preset.tags.slice(0, 2).map((tag) => (
                  <span
                    key={tag}
                    className="tag-badge"
                    style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.4)" }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
