/**
 * Standardized comparator, which makes sorting stuff of type T via `Array.prototype.sort` easy and generic.
 */
export type Comparator<T> = (a: T, b: T) => number

/**
 * Easy ordering enum for more clear comparator stuff.
 */
export enum Ordering {
    LESS = -1,
    EQUAL = 0,
    GREATER = 1,
}

/**
 * Takes number and makes it into ordering. 
 * 
 * Returns LESS when a < 0
 * Returns GREATER when a > 0
 * Returns EQUAL when a === 0
 * 
 * Otherwise throws.
 */
export const normalizeOrdering = (a: number): Ordering => {
    if (a < 0) return Ordering.LESS
    if (a > 0) return Ordering.GREATER
    if (a === 0) return Ordering.EQUAL

    throw new Error(`Given ordering value can't be normalized: ${a}`)
}

/**
 * Returns sorted copy of given array.
 */
export const sorted = <T>(arr: T[], cmp?: Comparator<T>): T[] => {
    const cpy = [...arr]
    cpy.sort(cmp)
    return cpy
}

/**
 * Transforms gt ordering into lt ordering. Preserves eq ordering.
 */
export const inverseOrdering = (r: Ordering | number): Ordering => -normalizeOrdering(r)

/**
 * Chains multiple orderings into single ordering. Returns first non-equal ordering from the beginning.
 */
export const chainOrderings = (...r: Ordering[]): Ordering => {
    for (const e of r) {
        if (e !== 0) return e
    }

    return Ordering.EQUAL
}

/**
 * Chains multiple comparators into single one, just like `chainOrderings` would do it.
 * 
 * Returns result of first non-zero comparator from the left.
 */
export const chainComparators = <T>(...r: Comparator<T>[]): Comparator<T> => {
    return (a: T, b: T) => {
        for (const c of r) {
            const res = c(a, b)
            if (res !== 0) return res
        }

        return Ordering.EQUAL
    }
}

export const inverseComparator =
    <T>(c: Comparator<T>): Comparator<T> =>
        (a, b) =>
            inverseOrdering(c(a, b))

export const compareBigInt = (a: bigint, b: bigint) => {
    const v = a - b
    if (v == BigInt(0)) return 0
    else if (v > BigInt(0)) return 1
    else return -1
}

/**
 * Generic default comparator for strings.
 */
export const compareStrings: Comparator<string> = (a: string, b: string) => normalizeOrdering(a.localeCompare(b))

/**
 * Generic comparator for numbers.
 */
export const compareNumbers: Comparator<number | bigint> = (a, b) => {
    if (typeof a !== typeof b) {
        // one is bigint, so cast both to bigint

        // TODO(teaiwthsand): proper fraction(non-int) handling
        a = BigInt(a)
        b = BigInt(b)
    }
    const r: number | bigint = (a as any) - (b as any)
    if (r > 0) return Ordering.GREATER
    if (r < 0) return Ordering.LESS
    return Ordering.EQUAL
}

/**
 * Comparator, which compares strings in natural order.
 */
export const compareStringsNatural: Comparator<string> = (
    a: string,
    b: string
) =>
    a.localeCompare(b, undefined, {
        numeric: true,
        sensitivity: "base",
    })
