import { initializeImage, drawImage as drawImageInner, getAntiAliasedImagePartially, transitImagePartially } from "./common/images";

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
  switch (e.key) {
  case "d":
    toggleVisibilityOfFrView();
    break;
  }
}

function toggleVisibilityOfFrView() {
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
  const ctx = canvasCtx;
  if (!ctx) return;
  drawImageInner(ctx, currentHeight, currentWidth, colorData);
}

function getAntiAliasedImage(original: Float32Array, height: number, width: number): Float32Array {
  return getAntiAliasedImagePartially(original, new Float32Array(height * width), 0, height, height, width);
}

function transitImage(original: Float32Array, height: number, width: number, interval: number): Float32Array {
  return transitImagePartially(original, original, 0, height, height, width, Math.min(1, interval / 60));
}
