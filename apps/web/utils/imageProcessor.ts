export interface ImageProcessorConfig {
  width: number;
  height: number;
  quality?: number;
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

  async compositeAnimation(frames: ImageData[]): Promise<Blob> {
    // GIF生成ライブラリ（gif.js）を使用する予定
    // 現在はプレースホルダー実装

    // 最初のフレームをPNGとして返す（仮実装）
    this.ctx.putImageData(frames[0], 0, 0);

    return new Promise((resolve, reject) => {
      this.canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error("Failed to create blob"));
        }
      }, "image/png");
    });
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
