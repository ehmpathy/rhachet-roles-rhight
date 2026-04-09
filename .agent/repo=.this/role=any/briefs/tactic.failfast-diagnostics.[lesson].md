# tactic: failfast diagnostics

## .what

tests must fail fast with clear proof when prerequisites are not met.

## .why

- "it didn't work" is not actionable
- clear logged proof pinpoints the defect
- no guesswork required

## .the pattern

### 1. credential guards at test suite level

```typescript
beforeAll(() => {
  if (!process.env.REQUIRED_API_KEY) {
    throw new Error(
      'REQUIRED_API_KEY required. run: rhx keyrack unlock --owner ehmpath --env test',
    );
  }
});
```

### 2. fixture validation before test

```typescript
then('it works', () => {
  // failfast: verify fixture is valid
  const pdfHeader = fs.readFileSync(testPdf, 'utf-8').slice(0, 10);
  if (!pdfHeader.startsWith('%PDF')) {
    throw new Error(
      `fixture PDF is invalid (not a PDF file). header: ${pdfHeader}. path: ${testPdf}`,
    );
  }

  // failfast: verify cache file extant
  if (!fs.existsSync(expectedCache)) {
    throw new Error(
      `fixture .md cache file not found at: ${expectedCache}`,
    );
  }

  // ... rest of test
});
```

### 3. proof on failure

```typescript
const result = runSkill([testPdf, '--into', 'markdown']);

// failfast: log proof of failure
if (result.exitCode !== 0) {
  console.log('PROOF: exitCode:', result.exitCode);
  console.log('PROOF: stdout:', result.stdout);
  console.log('PROOF: stderr:', result.stderr);
}

expect(result.exitCode).toBe(0);
```

## .key principles

| principle | implementation |
|-----------|----------------|
| fail loud | throw Error with message + context |
| log proof | console.log before assertion |
| be specific | include paths, values, headers |
| pinpoint defect | one check per guard |

## .examples of bad vs good

### bad: no diagnostics

```typescript
expect(result.exitCode).toBe(0);
// failure: "Expected: 0, Received: 1" — what broke?
```

### good: clear proof

```typescript
if (result.exitCode !== 0) {
  console.log('PROOF: exitCode:', result.exitCode);
  console.log('PROOF: stdout:', result.stdout);
  console.log('PROOF: stderr:', result.stderr);
}
expect(result.exitCode).toBe(0);
// failure: "PROOF: stdout: blocked: keyrack failed..." — now you know
```

## .enforcement

- test without credential guard = nitpick
- test without fixture validation = nitpick
- test without proof on failure = blocker
