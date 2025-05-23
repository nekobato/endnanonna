export interface FontConfig {
  family: string;
  url: string;
  weight?: string;
  style?: string;
}

export class FontLoader {
  private loadedFonts: Set<string> = new Set();

  async loadFont(config: FontConfig): Promise<void> {
    const fontKey = `${config.family}-${config.weight || "normal"}-${
      config.style || "normal"
    }`;

    if (this.loadedFonts.has(fontKey)) {
      return; // 既に読み込み済み
    }

    try {
      const fontFace = new FontFace(config.family, `url(${config.url})`, {
        weight: config.weight || "normal",
        style: config.style || "normal"
      });

      await fontFace.load();
      document.fonts.add(fontFace);
      this.loadedFonts.add(fontKey);

      console.log(`Font loaded: ${config.family}`);
    } catch (error) {
      console.warn(
        `Failed to load font: ${config.family}, using fallback fonts`,
        error
      );
      // フォントの読み込みに失敗した場合、フォールバックフォントを使用
      this.loadedFonts.add(fontKey + "-fallback");
    }
  }

  async loadMultipleFonts(configs: FontConfig[]): Promise<void> {
    const promises = configs.map((config) => this.loadFont(config));
    await Promise.all(promises);
  }

  isFontLoaded(family: string, weight?: string, style?: string): boolean {
    const fontKey = `${family}-${weight || "normal"}-${style || "normal"}`;
    return this.loadedFonts.has(fontKey);
  }

  async waitForFontsReady(): Promise<void> {
    await document.fonts.ready;
  }

  getLoadedFonts(): string[] {
    return Array.from(this.loadedFonts);
  }
}

// デフォルトのフォント設定（Rounded M+）
export const DEFAULT_FONTS: FontConfig[] = [
  {
    family: "Rounded-X M+ 1m bold",
    url: "/fonts/rounded-x-mplus-1m-bold.ttf",
    weight: "bold"
  }
];

// フォールバックフォント設定
export const FALLBACK_FONTS = [
  "system-ui",
  "-apple-system",
  "BlinkMacSystemFont",
  '"Segoe UI"',
  "Roboto",
  '"Helvetica Neue"',
  "Arial",
  '"Noto Sans"',
  '"Liberation Sans"',
  "sans-serif"
];

// シングルトンインスタンス
let fontLoaderInstance: FontLoader | null = null;

export const useFontLoader = (): FontLoader => {
  if (!fontLoaderInstance) {
    fontLoaderInstance = new FontLoader();
  }
  return fontLoaderInstance;
};

// Nuxt用のcomposable
export const useFont = () => {
  const fontLoader = useFontLoader();
  const isLoading = ref(false);
  const loadedFonts = ref<string[]>([]);

  const loadDefaultFonts = async (): Promise<void> => {
    isLoading.value = true;
    try {
      await fontLoader.loadMultipleFonts(DEFAULT_FONTS);
      loadedFonts.value = fontLoader.getLoadedFonts();
    } catch (error) {
      console.warn("Failed to load default fonts, using system fonts:", error);
      // システムフォントを使用
      loadedFonts.value = ["system-fallback"];
    } finally {
      isLoading.value = false;
    }
  };

  const getFontFamily = (): string => {
    const hasRoundedMPlus = loadedFonts.value.some((font) =>
      font.includes("Rounded M+ 1c")
    );

    if (hasRoundedMPlus) {
      return '"Rounded M+ 1c", ' + FALLBACK_FONTS.join(", ");
    }

    return FALLBACK_FONTS.join(", ");
  };

  const loadCustomFont = async (config: FontConfig): Promise<void> => {
    isLoading.value = true;
    try {
      await fontLoader.loadFont(config);
      loadedFonts.value = fontLoader.getLoadedFonts();
    } catch (error) {
      console.error("Failed to load custom font:", error);
    } finally {
      isLoading.value = false;
    }
  };

  return {
    loadDefaultFonts,
    loadCustomFont,
    getFontFamily,
    isLoading: readonly(isLoading),
    loadedFonts: readonly(loadedFonts),
    fontLoader
  };
};
