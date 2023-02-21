export {};

document.addEventListener("DOMContentLoaded", main);
window.addEventListener('resize', main);
window.addEventListener('click', main);

function main(_: Event) {
  const height = window.innerHeight;
  const width = window.innerWidth;

  const canvas = getCanvasWithSize(height, width);
  const ctx = canvas.getContext("2d", { alpha: false });
  if (!ctx) return;
  const colorData = getAntiAliasedImage(getOriginalImage(height, width), height, width);
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

function getCanvasWithSize(height: number, width: number): HTMLCanvasElement {
  const canvas = document.getElementById("main") as HTMLCanvasElement;
  canvas.height = height;
  canvas.width = width;
  return canvas;
}

function getOriginalImage(height: number, width: number): Float32Array {
  const original = new Float32Array(height * width);
  {
    let i = 0;
    for (let x = 0; x < height; x++)
      for (let y = 0; y < width; y++)
        original[i++] = getRandomPixel(x / height);
  }
  return original;
}

function getAntiAliasedImage(original: Float32Array, height: number, width: number): Float32Array {
  const result = new Float32Array(height * width);
  {
    let i = 0;
    for (let x = 0; x < height; x++) {
      const cosVal =Math.cos(x * Math.PI);
      for (let y = 0; y < width; y++) {
        let sum = original[i];
        if (x != 0) sum += original[i - width];
        if (x != height - 1) sum += original[i + width]; else sum++;
        if (y != 0) sum += original[i - 1]; else sum += cosVal;
        if (y != width - 1) sum += original[i + 1]; else sum += cosVal;
        result[i++] = sum / 5;
      }
    }
  }
  return result;
}

function getRandomPixel(x: number): number {
  const rand = 2 * Math.random() - 1;
  const cosRes = -Math.cos(x * Math.PI);
  return (cosRes + 1) / 2 + rand * (-Math.abs(cosRes) + 1) / 2.25;
}
