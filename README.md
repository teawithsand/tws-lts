# tws-lts

LTS and not-so-frequently changing port of `tws-stl`, which is part of [tws-libs](https://github.com/teawithsand/tws-libs)


## Docs
[Go to github pages for documentation](https://teawithsand.github.io/tws-lts)

### generateUuid

Quite boring, just generates uuid using WebCrypto API if available. Fallbacks to `Math.random`

### `throwExpression` and `throwExpressionLazy`

These are quite interesting, they let you do kotlin-style `?:`

```typescript
const mayFail = (): string | null => {
    if(Math.random() > .5) {
        return "OK"
    }

    return null
}

// This compiles! Notice string type instead of string | null 
const res: string = mayFail() ?? throwExpression(new Error("Oops, it failed!"))
```

