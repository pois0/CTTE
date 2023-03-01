export function drawImage(ctx: CanvasRenderingContext2D, height: number, width: number, colorData: Float32Array) {
  const imageData = ctx.createImageData(width, height);
  const data = imageData.data;
  {
    let i = 0;
    for (let x = 0; x < height; x++) {
      for (let y = 0; y < width; y++) {
        data[i * 4 + 0] = 0;
        data[i * 4 + 1] = Math.round(colorData[i] * 0x80);
        data[i * 4 + 2] = 0;
        data[i * 4 + 3] = 255;
        i++;
      }
    }
  }
  ctx.putImageData(imageData, 0, 0);
}

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

export function getAntiAliasedImagePartially(from: Float32Array, to: Float32Array, offsetX: number, lengthX: number, height: number, width: number): Float32Array {
  {
    let i = offsetX * width;
    const untilX = offsetX + lengthX;
    for (let x = offsetX; x < untilX; x++) {
      const cosVal = Math.cos(x * Math.PI);
      for (let y = 0; y < width; y++) {
        let sum = 4 * from[i];
        if (x != 0) sum += from[i - width];
        if (x != height - 1) sum += from[i + width]; else sum++;
        if (y != 0) sum += from[i - 1]; else sum += cosVal;
        if (y != width - 1) sum += from[i + 1]; else sum += cosVal;
        to[i++] = sum / 8;
      }
    }
  }
  return to;
}

export function transitImagePartially(from: Float32Array, to: Float32Array, offsetX: number, lengthX: number, height: number, width: number, magic: number): Float32Array {
  {
    let i = offsetX * width;
    const untilX = offsetX + lengthX;
    for (let x = offsetX; x < untilX; x++) {
      const cosVal = -Math.cos(x / height * Math.PI);
      const mid = randomMid(cosVal);
      const halfRange = randomHalfRange(cosVal);
      for (let y = 0; y < width; y++) {
        const org = from[i];
        const diff = org - mid;
        const diffRate = diff / halfRange;
        const moveSize = Math.min(mid + halfRange - org, org - mid + halfRange) / 3 * magic * Math.sign(2 * Math.random() - 1 - (diffRate));
        to[i++] = org + moveSize;
      }
    }
  }
  return to;
}

function randomMid(cosVal: number) {
  return (cosVal + 1) / 2;
}

function randomHalfRange(cosVal: number) {
  return (-Math.abs(cosVal) + 1) / 2.25;
}
