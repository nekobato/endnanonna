export const requiredAt = <T>(values: ArrayLike<T>, index: number): T => {
  if (!Number.isInteger(index) || index < 0 || index >= values.length) {
    throw new RangeError(`Index ${index} is outside the available values`);
  }
  const value = values[index];
  if (value === undefined) {
    throw new RangeError(`No value exists at index ${index}`);
  }
  return value;
};
