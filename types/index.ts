// GIF生成関連の型定義
export interface GifConfig {
  text: string;
  mini?: boolean;
}

export interface MojiConfig {
  size: number[];
  rotate: number[];
  fill: string[];
}

export interface TextConfig {
  text: string;
  size: number;
  rotate: number;
  fill: string;
  x: number;
  y: number;
}

export interface CanvasConfig {
  width: number;
  height: number;
  backgroundColor?: string;
}

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export interface FontConfig {
  family: string;
  url: string;
  weight?: string;
  style?: string;
}

export interface ImageProcessorConfig {
  width: number;
  height: number;
  quality?: number;
}

// コンポーネントのProps型定義
export interface TextInputProps {
  modelValue: string;
  placeholder?: string;
  maxLength?: number;
}

export interface LoadingSpinnerProps {
  progress?: number;
  message?: string;
}

export interface GifGeneratorProps {
  initialText?: string;
}

// イベント型定義
export interface GifGeneratorEmits {
  (e: "generated", gifUrl: string): void;
  (e: "error", error: string): void;
}

export interface TextInputEmits {
  (e: "update:modelValue", value: string): void;
}
