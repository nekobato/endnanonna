declare module "gif.js" {
  interface GIFOptions {
    workers?: number;
    quality?: number;
    width?: number;
    height?: number;
    workerScript?: string;
    background?: string;
    transparent?: string;
    dither?: boolean;
    debug?: boolean;
  }

  interface AddFrameOptions {
    delay?: number;
    copy?: boolean;
  }

  class GIF {
    constructor(options?: GIFOptions);

    addFrame(
      element:
        | HTMLCanvasElement
        | HTMLImageElement
        | CanvasRenderingContext2D
        | ImageData,
      options?: AddFrameOptions
    ): void;

    render(): void;

    on(event: "finished", callback: (blob: Blob) => void): void;
    on(event: "error", callback: (error: Error) => void): void;
    on(event: "progress", callback: (progress: number) => void): void;
    on(event: "start", callback: () => void): void;

    abort(): void;
  }

  export = GIF;
}
