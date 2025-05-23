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
}

export const createImageProcessor = (
  config: ImageProcessorConfig
): CanvasImageProcessor => {
  return new CanvasImageProcessor(config);
};
