import { initializeImage, drawImage as drawImageInner } from "./common/images";
import { ThreadPool } from "./common/thread-pool";
import { Request, requestAntialiasing, requestTransition } from "./common/protocol";
import ImageWorker from "./worker/worker.ts?worker";

export {};

document.addEventListener("DOMContentLoaded", onSizeUpdated);
window.addEventListener('resize', onSizeUpdated);
window.addEventListener('click', onClick);
window.addEventListener('keydown', onKeyDown)

const frView = document.getElementById("fr-view") as HTMLDivElement;
const tpool = createThreadPool();

let currentHeight = 0;
let currentWidth = 0;
let canvasCtx: CanvasRenderingContext2D | null = null;
let currentImage = new SharedArrayBuffer(0);
let aliasedImage = new SharedArrayBuffer(0);
let animateProcessId = 0;
let oldStamp = 0;
let frames = 0;
let lastFpsCalc = Date.now();
let frProcessId = 0;

function createThreadPool(): ThreadPool<Request, number> {
  const nworker = navigator.hardwareConcurrency;
  const workers = new Array(nworker);
  for (let i = 0; i < nworker; i++) {
    workers[i] = new ImageWorker();
  }
  return new ThreadPool(workers);
}

async function onSizeUpdated(_: Event) {
  updateSize();
  drawImage(await getAntiAliasedImage(currentImage, currentHeight, currentWidth));
}

function onClick(_?: Event) {
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
  case " ":
    onClick();
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
  aliasedImage = new SharedArrayBuffer(currentHeight * currentWidth * 4);
}

async function animate(stamp: DOMHighResTimeStamp) {
  const interval = stamp - oldStamp;
  oldStamp = stamp;
  const image = currentImage = await transitImage(currentImage, currentHeight, currentWidth, interval);
  drawImage(await getAntiAliasedImage(image, currentHeight, currentWidth));
  if (animateProcessId != 0) {
    animateProcessId = window.requestAnimationFrame(animate);
  }
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

async function getAntiAliasedImage(original: SharedArrayBuffer, height: number, width: number): Promise<Float32Array> {
  const aliased = aliasedImage;
  const threads = getConcurrentIndex();
  const promiseArr = new Array(threads);
  for (let i = 0; i < threads; i++) {
     const offset = Math.floor(height * i / threads);
     const len = Math.floor(height * (i + 1) / threads);
     promiseArr[i] = tpool.enqueue(requestAntialiasing(original, aliased, offset, len, height, width));
  }
  await Promise.all(promiseArr);
  return new Float32Array(aliased);
}

async function transitImage(original: SharedArrayBuffer, height: number, width: number, interval: number): Promise<SharedArrayBuffer> {
  const threads = getConcurrentIndex();
  const magic = Math.min(0.75, interval / 60);
  const promiseArr = new Array(threads);
  for (let i = 0; i < threads; i++) {
     const offset = Math.floor(height * i / threads);
     const len = Math.floor(height * (i + 1) / threads);
     promiseArr[i] = tpool.enqueue(requestTransition(original, original, offset, len, height, width, magic));
  }
  await Promise.all(promiseArr);
  return original;
}

function getConcurrentIndex(): number {
  return 2;
  // return Math.min(tpool.getWorkerSize(), 6);
}
