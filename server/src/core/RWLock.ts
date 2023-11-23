import { Mutex } from "async-mutex";

export default class ReadWriteLock {
  mutex: Mutex;
  readers: number;

  constructor() {
    this.mutex = new Mutex();
    this.readers = 0;
  }

  async acquireReadLock() {
    await this.mutex.acquire();
    this.readers++;
    if (this.readers === 1) {
      // First reader acquires the write lock to block writers
      this.mutex.release();
    }
  }

  releaseReadLock() {
    this.readers--;
    if (this.readers === 0) {
      // Last reader releases the write lock
      this.mutex.release();
    }
  }

  async acquireWriteLock() {
    await this.mutex.acquire();
  }

  releaseWriteLock() {
    this.mutex.release();
  }
}
