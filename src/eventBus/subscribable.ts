/**
 * Function, which is used toreceive stat
 */
export type Subscriber<S> = (state: S, canceler: SubscriptionCanceler) => void

/**
 * Callback you can call in order to stop receiving evnets.
 */
export type SubscriptionCanceler = () => void

/**
 * Something, which you can subscribe to.
 * 
 * It also holds last event sent.
 */
export interface StickySubscribable<T> extends Subscribable<T> {
	readonly lastEvent: T
}

/**
 * Something, which you can subscribe to.
 */
export interface Subscribable<T> {
	addSubscriber(subscriber: Subscriber<T>): SubscriptionCanceler
}

/**
 * Something, which can emit events.
 */
export interface Emitter<T> {
	emitEvent(e: T): void
}