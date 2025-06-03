import {
  CanvasImageProcessor,
  type AnimationFrame,
  type GifFrame
} from "~/utils/imageProcessor";
import { useFont } from "~/utils/fontLoader";

export interface GifConfig {
  text: string;
}

export interface MojiConfig {
  size: number[];
  rotate: number[];
  fill: string[];
  geo: string[];
  heightScale: number[];
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
  const currentStep = ref("");
  const estimatedTime = ref(0);
  const elapsedTime = ref(0);

  // 処理ステップの定義
  const steps = [
    { name: "フォント読み込み中...", weight: 15 },
    { name: "Canvas初期化中...", weight: 5 },
    { name: "ベースGIF分解中...", weight: 15 },
    { name: "文字設定準備中...", weight: 10 },
    { name: "アニメーションフレーム生成中...", weight: 35 },
    { name: "GIF合成中...", weight: 15 },
    { name: "最終処理中...", weight: 5 }
  ];

  // 文字ごとの設定（nonnon.jsから）
  const mojiConfig: MojiConfig = {
    size: [80, 70, 72, 54, 54, 64, 72],
    rotate: [-12, -2, -10, 6, -8, -14, 10],
    fill: [
      "#dd188b",
      "#dd188b",
      "#f57315",
      "#5ac02e",
      "#5ac02e",
      "#12a7c5",
      "#12a7c5"
    ],
    geo: [
      "+0+0",
      "+70+75",
      "+132+45",
      "+200+70",
      "+245+75",
      "+286+34",
      "+335+10"
    ],
    heightScale: [2, 1, 1.2, 1.2, 1.2, 1.6, 2]
  };

  // 文字の高さ変化（nonnon.jsのheights配列）
  const heights = [
    6, 6, 15, 24, 24, 61, 81, 93, 93, 95, 109, 119, 123, 123, 133, 134, 135, 135
  ];

  const { loadDefaultFonts, getFontFamily, isLoading: fontLoading } = useFont();

  // 文字画像を作成（nonnon.jsのmoji関数相当）
  const createTextCanvas = async (
    text: string,
    size: number,
    fill: string,
    rotate: number,
    fontFamily: string
  ): Promise<HTMLCanvasElement> => {
    const canvas = document.createElement("canvas");
    canvas.width = size * 3; // 文字サイズに応じて動的にサイズ調整
    canvas.height = size * 3;
    const ctx = canvas.getContext("2d")!;

    // 背景を透明に設定
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.save();

    // キャンバスの中央に移動
    ctx.translate(canvas.width / 2, canvas.height / 2);

    // 回転を適用
    ctx.rotate((rotate * Math.PI) / 180);

    // nonnon.jsと同じフォント設定
    ctx.font = `bold ${size}px ${fontFamily}`;
    ctx.fillStyle = fill;
    ctx.strokeStyle = fill;
    ctx.lineWidth = 2;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    // nonnon.jsと同じ順序：stroke -> fill
    ctx.strokeText(text, 0, 0);
    ctx.fillText(text, 0, 0);

    ctx.restore();

    // 文字の実際のサイズに合わせてトリミング（nonnon.jsの-trimオプション相当）
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const { left, top, right, bottom } = getTrimBounds(imageData);

    if (left < right && top < bottom) {
      const trimmedCanvas = document.createElement("canvas");
      trimmedCanvas.width = right - left;
      trimmedCanvas.height = bottom - top;
      const trimmedCtx = trimmedCanvas.getContext("2d")!;
      trimmedCtx.drawImage(
        canvas,
        left,
        top,
        right - left,
        bottom - top,
        0,
        0,
        right - left,
        bottom - top
      );
      return trimmedCanvas;
    }

    return canvas;
  };

