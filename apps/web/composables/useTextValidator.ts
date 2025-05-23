export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export const useTextValidator = () => {
  const validateText = (text: string): ValidationResult => {
    // 空文字チェック
    if (!text || text.trim().length === 0) {
      return {
        isValid: false,
        error: "文字を入力してください"
      };
    }

    // 文字数チェック（7文字）
    if (text.length !== 7) {
      return {
        isValid: false,
        error: "7文字で入力してください"
      };
    }

    // 日本語文字チェック（ひらがな、カタカナ、漢字）
    const japaneseRegex =
      /^[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF\u3400-\u4DBF]+$/;
    if (!japaneseRegex.test(text)) {
      return {
        isValid: false,
        error: "日本語で入力してください"
      };
    }

    return {
      isValid: true
    };
  };

  const getCharacterCount = (text: string): number => {
    return text.length;
  };

  const getRemainingCount = (text: string, maxLength: number = 7): number => {
    return Math.max(0, maxLength - text.length);
  };

  return {
    validateText,
    getCharacterCount,
    getRemainingCount
  };
};
