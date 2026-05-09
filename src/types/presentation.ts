export type InputType =
  | "prompt"
  | "pdf"
  | "docx"
  | "youtube"
  | "website"
  | "voice"
  | "transcript"
  | "markdown"
  | "topic"
  | "research";

export type SlideType =
  | "title"
  | "agenda"
  | "section"
  | "concept"
  | "data"
  | "infographic"
  | "quote"
  | "comparison"
  | "timeline"
  | "summary"
  | "cta";

export type PresentationMode =
  | "standard"
  | "investor"
  | "ted"
  | "education"
  | "research"
  | "startup"
  | "product";

export type StylePreset =
  | "apple"
  | "startup"
  | "ted"
  | "minimal"
  | "glass"
  | "cyberpunk"
  | "academic"
  | "corporate"
  | "futuristic"
  | "dark_neon"
  | "brutalist"
  | "ethiopian"
  | "investor"
  | "agency"
  | "education";

export type AnimationType = "fade" | "slide" | "zoom" | "cinematic" | "stagger";

export interface SlideElement {
  id: string;
  type: "text" | "image" | "chart" | "icon" | "shape";
  content: string;
  x: number;
  y: number;
  width: number;
  height: number;
  style?: Record<string, string>;
}

export interface Slide {
  id: string;
  order: number;
  type: SlideType;
  title: string;
  subtitle?: string;
  content: string[];
  visualUrl?: string;
  imagePrompt?: string;
  speakerNotes: string;
  animationType: AnimationType;
  layoutVariant: number;
  accentColor: string;
  backgroundColor: string;
  chartData?: ChartData;
  elements?: SlideElement[];
}

export interface ChartData {
  type: "bar" | "pie" | "line" | "donut";
  labels: string[];
  datasets: { label: string; data: number[]; color?: string }[];
}

export interface CoachScore {
  overall: number;
  readability: number;
  visualBalance: number;
  storytelling: number;
  engagement: number;
  pacing: number;
  suggestions: string[];
}

export interface Presentation {
  id: string;
  title: string;
  subtitle?: string;
  theme: StylePreset;
  mode: PresentationMode;
  slides: Slide[];
  createdAt: string;
  updatedAt: string;
  inputType: InputType;
  coachScore?: CoachScore;
  totalSlides: number;
  estimatedDuration: number;
}

export interface GenerationConfig {
  inputType: InputType;
  prompt?: string;
  fileContent?: string;
  youtubeUrl?: string;
  websiteUrl?: string;
  stylePreset: StylePreset;
  presentationMode: PresentationMode;
  slideCount: number;
  includeCharts: boolean;
  includeSpeakerNotes: boolean;
  includeAnimations: boolean;
  tone: "professional" | "casual" | "academic" | "creative";
  language: string;
}

export interface PresetDefinition {
  id: StylePreset;
  name: string;
  description: string;
  primaryColor: string;
  accentColor: string;
  backgroundColor: string;
  fontFamily: string;
  emoji: string;
  tags: string[];
}
