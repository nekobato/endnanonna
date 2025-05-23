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

declare module "gifuct-js" {
  interface GIFDimensions {
    top: number;
    left: number;
    width: number;
    height: number;
  }

  interface GIFFrame {
    dims: GIFDimensions;
    delay: number;
    patch: Uint8Array;
    disposalType: number;
    transparentIndex?: number;
  }

  interface ParsedGIF {
    width: number;
    height: number;
    frames: any[];
    globalColorTable?: Uint8Array;
  }

  export function parseGIF(buffer: ArrayBuffer): ParsedGIF;
  export function decompressFrames(
    gif: ParsedGIF,
    buildPatch: boolean
  ): GIFFrame[];
}
