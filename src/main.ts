export {};

document.addEventListener("DOMContentLoaded", main);
window.addEventListener('resize', main);
window.addEventListener('click', main);

function main(_: Event) {
  const height = window.innerHeight;
  const width = window.innerWidth;

  const canvas = getCanvasWithSize(height, width);
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const imageData = ctx.createImageData(width, height);
  const colorData = getAntiAliasedImage(getOriginalImage(height, width), height, width);
  const data = imageData.data;
  {
    let i = 0;
    for (let x = 0; x < height; x++) {
      for (let y = 0; y < width; y++) {
        data[i * 4 + 0] = 0;
        data[i * 4 + 1] = colorData[i] * 0x20;
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

function getOriginalImage(height: number, width: number): Int8Array {
  const original = new Int8Array(height * width);
  {
    let i = 0;
    for (let x = 0; x < height; x++)
      for (let y = 0; y < width; y++)
        original[i++] = getRandomPixel(height, x);
  }
  return original;
}

function getAntiAliasedImage(original: Int8Array, height: number, width: number): Int8Array {
  const result = new Int8Array(height * width);
  {
    let i = 0;
    for (let x = 0; x < height; x++)
      for (let y = 0; y < width; y++) {
        let sum = 0;
        if (x != 0) sum += original[i - width];
        if (x != height - 1) sum += original[i + width]; else sum++;
        if (y != 0) sum += original[i - 1]; else sum += x < (height / 2) ? 0 : 1;
        if (y != width - 1) sum += original[i + 1]; else sum += x < (height / 2) ? 0 : 1;
        result[i++] = sum;
      }
  }
  return result;
}

function getRandomPixel(height: number, x: number): number {
  const rand = Math.random();
  const check = (Math.cos(x * Math.PI / height) + 1) / 2;
  return rand < check ? 0 : 1;
}