  // 画像のトリミング境界を取得（ImageMagickの-trimオプション相当）
  const getTrimBounds = (imageData: ImageData) => {
    const { data, width, height } = imageData;
    let left = width,
      top = height,
      right = 0,
      bottom = 0;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const alpha = data[(y * width + x) * 4 + 3];
        if (alpha > 0) {
          left = Math.min(left, x);
          top = Math.min(top, y);
          right = Math.max(right, x + 1);
          bottom = Math.max(bottom, y + 1);
        }
      }
    }

    return { left, top, right, bottom };
  };

  // 合成用の文字画像を作成（nonnon.jsのロジックに基づく）
  const createCompositeTextImage = async (
    text: string,
    fontFamily: string
  ): Promise<HTMLCanvasElement> => {
    const chars = text.split("");

    // nonnon.jsのsplice計算に基づく幅計算
    let splice = 0;
    for (let s of mojiConfig.size) {
      splice += s - Math.floor(s / 10);
    }

    const canvas = document.createElement("canvas");
    canvas.width = splice + 100; // 余裕を持たせる
    canvas.height = 200;
    const ctx = canvas.getContext("2d")!;

    // 最初の文字でベースを作成（nonnon.jsのground処理相当）
    let baseCanvas: HTMLCanvasElement | null = null;

    for (let i = 0; i < chars.length; i++) {
      const charCanvas = await createTextCanvas(
        chars[i],
        mojiConfig.size[i],
        mojiConfig.fill[i],
        mojiConfig.rotate[i],
        fontFamily
      );

      const expandedCanvas = document.createElement("canvas");
      expandedCanvas.width = charCanvas.width;
      expandedCanvas.height = Math.floor(
        mojiConfig.size[i] * mojiConfig.heightScale[i]
      );
      const expandedCtx = expandedCanvas.getContext("2d")!;
      expandedCtx.drawImage(
        charCanvas,
        0,
        0,
        charCanvas.width,
        expandedCanvas.height
      );

      if (i === 0) {
        // 最初の文字でベースキャンバスを作成（ground処理）
        baseCanvas = document.createElement("canvas");
        baseCanvas.width = splice + 100;
        baseCanvas.height = 200;
        const baseCtx = baseCanvas.getContext("2d")!;
        baseCtx.drawImage(expandedCanvas, 0, 0);
      } else {
        // geo文字列をパース（例: '+70+10' -> x=70, y=10）
        const geo = mojiConfig.geo[i];
        const matches = geo.match(/\+(\d+)\+(\d+)/);
        const x = matches ? parseInt(matches[1]) : 0;
        const y = matches ? parseInt(matches[2]) : 0;

        if (baseCanvas) {
          const baseCtx = baseCanvas.getContext("2d")!;
          baseCtx.drawImage(expandedCanvas, x, y);
        }
      }
    }

    if (baseCanvas) {
      // ベースキャンバスの内容を最終キャンバスにコピー
      ctx.drawImage(baseCanvas, 0, 0);
    }

    // 文字の実際のサイズに合わせてトリミング
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const { left, top, right, bottom } = getTrimBounds(imageData);

    if (left < right && top < bottom) {
      const trimmedCanvas = document.createElement("canvas");
      trimmedCanvas.width = right - left;
      trimmedCanvas.height = bottom - top;
      const trimmedCtx = trimmedCanvas.getContext("2d")!;
      trimmedCtx.drawImage(
        canvas,
        left,
        top,
        right - left,
        bottom - top,
        0,
        0,
        right - left,
        bottom - top
      );
      return trimmedCanvas;
    }

    return canvas;
  };

  const generateGif = async (config: GifConfig) => {
    console.log("GIF生成開始:", config);
    isLoading.value = true;
    progress.value = 0;
    error.value = null;
    currentStep.value = "";
    elapsedTime.value = 0;

    const startTime = Date.now();
    estimatedTime.value = 60000;

    const timeInterval = setInterval(() => {
      elapsedTime.value = Date.now() - startTime;
    }, 1000);

    try {
      // 入力文字数チェック
      if (config.text.length !== 7) {
        throw new Error("文字数は7文字である必要があります");
      }

      let currentProgress = 0;

      // 1. フォント読み込み
      currentStep.value = steps[0].name;
      await loadDefaultFonts();
      currentProgress += steps[0].weight;
      progress.value = currentProgress;

      // 2. Canvas初期化
      currentStep.value = steps[1].name;
      const canvasWidth = 640;
      const canvasHeight = 360;

      const processor = new CanvasImageProcessor({
        width: canvasWidth,
        height: canvasHeight,
        quality: 10
      });

      currentProgress += steps[1].weight;
      progress.value = currentProgress;

      // 3. ベースGIF分解
      currentStep.value = steps[2].name;
      const baseGifFrames = await processor.loadGifFrames(
        "/animations/non-base.gif"
      );
      console.log(
        `ベースGIFから ${baseGifFrames.length} フレームを分解しました`
      );
      currentProgress += steps[2].weight;
      progress.value = currentProgress;

      // 4. 文字画像準備
      currentStep.value = steps[3].name;
      const fontFamily = getFontFamily();
      const textCanvas = await createCompositeTextImage(
        config.text,
        fontFamily
      );

      currentProgress += steps[3].weight;
      progress.value = currentProgress;

      // 5. アニメーションフレーム生成
      currentStep.value = steps[4].name;
      const animationFrames: AnimationFrame[] = [];

      // ベースGIFフレームを個別に処理して追加
      // for (const baseFrame of baseGifFrames) {
      //   const canvas = document.createElement("canvas");
      //   canvas.width = canvasWidth;
      //   canvas.height = canvasHeight;
      //   const ctx = canvas.getContext("2d")!;

      //   // GifFrameからCanvasを作成してリサイズして描画
      //   const frameCanvas = processor.createCanvasFromGifFrame(baseFrame);
      //   ctx.drawImage(frameCanvas, 0, 0, canvasWidth, canvasHeight);

      //   animationFrames.push({
      //     imageData: ctx.getImageData(0, 0, canvasWidth, canvasHeight),
      //     delay: baseFrame.delay
      //   });
      // }

      // 連番GIFフレーム（107-200）を処理
      let heightIndex = 0;
      for (let frameNum = 107; frameNum <= 200; frameNum++) {
        const frameUrl = `/animations/non/nonnon${frameNum
          .toString()
          .padStart(4, "0")}.gif`;

        try {
          // gifuct-jsで各連番GIFを分解
          const frameGifs = await processor.loadGifFrames(frameUrl);

          for (const frameGif of frameGifs) {
            let compositeCanvas: HTMLCanvasElement;

            if (frameNum >= 107 && frameNum <= 123) {
              // 文字が徐々に大きくなる部分（nonnon.jsの107-123処理）
              const textHeight = heights[heightIndex];

              // 文字画像を指定の高さにスケール
              const scaledTextCanvas = document.createElement("canvas");
              scaledTextCanvas.width = textCanvas.width;
              scaledTextCanvas.height = textHeight;
              const scaledCtx = scaledTextCanvas.getContext("2d")!;
              scaledCtx.drawImage(
                textCanvas,
                0,
                0,
                textCanvas.width,
                textHeight
              );

              const frameCanvas = processor.createCanvasFromGifFrame(frameGif);
              compositeCanvas = await processor.compositeTextOnImage(
                frameCanvas,
                scaledTextCanvas,
                heights[heights.length - 1] // 最終的な高さ（135）を渡す
              );

              // heightIndexは各フレーム番号につき一度だけ増加
              if (frameGifs.indexOf(frameGif) === frameGifs.length - 1) {
                heightIndex++;
              }
            } else if (frameNum >= 124) {
              // 文字画像を指定の高さにスケール
              const scaledTextCanvas = document.createElement("canvas");
              scaledTextCanvas.width = textCanvas.width;
              scaledTextCanvas.height = heights[heights.length - 1];
              const scaledCtx = scaledTextCanvas.getContext("2d")!;
              scaledCtx.drawImage(
                textCanvas,
                0,
                0,
                textCanvas.width,
                heights[heights.length - 1]
              );
              // 文字サイズ固定部分（nonnon.jsの124-200処理）
              const frameCanvas = processor.createCanvasFromGifFrame(frameGif);
              compositeCanvas = await processor.compositeTextOnImage(
                frameCanvas,
                scaledTextCanvas,
                heights[heights.length - 1] // 最終的な高さ（135）を渡す
              );
            } else {
              // 文字なし
              compositeCanvas = processor.createCanvasFromGifFrame(frameGif);
            }

            // キャンバスを640x360にリサイズ
            const resizedCanvas = document.createElement("canvas");
            resizedCanvas.width = canvasWidth;
            resizedCanvas.height = canvasHeight;
            const resizedCtx = resizedCanvas.getContext("2d")!;
            resizedCtx.drawImage(
              compositeCanvas,
              0,
              0,
              canvasWidth,
              canvasHeight
            );

            animationFrames.push({
              imageData: resizedCtx.getImageData(
                0,
                0,
                canvasWidth,
                canvasHeight
              ),
              delay: frameGif.delay
            });
          }
        } catch (frameError) {
          console.warn(`フレーム ${frameNum} の読み込みに失敗:`, frameError);
        }

        // プログレス更新
        const frameProgress =
          ((frameNum - 107) / (200 - 107)) * steps[4].weight;
        progress.value = currentProgress + frameProgress;
      }

      currentProgress += steps[4].weight;
      progress.value = currentProgress;

      // 6. GIF生成
      currentStep.value = steps[5].name;
      const gifBlob = await processor.compositeAnimation(animationFrames);
      currentProgress += steps[5].weight;
      progress.value = currentProgress;

      // 7. 最終処理
      currentStep.value = steps[6].name;
      const gifUrl = URL.createObjectURL(gifBlob);
      currentGif.value = gifUrl;

      currentProgress += steps[6].weight;
      progress.value = 100;
      currentStep.value = "完了！";

      console.log("GIF生成完了:", gifUrl);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "GIF生成中にエラーが発生しました";
      error.value = errorMessage;
      currentStep.value = "エラーが発生しました";
      console.error("GIF生成エラー:", err);
    } finally {
      clearInterval(timeInterval);
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
    currentStep: readonly(currentStep),
    estimatedTime: readonly(estimatedTime),
    elapsedTime: readonly(elapsedTime),
    currentGif: readonly(currentGif),
    error: readonly(error),
    mojiConfig,
    heights
  };
};
