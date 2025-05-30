export interface TextConfig {
  text: string;
  size: number;
  rotate: number;
  fill: string;
  x: number;
  y: number;
  fontFamily?: string;
  stroke?: {
    color: string;
    width: number;
  };
  shadow?: {
    color: string;
    blur: number;
    offsetX: number;
    offsetY: number;
  };
}

export interface CanvasConfig {
  width: number;
  height: number;
  backgroundColor?: string;
}

export interface GradientConfig {
  type: "linear" | "radial";
  colors: Array<{ offset: number; color: string }>;
  coordinates?: {
    x0: number;
    y0: number;
    x1: number;
    y1: number;
    r0?: number;
    r1?: number;
  };
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

  const createGradient = (
    ctx: CanvasRenderingContext2D,
    config: GradientConfig
  ): CanvasGradient => {
    let gradient: CanvasGradient;

    if (config.type === "linear") {
      const coords = config.coordinates || {
        x0: 0,
        y0: 0,
        x1: 0,
        y1: ctx.canvas.height
      };
      gradient = ctx.createLinearGradient(
        coords.x0,
        coords.y0,
        coords.x1,
        coords.y1
      );
    } else {
      const coords = config.coordinates || {
        x0: 0,
        y0: 0,
        x1: 0,
        y1: 0,
        r0: 0,
        r1: 100
      };
      gradient = ctx.createRadialGradient(
        coords.x0,
        coords.y0,
        coords.r0 || 0,
        coords.x1,
        coords.y1,
        coords.r1 || 100
      );
    }

    config.colors.forEach(({ offset, color }) => {
      gradient.addColorStop(offset, color);
    });

    return gradient;
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
    const fontFamily = config.fontFamily || '"Rounded M+ 1c", sans-serif';
    ctx.font = `bold ${config.size}px ${fontFamily}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "bottom";

    // 影の設定
    if (config.shadow) {
      ctx.shadowColor = config.shadow.color;
      ctx.shadowBlur = config.shadow.blur;
      ctx.shadowOffsetX = config.shadow.offsetX;
      ctx.shadowOffsetY = config.shadow.offsetY;
    }

    // 縁取りの描画
    if (config.stroke) {
      ctx.strokeStyle = config.stroke.color;
      ctx.lineWidth = config.stroke.width;
      ctx.strokeText(config.text, 0, 0);
    }

    // 文字の塗りつぶし
    ctx.fillStyle = config.fill;
    ctx.fillText(config.text, 0, 0);

    ctx.restore();
  };

  const renderTextWithEffect = (
    canvas: HTMLCanvasElement,
    config: TextConfig,
    effect?: {
      scale?: number;
      opacity?: number;
      glow?: boolean;
    }
  ): void => {
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.save();

    // エフェクトの適用
    if (effect) {
      if (effect.opacity !== undefined) {
        ctx.globalAlpha = effect.opacity;
      }
      if (effect.scale !== undefined) {
        ctx.scale(effect.scale, effect.scale);
      }
      if (effect.glow) {
        ctx.shadowColor = config.fill;
        ctx.shadowBlur = 20;
      }
    }

    renderText(canvas, config);

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

  const renderBackground = (
    canvas: HTMLCanvasElement,
    gradientConfig: GradientConfig
  ): void => {
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const gradient = createGradient(ctx, gradientConfig);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  const clearCanvas = (canvas: HTMLCanvasElement): void => {
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
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

  const getImageData = (
    canvas: HTMLCanvasElement,
    x: number = 0,
    y: number = 0,
    width?: number,
    height?: number
  ): ImageData | null => {
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    const w = width || canvas.width;
    const h = height || canvas.height;

    return ctx.getImageData(x, y, w, h);
  };

  return {
    createCanvas,
    createGradient,
    renderText,
    renderTextWithEffect,
    renderMultipleTexts,
    renderBackground,
    clearCanvas,
    canvasToBlob,
    canvasToDataURL,
    getImageData
  };
};
