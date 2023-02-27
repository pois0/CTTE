import { getAntiAliasedImage, initializeImage, transitImage } from "./images";

export {};

document.addEventListener("DOMContentLoaded", onSizeUpdated);
window.addEventListener('resize', onSizeUpdated);
window.addEventListener('click', onClick);
window.addEventListener('keydown', onKeyDown)

const frView = document.getElementById("fr-view") as HTMLDivElement;

let currentHeight = 0;
let currentWidth = 0;
let canvasCtx: CanvasRenderingContext2D | null = null;
let currentImage = new Float32Array(0);
let animateProcessId = 0;
let oldStamp = 0;
let frames = 0;
let lastFpsCalc = Date.now();
let frProcessId = 0;

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

function onKeyDown(e: KeyboardEvent) {
  if (e.key == "d") {
    if (frProcessId != 0) {
      frView.setAttribute("style", "display: none;");
      clearInterval(frProcessId);
      frProcessId = 0;
    } else {
      frView.setAttribute("style", "");
      frView.innerText = "0 fps";
      frames = 0;
      lastFpsCalc = Date.now();
      frProcessId = setInterval(calcFrameRate, 1000);
    }
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
  frames++;
}

function calcFrameRate() {
  const now = Date.now();
  const interval = now - lastFpsCalc;
  const fr = Math.ceil(frames * 1000 / interval);
  frView.innerText = `${fr} fps`;
  frames = 0;
  lastFpsCalc = now;
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

