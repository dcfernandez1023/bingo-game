"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const async_mutex_1 = require("async-mutex");
class ReadWriteLock {
    constructor() {
        this.mutex = new async_mutex_1.Mutex();
        this.readers = 0;
    }
    acquireReadLock() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.mutex.acquire();
            this.readers++;
            if (this.readers === 1) {
                // First reader acquires the write lock to block writers
                this.mutex.release();
            }
        });
    }
    releaseReadLock() {
        this.readers--;
        if (this.readers === 0) {
            // Last reader releases the write lock
            this.mutex.release();
        }
    }
    acquireWriteLock() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.mutex.acquire();
        });
    }
    releaseWriteLock() {
        this.mutex.release();
    }
}
exports.default = ReadWriteLock;
