export function initializeImage(height: number, width: number): Float32Array {
  const original = new Float32Array(height * width);
  {
    let i = 0;
    for (let x = 0; x < height; x++) {
      const cosVal = -Math.cos(x / height * Math.PI);
      const mid = randomMid(cosVal);
      const halfRange = randomHalfRange(cosVal);
      for (let y = 0; y < width; y++) {
        const rand = 2 * Math.random() - 1;
        original[i++] = mid + rand * halfRange;
      }
    }
  }
  return original;
}

export function getAntiAliasedImage(original: Float32Array, height: number, width: number): Float32Array {
  const result = new Float32Array(height * width);
  {
    let i = 0;
    for (let x = 0; x < height; x++) {
      const cosVal = Math.cos(x * Math.PI);
      for (let y = 0; y < width; y++) {
        let sum = 4 * original[i];
        if (x != 0) sum += original[i - width];
        if (x != height - 1) sum += original[i + width]; else sum++;
        if (y != 0) sum += original[i - 1]; else sum += cosVal;
        if (y != width - 1) sum += original[i + 1]; else sum += cosVal;
        result[i++] = sum / 8;
      }
    }
  }
  return result;
}

export function transitImage(original: Float32Array, height: number, width: number, interval: number): Float32Array {
  const magic = Math.min(1, interval / 60);
  {
    let i = 0;
    for (let x = 0; x < height; x++) {
      const cosVal = -Math.cos(x / height * Math.PI);
      const mid = randomMid(cosVal);
      const halfRange = randomHalfRange(cosVal);
      for (let y = 0; y < width; y++) {
        const org = original[i];
        const diff = org - mid;
        const diffRate = diff / halfRange;
        const moveSize = Math.min(mid + halfRange - org, org - mid + halfRange) / 3 * magic * Math.sign(2 * Math.random() - 1 - (diffRate));
        original[i++] = org + moveSize;
      }
    }
  }
  return original;
}

function randomMid(cosVal: number) {
  return (cosVal + 1) / 2;
}

function randomHalfRange(cosVal: number) {
  return (-Math.abs(cosVal) + 1) / 2.25;
}
