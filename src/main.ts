export {};

document.addEventListener("DOMContentLoaded", onSizeUpdated);
window.addEventListener('resize', onSizeUpdated);
window.addEventListener('click', onClick);

let currentHeight = 0;
let currentWidth = 0;
let canvasCtx: CanvasRenderingContext2D | null = null;
let currentImage = new Float32Array(0);
let animateProcessId = 0;
let oldStamp = 0;

function onSizeUpdated(_: Event) {
  updateSize();
  drawImage(getAntiAliasedImage(currentImage, currentHeight, currentWidth));
}

function onClick(_: Event) {
  if (animateProcessId !== 0) {
    console.log("Stop animation");
    window.cancelAnimationFrame(animateProcessId);
    animateProcessId = 0;
  } else {
    console.log("Start animation");
    animateProcessId = window.requestAnimationFrame(animate);
  }
}

function updateSize() {
  currentHeight = window.innerHeight;
  currentWidth = window.innerWidth;
  const canvas = document.getElementById("main") as HTMLCanvasElement;
  canvas.height = currentHeight;
  canvas.width = currentWidth;
  canvasCtx = canvas.getContext("2d", { alpha: false });
  currentImage = initializeImage(currentHeight, currentWidth);
}

function animate(stamp: DOMHighResTimeStamp) {
  const interval = stamp - oldStamp;
  oldStamp = stamp;
  const image = currentImage = transitImage(currentImage, currentHeight, currentWidth, interval);
  drawImage(getAntiAliasedImage(image, currentHeight, currentWidth));
  animateProcessId = window.requestAnimationFrame(animate);
}

function drawImage(colorData: Float32Array) {
  const height = currentHeight;
  const width = currentWidth;
  const ctx = canvasCtx;
  if (!ctx) return;
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

function initializeImage(height: number, width: number): Float32Array {
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

function getAntiAliasedImage(original: Float32Array, height: number, width: number): Float32Array {
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

function transitImage(original: Float32Array, height: number, width: number, interval: number): Float32Array {
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
