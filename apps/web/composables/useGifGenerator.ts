import {
  CanvasImageProcessor,
  type AnimationFrame
} from "~/utils/imageProcessor";
import { useFont } from "~/utils/fontLoader";

export interface GifConfig {
  text: string;
  mini?: boolean;
}

export interface MojiConfig {
  size: number[];
  rotate: number[];
  fill: string[];
}

export interface TextPosition {
  x: number;
  y: number;
}

export const useGifGenerator = () => {
  const isLoading = ref(false);
  const progress = ref(0);
  const currentGif = ref<string | null>(null);
  const error = ref<string | null>(null);

  // 文字ごとの設定（移行計画書から）
  const mojiConfig: MojiConfig = {
    size: [80, 64, 78, 54, 54, 64, 68],
    rotate: [-12, -2, -10, -10, -10, -10, 10],
    fill: [
      "#dd188b",
      "#dd188b",
      "#f57315",
      "#5ac02e",
      "#5ac02e",
      "#12a7c5",
      "#12a7c5"
    ]
  };

  // 文字の配置位置（のんのんびより風）
  const textPositions: TextPosition[] = [
    { x: 150, y: 120 }, // の
    { x: 220, y: 140 }, // ん
    { x: 290, y: 110 }, // の
    { x: 360, y: 130 }, // ん
    { x: 430, y: 115 }, // び
    { x: 500, y: 135 }, // よ
    { x: 570, y: 125 } // り
  ];

  const { loadDefaultFonts, getFontFamily, isLoading: fontLoading } = useFont();

  const createBaseImage = async (
    width: number,
    height: number
  ): Promise<ImageData> => {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d")!;

    // 背景グラデーション（のんのんびより風）
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, "#87CEEB"); // スカイブルー
    gradient.addColorStop(0.7, "#98FB98"); // ペールグリーン
    gradient.addColorStop(1, "#F0E68C"); // カーキ

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // 雲のような装飾を追加
    ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
    for (let i = 0; i < 5; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height * 0.4;
      const radius = 20 + Math.random() * 30;

      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    }

    return ctx.getImageData(0, 0, width, height);
  };

  const generateGif = async (config: GifConfig) => {
    isLoading.value = true;
    progress.value = 0;
    error.value = null;

    try {
      // 入力文字数チェック
      if (config.text.length !== 7) {
        throw new Error("文字数は7文字である必要があります");
      }

      // 1. フォント読み込み
      await loadDefaultFonts();
      progress.value = 20;

      // 2. Canvas初期化
      const canvasWidth = config.mini ? 400 : 720;
      const canvasHeight = config.mini ? 225 : 405;

      const processor = new CanvasImageProcessor({
        width: canvasWidth,
        height: canvasHeight,
        quality: 10
      });

      progress.value = 30;

      // 3. ベース画像生成
      const baseImage = await createBaseImage(canvasWidth, canvasHeight);
      progress.value = 40;

      // 4. 文字設定準備
      const fontFamily = getFontFamily();
      const textConfigs = Array.from(config.text).map((char, index) => {
        const scale = config.mini ? 0.6 : 1.0;
        return {
          text: char,
          size: mojiConfig.size[index] * scale,
          rotate: mojiConfig.rotate[index],
          fill: mojiConfig.fill[index],
          x: textPositions[index].x * scale,
          y: textPositions[index].y * scale,
          fontFamily: fontFamily
        };
      });

      progress.value = 50;

      // 5. アニメーションフレーム生成
      const frameCount = 30;
      const frameDelay = 100; // 100ms

      const frames = await processor.createAnimationFrames(
        baseImage,
        textConfigs,
        frameCount,
        frameDelay
      );

      progress.value = 80;

      // 6. GIF生成
      const gifBlob = await processor.compositeAnimation(frames);
      progress.value = 90;

      // 7. Blob URL作成
      const gifUrl = URL.createObjectURL(gifBlob);
      currentGif.value = gifUrl;

      progress.value = 100;

      console.log("GIF生成完了:", gifUrl);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "GIF生成中にエラーが発生しました";
      error.value = errorMessage;
      console.error("GIF生成エラー:", err);
    } finally {
      isLoading.value = false;
    }
  };

  const clearGif = () => {
    if (currentGif.value) {
      URL.revokeObjectURL(currentGif.value);
      currentGif.value = null;
    }
  };

  // クリーンアップ
  onUnmounted(() => {
    clearGif();
  });

  return {
    generateGif,
    clearGif,
    isLoading: readonly(isLoading),
    progress: readonly(progress),
    currentGif: readonly(currentGif),
    error: readonly(error),
    mojiConfig,
    textPositions
  };
};
