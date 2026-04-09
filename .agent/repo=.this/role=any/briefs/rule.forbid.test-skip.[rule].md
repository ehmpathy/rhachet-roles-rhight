# rule.forbid.test-skip

## .what

tests must NEVER be skipped. they must failfast if dependencies are absent.

## .why

- skipped tests are invisible failures
- skipped tests accumulate as tech debt
- skipped tests mask real defects
- "it passed because it didn't run" is not a pass

## .the rule

| scenario | correct action |
|----------|----------------|
| credentials absent | throw Error with instructions |
| fixture invalid | throw Error with proof |
| dependency unavailable | throw Error with fix steps |
| test flaky | fix the test, not skip it |

## .forbidden patterns

```typescript
// FORBIDDEN: given.skip, it.skip, describe.skip
given.skip('[case1] some test', () => { ... });

// FORBIDDEN: given.runIf to skip tests
given.runIf(hasCredentials, '[case1] some test', () => { ... });

// FORBIDDEN: early return without error
if (!fs.existsSync(cacheDir)) {
  return; // silent skip = forbidden
}
```

## .required patterns

```typescript
// REQUIRED: failfast with clear error
beforeAll(() => {
  if (!process.env.REQUIRED_API_KEY) {
    throw new Error(
      'REQUIRED_API_KEY required. run: rhx keyrack unlock --owner ehmpath --env test',
    );
  }
});

// REQUIRED: throw on invalid fixture
if (!fs.existsSync(cacheDir)) {
  throw new Error(`fixture not found at: ${cacheDir}`);
}
```

## .exception: human-authorized skip

tests may ONLY be skipped if:
1. a human explicitly authorizes the skip
2. the skip reason is documented in code
3. there is a clear path to unskip

```typescript
// only if human authorized with documented reason
given.skip('[case9] SKIP: takes 10min, run manually for full coverage', () => {
  // human authorized skip: too slow for CI
  // to run: SLOW_TESTS=true npm run test:integration
});
```

## .enforcement

- test skip without human authorization = blocker
- given.runIf for credential check = blocker
- silent return on absent dependency = blocker
