import prettyBytes from "pretty-bytes";
import type { CachedFile } from "../index.d.ts";

export class Cache {
    private store = new Map<string, CachedFile>();

    private readonly maxSize: number;
    private readonly maxNumber: number;
    private readonly ttl: number;
    private readonly name: string;

    private currentSize = 0;

    private cleanupTimer: ReturnType<typeof setInterval>;

    constructor(maxSize: number, maxNumber: number, ttl: number, name?: string) {
        this.maxSize = maxSize;
        this.maxNumber = maxNumber;
        this.ttl = ttl;
        this.name = name || "Cache";

        this.cleanupTimer = setInterval(() => {
            this.cleanup();
        }, 60 * 1000); // Every minute
    }

    set(key: string, value: CachedFile): void {
        this.currentSize += value.details.file.length;

        this.store.set(key, value);
    }

    get(key: string): CachedFile | null {
        const entry = this.store.get(key);

        if (!entry) {
            return null;
        }

        return entry;
    }

    delete(key: string): void {
        const entry = this.store.get(key);

        if (entry) {
            this.currentSize -= entry.details.file.length;
        }

        this.store.delete(key);
    }

    private cleanup(): void {
        const now = Date.now();

        for (const [key, entry] of this.store) {
            if (now >= entry.timestamp + this.ttl) {
                this.store.delete(key);
            }
        }

        while (this.currentSize > this.maxSize || this.store.size > this.maxNumber) {
            const oldestKey = this.getOldestKey();

            if (oldestKey === null) {
                console.warn(`${this.name} Warn: Cache cleanup - No oldest key found, but cache is over limit.`);
                break;
            }

            this.delete(oldestKey);
        }

        this.info();
    }

    private info(): void {
        console.info(`${this.name} Info: \n- Current Size: ${prettyBytes(this.currentSize, { binary: true })}\n- Current Number of Entries: ${this.store.size}\n- Max Size: ${prettyBytes(this.maxSize, { binary: true })}\n- Max Number of Entries: ${this.maxNumber}\n- TTL: ${Math.floor(this.ttl / 1000 / 60 / 60)} hours`);
    }

    private getOldestKey(): string | null {
        let oldestKey: string | null = null;
        let oldestTimestamp = Infinity;

        for (const [key, entry] of this.store) {
            if (entry.timestamp < oldestTimestamp) {
                oldestTimestamp = entry.timestamp;
                oldestKey = key;
            }
        }

        return oldestKey;
    }
}
