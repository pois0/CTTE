type Resolver<T> = (a0: T | PromiseLike<T>) => void;

export class ThreadPool<Request, Response> {
  private workers: Readonly<Worker[]>;
  private workerQueue: Queue<WorkerHolder<Response>>;
  private messageQueue: Queue<[Request, Transferable[], Resolver<Response>]>;

  constructor(numberOfThreads: number, scriptUrl: string | URL) {
    const workers = this.workers = new Array(numberOfThreads);
    const workerQueue = this.workerQueue = new Queue(numberOfThreads);
    for (let i = 0; i < numberOfThreads; i++) {
      const worker = workers[i] = new Worker(scriptUrl);
      const holder = new WorkerHolder<Response>(worker);
      worker.onmessage = (e: MessageEvent<ResponseWrapper<Response>>) => {
        const resolve = holder.getResolver();
        if (resolve == null) {
          throw "Illegal state error";
        }
        resolve(e.data.getMessage());
        this.recycleWorker(holder);
      };
      workerQueue.push(holder);
    }
    this.messageQueue = new Queue();
  }

  async enqueue(message: Request, transfer: Transferable[]): Promise<Response> {
    const holder = this.workerQueue.pop();
    if (holder != null) {
      return new Promise((resolve: Resolver<Response>) => {
        this.startJob(holder, message, transfer, resolve);
      });
    } else {
      return new Promise((resolve) => {
        this.messageQueue.push([message, transfer, resolve]);
      });
    }
  }

  terminate() {
    this.workers.forEach((w) => w.terminate());
  }

  private recycleWorker(holder: WorkerHolder<Response>) {
    const e = this.messageQueue.pop();
    if (e == null) {
      this.workerQueue.push(holder);
    } else {
      const [message, transfer, resolve] = e;
      this.startJob(holder, message, transfer, resolve);
    }
  }

  private startJob(holder: WorkerHolder<Response>, message: Request, transfer: Transferable[], resolve: Resolver<Response>) {
    holder.setResolver(resolve);
    holder.getWorker().postMessage(message, transfer);
  }
}

export function respond<T>(this: Window, message: T) {
  this.postMessage(new ResponseWrapper(message));
}

export type SetupWorkerHandler<Request, Response> = (req: Request) => Response;

export function setupWorker<Request, Response>(
  this: Window & DedicatedWorkerGlobalScope, 
  handler: SetupWorkerHandler<Request, Response>
) {
  this.onmessage = (e) => {
    this.postMessage(new ResponseWrapper(handler(e.data as Request)));
  };
}

class ResponseWrapper<T> {
  private message: T

  constructor(message: T) {
    this.message = message;
  }

  getMessage(): T {
    return this.message;
  }
}

class WorkerHolder<T> {
  private worker: Worker;
  private resolver: Resolver<T> | null;

  constructor(worker: Worker) {
    this.worker = worker;
    this.resolver = null;
  }

  setResolver(callback: Resolver<T>) {
    this.resolver = callback;
  }

  getResolver(): Resolver<T> | null {
    return this.resolver;
  }

  getWorker(): Worker {
    return this.worker;
  }
}

class Queue<T> {
  private raw: T[];
  private head: number;
  private tail: number;
  private size: number;
  private capacity: number;

  constructor(initialCapacity: number = 16) {
    this.raw = new Array(initialCapacity);
    this.head = 0;
    this.tail = 0;
    this.size = 0;
    this.capacity = initialCapacity;
  }

  push(e: T) {
    let cap = this.capacity;
    const size = this.size;
    if (cap === size) cap = this.extendRaw(cap);
    let head = this.head;
    this.raw[head++] = e;
    this.size = size + 1;
    this.head = head === cap ? 0 : head;
  }

  pop(): T | null {
    const size = this.size;
    if (size === 0) return null;
    this.size = size - 1;
    let tail = this.tail;
    const result = this.raw[tail++];
    this.tail = tail === this.capacity ? 0 : tail;
    return result;
  }

  length(): number {
    return this.size;
  }

  isEmpty(): boolean {
    return this.size == 0;
  }

  private extendRaw(oldCap: number): number {
    const newCap = oldCap * 2;
    const oldRaw = this.raw;
    const newRaw = this.raw = new Array(newCap);
    const tail = this.tail;
    let to = 0;
    for (let from = tail; from < oldCap; from++) {
      newRaw[to++] = oldRaw[from];
    }
    for (let from = 0; from < tail; from++) {
      newRaw[to++] = oldRaw[from];
    }
    return newCap;
  }
}
