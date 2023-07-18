import { latePromise, throwExpression } from "../lang"
import { DefaultQueue, Queue } from "./queue"

export class AsyncQueueClosedError extends Error {
    constructor(message: string) {
        super(message)
        this.name = "AsyncQueueClosedError"
    }
}

/**
 * Queue, which can be used like queue, but also can be polled asynchronously.
 * 
 * Async poling makes receiver/poller wait for somebody to push that element(using append).
 * 
 * It can be closed, effectively flushing the queue.
 * This causes all subscribers to receive an error rather than an element.
 */
export class AsyncQueue<T> implements Queue<T> {
    private readonly awaitersQueue = new DefaultQueue<{
        resolve: (value: T) => void
        reject: (e: any) => void
    }>()
    private readonly resultQueue = new DefaultQueue<T>()
    private closeError: Error = new AsyncQueueClosedError(
        "Async Queue was closed before value to receive was emitted"
    )

    private isClosed = false

    get isEmpty(): boolean {
        return this.resultQueue.isEmpty
    }

    get resultQueueLength(): number {
        return this.resultQueue.length
    }
    get awaiterQueueLength(): number {
        return this.awaitersQueue.length
    }

    /**
     * Returns how many elements are in queue, rather than how many awaiters are there.
     */
    get length() {
        return this.resultQueueLength
    }

    /**
     * Negative, when more people are waiting than there is messages.
     * Positive if there are messages waiting to be received.
     * Zero if empty and nobody's waiting.
     * 
     * @deprecated previously it was called length, but now this queue implements Queue interface.
     */
    get oldLength(): number {
        return this.resultQueue.length - this.awaiterQueueLength
    }

    append = (value: T) => {
        if (this.isClosed) throw new Error("AsyncQueue was closed")

        const resolver = this.awaitersQueue.pop()
        if (resolver) {
            resolver.resolve(value)
        } else {
            this.resultQueue.append(value)
        }
    }

    /**
     * Drops all not-yet received values from queue.
     */
    clear = () => {
        this.resultQueue.clear()
    }

    /**
     * @deprecated Used only for compatibility with Queue. Use append instead.
     */
    push = (value: T) => this.append(value)

    pop = (): T | undefined => this.resultQueue.pop()
    peek = (): T | undefined => this.resultQueue.peek()

    popAsync = async () => {
        if (this.isClosed) throw this.closeError

        if (this.resultQueue.length) {
            return this.resultQueue.pop()
        }

        const [p, resolve, reject] = latePromise<T>()
        this.awaitersQueue.append({ resolve, reject })
        return p
    }

    close = (error?: Error) => {
        if (this.isClosed) return
        this.closeError = error ?? this.closeError

        this.resultQueue.clear()

        this.isClosed = true
        while (!this.awaitersQueue.isEmpty) {
            const { reject } =
                this.awaitersQueue.pop() ??
                throwExpression(new Error("unreachable code"))

            reject(this.closeError)
        }
    }
}
