import GIF from "gif.js";
import { parseGIF, decompressFrames } from "gifuct-js";

export interface ImageProcessorConfig {
  width: number;
  height: number;
  quality?: number;
}

export interface AnimationFrame {
  imageData: ImageData;
  delay: number;
}

export interface GifFrame {
  imageData: ImageData;
  delay: number;
  width: number;
  height: number;
}

export class CanvasImageProcessor {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  constructor(config: ImageProcessorConfig) {
    this.canvas = document.createElement("canvas");
    this.canvas.width = config.width;
    this.canvas.height = config.height;

    const ctx = this.canvas.getContext("2d");
    if (!ctx) {
      throw new Error("Canvas context not available");
    }
    this.ctx = ctx;
  }

  async renderText(config: {
    text: string;
    size: number;
    rotate: number;
    fill: string;
    x: number;
    y: number;
    fontFamily?: string;
  }): Promise<ImageData> {
    this.ctx.save();

    // 背景をクリア
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // 文字の位置に移動
    this.ctx.translate(config.x, config.y);

    // 回転を適用
    this.ctx.rotate((config.rotate * Math.PI) / 180);

    // フォント設定
    const fontFamily = config.fontFamily || '"Rounded M+ 1c", sans-serif';
    this.ctx.font = `bold ${config.size}px ${fontFamily}`;
    this.ctx.fillStyle = config.fill;
    this.ctx.textAlign = "center";
    this.ctx.textBaseline = "middle";

    // 文字を描画
    this.ctx.fillText(config.text, 0, 0);

    this.ctx.restore();

    return this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
  }

  async compositeImages(
    baseImage: ImageData,
    overlayImages: ImageData[]
  ): Promise<ImageData> {
    // ベース画像を描画
    this.ctx.putImageData(baseImage, 0, 0);

    // オーバーレイ画像を合成
    overlayImages.forEach((imageData) => {
      this.ctx.putImageData(imageData, 0, 0);
    });

    return this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
  }

  async compositeAnimation(frames: AnimationFrame[]): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const gif = new GIF({
        workers: 2,
        quality: 10,
        width: this.canvas.width,
        height: this.canvas.height,
        workerScript: "/gif.worker.js"
      });

      // 各フレームをGIFに追加
      frames.forEach((frame) => {
        // CanvasをGIFフレームとして追加
        gif.addFrame(frame.imageData, { delay: frame.delay });
      });

      gif.on("finished", (blob: Blob) => {
        resolve(blob);
      });

      gif.on("error", (error: Error) => {
        reject(error);
      });

      gif.render();
    });
  }

  async createAnimationFrames(
    baseImageData: ImageData,
    textConfigs: Array<{
      text: string;
      size: number;
      rotate: number;
      fill: string;
      x: number;
      y: number;
      fontFamily?: string;
    }>,
    frameCount: number = 30,
    frameDelay: number = 70
  ): Promise<AnimationFrame[]> {
    const frames: AnimationFrame[] = [];

    for (let i = 0; i < frameCount; i++) {
      // ベース画像を描画
      this.ctx.putImageData(baseImageData, 0, 0);

      // 各文字を描画（アニメーション効果を適用）
      textConfigs.forEach((config, index) => {
        const animationProgress = (i + index * 3) / frameCount;
        const scale = 0.8 + 0.2 * Math.sin(animationProgress * Math.PI * 2);

        this.ctx.save();
        this.ctx.translate(config.x, config.y);
        this.ctx.rotate((config.rotate * Math.PI) / 180);

        // scale()変換を使わず、直接フォントサイズを調整して位置ずれを防ぐ
        const scaledSize = Math.round(config.size * scale);
        const fontFamily = config.fontFamily || '"Rounded M+ 1c", sans-serif';
        this.ctx.font = `bold ${scaledSize}px ${fontFamily}`;
        this.ctx.fillStyle = config.fill;
        this.ctx.textAlign = "center";
        this.ctx.textBaseline = "middle";

        this.ctx.fillText(config.text, 0, 0);
        this.ctx.restore();
      });

      const frameImageData = this.ctx.getImageData(
        0,
        0,
        this.canvas.width,
        this.canvas.height
      );
      frames.push({
        imageData: frameImageData,
        delay: frameDelay
      });
    }

    return frames;
  }

  getCanvas(): HTMLCanvasElement {
    return this.canvas;
  }

  getContext(): CanvasRenderingContext2D {
    return this.ctx;
  }
  // GIF画像を読み込んでフレームを取得（gifuct-jsを使用）
  async loadGifFrames(gifUrl: string): Promise<GifFrame[]> {
    try {
      // GIFファイルをArrayBufferとして取得
      const response = await fetch(gifUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch GIF: ${response.status}`);
      }

      const arrayBuffer = await response.arrayBuffer();

      // gifuct-jsでGIFを解析
      const gif = parseGIF(arrayBuffer);
      const frames = decompressFrames(gif, true);

      const gifFrames: GifFrame[] = [];

      for (const frame of frames) {
        // RGBA配列からImageDataを作成
        const imageData = new ImageData(
          new Uint8ClampedArray(frame.patch),
          frame.dims.width,
          frame.dims.height
        );

        gifFrames.push({
          imageData: imageData,
          delay: frame.delay || 70, // デフォルト70ms
          width: frame.dims.width,
          height: frame.dims.height
        });
      }

      return gifFrames;
    } catch (error) {
      console.error("GIF loading error:", error);
      throw new Error(`Failed to load GIF frames: ${error}`);
    }
  }

  // 画像にテキストを合成（nonnon.jsのcompo関数相当）
  async compositeTextOnImage(
    baseCanvas: HTMLCanvasElement,
    textCanvas: HTMLCanvasElement,
    maxHeight?: number
  ): Promise<HTMLCanvasElement> {
    const canvas = document.createElement("canvas");
    canvas.width = baseCanvas.width;
    canvas.height = baseCanvas.height;
    const ctx = canvas.getContext("2d")!;

    // ベース画像を描画
    ctx.drawImage(baseCanvas, 0, 0);

    // テキスト画像を中央に配置して合成
    ctx.save();
    ctx.globalCompositeOperation = "source-over";

    // 中心位置を計算
    const centerX = baseCanvas.width / 2;
    const centerY = baseCanvas.height / 2 + 30;

    if (maxHeight && textCanvas.height < maxHeight) {
      // 起き上がりアニメーション：下端を基準に配置
      // maxHeightの領域の下端にtextCanvasの下端を合わせる
      const yOffset = maxHeight - textCanvas.height;

      ctx.drawImage(
        textCanvas,
        centerX - textCanvas.width / 2,
        centerY - maxHeight / 2 + yOffset
      );
    } else {
      // 通常の描画（最大高さに達している場合）
      ctx.drawImage(
        textCanvas,
        centerX - textCanvas.width / 2,
        centerY - textCanvas.height / 2
      );
    }

    ctx.restore();

    return canvas;
  }

  // GifFrameからCanvasを作成するヘルパーメソッド
  createCanvasFromGifFrame(gifFrame: GifFrame): HTMLCanvasElement {
    const canvas = document.createElement("canvas");
    canvas.width = gifFrame.width;
    canvas.height = gifFrame.height;
    const ctx = canvas.getContext("2d")!;
    ctx.putImageData(gifFrame.imageData, 0, 0);
    return canvas;
  }
}

export const createImageProcessor = (
  config: ImageProcessorConfig
): CanvasImageProcessor => {
  return new CanvasImageProcessor(config);
};
