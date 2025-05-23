import GIF from "gif.js";

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
  canvas: HTMLCanvasElement;
  delay: number;
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
        // ImageDataをCanvasに描画
        this.ctx.putImageData(frame.imageData, 0, 0);

        // CanvasをGIFフレームとして追加
        gif.addFrame(this.canvas, { delay: frame.delay });
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
    frameDelay: number = 100
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
        this.ctx.scale(scale, scale);

        const fontFamily = config.fontFamily || '"Rounded M+ 1c", sans-serif';
        this.ctx.font = `bold ${config.size}px ${fontFamily}`;
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
  // GIF画像を読み込んでフレームを取得
  async loadGifFrames(gifUrl: string): Promise<GifFrame[]> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";

      img.onload = () => {
        // 単一フレームのGIFとして扱う（実際のGIFアニメーション解析は複雑なため）
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(img, 0, 0);

        resolve([
          {
            canvas: canvas,
            delay: 70 // 約15fps (nonnon.jsのdelay=7 * 10ms)
          }
        ]);
      };

      img.onerror = () => reject(new Error(`Failed to load GIF: ${gifUrl}`));
      img.src = gifUrl;
    });
  }

  // 画像にテキストを合成（nonnon.jsのcompo関数相当）
  async compositeTextOnImage(
    baseCanvas: HTMLCanvasElement,
    textCanvas: HTMLCanvasElement,
    textHeight?: number
  ): Promise<HTMLCanvasElement> {
    const canvas = document.createElement("canvas");
    canvas.width = baseCanvas.width;
    canvas.height = baseCanvas.height;
    const ctx = canvas.getContext("2d")!;

    // ベース画像を描画
    ctx.drawImage(baseCanvas, 0, 0);

    // nonnon.jsのcompo関数の位置計算: +5+${72 - height / 2}
    const x = 5;
    const y = textHeight ? 72 - textHeight / 2 : 72;

    // テキスト画像を中央に配置して合成
    ctx.save();
    ctx.globalCompositeOperation = "source-over";

    if (textHeight) {
      // 高さを調整してテキストを描画
      const scaledCanvas = document.createElement("canvas");
      scaledCanvas.width = textCanvas.width;
      scaledCanvas.height = textHeight;
      const scaledCtx = scaledCanvas.getContext("2d")!;
      scaledCtx.drawImage(textCanvas, 0, 0, textCanvas.width, textHeight);

      // 中央配置で合成
      const centerX = (canvas.width - scaledCanvas.width) / 2 + x;
      ctx.drawImage(scaledCanvas, centerX, y);
    } else {
      // 中央配置で合成
      const centerX = (canvas.width - textCanvas.width) / 2 + x;
      ctx.drawImage(textCanvas, centerX, y);
    }

    ctx.restore();

    return canvas;
  }
}

export const createImageProcessor = (
  config: ImageProcessorConfig
): CanvasImageProcessor => {
  return new CanvasImageProcessor(config);
};
