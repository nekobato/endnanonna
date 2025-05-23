export interface GifConfig {
  text: string;
  mini?: boolean;
}

export interface MojiConfig {
  size: number[];
  rotate: number[];
  fill: string[];
}

export const useGifGenerator = () => {
  const isLoading = ref(false);
  const progress = ref(0);
  const currentGif = ref<string | null>(null);

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

  const generateGif = async (config: GifConfig) => {
    isLoading.value = true;
    progress.value = 0;

    try {
      // 1. Canvas初期化
      progress.value = 25;

      // 2. 文字レンダリング
      progress.value = 50;

      // 3. アニメーション合成
      progress.value = 75;

      // 4. GIF出力
      progress.value = 100;

      // TODO: 実際のGIF生成処理を実装
    } catch (error) {
      console.error("GIF生成エラー:", error);
    } finally {
      isLoading.value = false;
    }
  };

  return {
    generateGif,
    isLoading: readonly(isLoading),
    progress: readonly(progress),
    currentGif: readonly(currentGif),
    mojiConfig
  };
};
