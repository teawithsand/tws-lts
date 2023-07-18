export interface Queue<T> {
    readonly length: number
    readonly isEmpty: boolean

    clear(): void
    peek(): T | undefined
    append: (v: T) => void
    pop: () => T | undefined 
}

/**
 * Simple queue, which uses JS's holey arrays in order to provide user with queue.
 * 
 * It may be slow on large items count.
 */
export class DefaultQueue<T> implements Queue<T> {
	private inner: T[] = []

	get array(): T[] {
		return [...this.inner]
	}

	peek = (): T | undefined => {
		if (this.inner.length > 0) return this.inner[0]
		return undefined
	}

	get length() {
		return this.inner.length
	}

	get isEmpty() {
		return this.length === 0
	}

	clear = () => {
		this.inner = []
	}

	append = (v: T) => {
		this.inner.push(v)
	}

	/**
	 * @deprecated Use append instead as it's more queue-like function.
	 */
	push = (v: T) => {
		this.inner.push(v)
	}

	pop = (): T | undefined => {
		if (this.inner.length === 0) return undefined
		const v = this.inner[0]
		this.inner.splice(0, 1)
		return v
	}
}
