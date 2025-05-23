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

export const useCanvasRenderer = () => {
  const createCanvas = (config: CanvasConfig): HTMLCanvasElement => {
    const canvas = document.createElement("canvas");
    canvas.width = config.width;
    canvas.height = config.height;

    const ctx = canvas.getContext("2d");
    if (ctx && config.backgroundColor) {
      ctx.fillStyle = config.backgroundColor;
      ctx.fillRect(0, 0, config.width, config.height);
    }

    return canvas;
  };

  const renderText = (canvas: HTMLCanvasElement, config: TextConfig): void => {
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.save();

    // 文字の位置に移動
    ctx.translate(config.x, config.y);

    // 回転を適用
    ctx.rotate((config.rotate * Math.PI) / 180);

    // フォント設定
    ctx.font = `bold ${config.size}px "Rounded M+ 1c", sans-serif`;
    ctx.fillStyle = config.fill;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    // 文字を描画
    ctx.fillText(config.text, 0, 0);

    ctx.restore();
  };

  const renderMultipleTexts = (
    canvas: HTMLCanvasElement,
    configs: TextConfig[]
  ): void => {
    configs.forEach((config) => {
      renderText(canvas, config);
    });
  };

  const canvasToBlob = (
    canvas: HTMLCanvasElement,
    type: string = "image/png"
  ): Promise<Blob | null> => {
    return new Promise((resolve) => {
      canvas.toBlob(resolve, type);
    });
  };

  const canvasToDataURL = (
    canvas: HTMLCanvasElement,
    type: string = "image/png"
  ): string => {
    return canvas.toDataURL(type);
  };

  return {
    createCanvas,
    renderText,
    renderMultipleTexts,
    canvasToBlob,
    canvasToDataURL
  };
};
