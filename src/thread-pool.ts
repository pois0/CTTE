export class ThreadPool {
  threads: Readonly<Array<Worker>>;
  jobQueue: Queue<Job>;

  constructor(numberOfThreads: number, scriptUrl: string | URL) {
    const threads = new Array(numberOfThreads);
    for (let i = 0; i < numberOfThreads; i++) {
      threads[i] = new Worker(scriptUrl);
    }
    this.threads = threads;
  }


}

class Queue<T = any> {
  raw: T[];
  head: number;
  tail: number;
  size: number;
  capacity: number;

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
