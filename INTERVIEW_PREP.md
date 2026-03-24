# Interview Preparation - Whalo QA Automation Assignment

## 📋 Assignment Overview

**Company**: Whalo  
**Role**: QA Automation Engineer  
**Project**: Fish of Fortune Mobile Game Backend API Testing

### What I Built
A complete E2E automated test suite for testing a mobile game's Wheel Spin feature with:
- 21 Playwright tests (TypeScript)
- Postman collection with 20 assertions
- Full state persistence validation
- Negative test cases
- Parallel user isolation testing

---

## 🏗️ Project Structure (Why)

```
├── src/
│   ├── helpers/
│   │   ├── config.helper.ts      # Centralized config + dotenv
│   │   ├── login.helper.ts     # Login API abstraction
│   │   ├── wheel.helper.ts      # Spin API + extractAllRewards()
│   │   ├── balance.helper.ts    # Balance validation functions
│   │   └── negative.helper.ts   # Error scenario helpers
│   ├── tests/
│   │   ├── wheel-spin-e2e.spec.ts    # CORE: Main E2E flow
│   │   ├── state-consistency.spec.ts # CORE: Persistence validation
│   │   ├── bonus-tests.spec.ts       # BONUS: Advanced scenarios
│   │   ├── negative-tests.spec.ts    # BONUS: Error handling
│   │   └── parallel-users.spec.ts    # BONUS: Concurrency
│   └── types/
│       └── api.types.ts          # TypeScript interfaces
├── postman/
│   ├── Whalo_WheelSpin_E2E.postman_collection.json  # Tests + assertions
│   └── Whalo_E2E_Environment.postman_environment.json  # Variables
├── playwright.config.ts
├── tsconfig.json
├── .env.example
└── README.md
```

### Why This Structure?
- **Helpers split by responsibility**: Login, Wheel, Balance, Errors - each is testable separately
- **Tests organized by type**: Core tests vs Bonus tests
- **Types centralized**: Single source of truth for API response shapes

---

## 🧪 Test Suite Summary

### Core Tests (Required)
| Test File | Tests | Purpose |
|-----------|-------|---------|
| `wheel-spin-e2e.spec.ts` | 4 | Main E2E flow: Login → Spin → Relogin → Validate |
| `state-consistency.spec.ts` | 5 | State persistence, no rollback, multi-session |

### Bonus Tests (Stand Out)
| Test File | Tests | Purpose |
|-----------|-------|---------|
| `bonus-tests.spec.ts` | 7 | Multi-spin, wheel behavior, response validation |
| `negative-tests.spec.ts` | 3 | Invalid token, malformed payload, no energy |
| `parallel-users.spec.ts` | 1 | Cross-user contamination |

### Total: 21 tests

---

## 🔑 Key Test Invariants (What I Validated)

### 1. Reward Applied Exactly Once
```typescript
balanceAfterSpin.Coins - initialBalance.Coins === coinsEarned
```
**Why**: Prevents duplicate rewards

### 2. State Persists After Relogin
```typescript
balanceAfterRelogin === balanceAfterSpin
```
**Why**: Backend must persist state correctly

### 3. No Rollback
```typescript
balanceAfterRelogin >= balanceAfterSpin
```
**Why**: Ensures rewards aren't revoked

### 4. Energy Cost Per Spin = 1
```typescript
energyAfterSpin === energyBeforeSpin - 1
```
**Why**: Per specification

---

## 📁 Postman Files Explained

### Why Two Files?

**1. Collection (`Whalo_WheelSpin_E2E.postman_collection.json`)**
- Contains 3 requests: Login, Spin, Relogin
- Includes test scripts with assertions
- Generates unique deviceId via pre-request script
- Stores variables between requests

**2. Environment (`Whalo_E2E_Environment...`)**
- Collection variables template
- Can override baseUrl per environment
- Not strictly required (collection has baseUrl built-in)

### Assertions in Postman
```javascript
pm.expect(jsonData.status).to.eql(0);
pm.expect(jsonData.response.LoginResponse.AccountCreated).to.be.false;
pm.expect(jsonData.response.SpinResult.Rewards.length).to.be.greaterThan(0);
```

---

## 🔍 Key API Findings (Verified via Testing)

| Finding | Evidence |
|---------|----------|
| Login response nests under `response.LoginResponse` | Actual API structure |
| `AccountCreated` field indicates new vs returning user | Boolean flag |
| Wheel is NOT deterministic | Different results across sessions |
| State persists correctly after relogin | Balances match |
| Energy regenerates | Observed during long tests |
| Login bonuses may add coins | Balance increases between logins |
| Multiple reward types possible | Coins, Gems, Boosters observed |

---

## 🎯 Design Decisions (Be Ready to Explain)

### 1. Why Validate Diffs Instead of Absolute Values?
> "Rewards are randomized. Instead of checking `Coins === 82500`, I check `Coins - initial === coinsEarned`. This is more resilient to system changes."

### 2. Why Generate Unique DeviceId Per Test?
> "Prevents test interdependency. Each test is isolated and can run independently or in parallel without affecting others."

### 3. Why Extract Reward Types Dynamically?
> "The assignment mentioned 'more rewards beside coins.' I created `extractAllRewards()` to handle coins, gems, and boosters, but validate only coins since that's the primary invariant."

### 4. Why Use Sequential Tests (workers=1)?
> "API tests for stateful systems don't benefit from parallelization. Sequential execution ensures clean state and predictable results."

### 5. Why Both Playwright AND Postman?
> "Playwright for robust TypeScript tests with full assertions. Postman for quick manual testing and sharing with non-technical stakeholders."

---

## ⚠️ Known System Behaviors

1. **Login bonuses**: New users get ~80000 initial coins
2. **Energy regeneration**: Energy can increase during long sessions
3. **Reward type 0**: Unknown reward type appears alongside actual rewards
4. **TrackingIds**: May not be unique across all spins

---

## 💡 What Makes This Stand Out

1. **Negative tests** - Most candidates only test happy paths
2. **Parallel users** - Tests cross-user isolation (rarely attempted)
3. **Detailed README** - Explains invariants, assumptions, findings
4. **Structured logging** - Console output shows test progress
5. **Proper error handling** - Helpers throw descriptive errors

---

## 🎤 Potential Interview Questions

### Q: How did you handle the randomized rewards?
**A**: I validated the delta (change) rather than absolute values. If initial=80000 and reward=2500, I verify final=82500 by checking `final - initial === 2500`. This works regardless of what the wheel lands on.

### Q: How do you know the backend persisted state correctly?
**A**: I perform relogin and compare balances. If `balanceAfterSpin === balanceAfterRelogin`, the state was persisted. I also verify no rollback by checking `balanceAfterRelogin >= balanceAfterSpin`.

### Q: Why did you add parallel user testing?
**A**: Real games have concurrent users. This validates the system isolates user state - User A's spin shouldn't affect User B's balance.

### Q: What would you add with more time?
**A**: Contract testing (schema validation), test data factory for cleaner setup, CI/CD pipeline with GitHub Actions.

### Q: How would you handle flaky tests?
**A**: Add retries for network issues, increase timeouts, implement circuit breaker pattern for API calls, and use test isolation to prevent state leakage.

### Q: Walk me through your test flow.
**A**: 
1. Login with unique deviceId → get token + initial balance
2. Spin wheel → validate response structure, extract coins earned
3. Verify balance increased by exact amount (not just > initial)
4. Relogin with same credentials → verify balance unchanged
5. Validate no duplicate rewards were applied

### Q: What edge cases did you test?
**A**: Invalid token, malformed payload, no energy, concurrent users, multiple spins, state persistence across sessions.

### Q: How do you validate the API response structure?
**A**: I created TypeScript interfaces matching the actual API response. Playwright's `expect().toHaveProperty()` validates field existence. I also check types (number, string, boolean) for critical fields.

---

## 📝 Commands Reference

```bash
npm install
cp .env.example .env

# Run tests
npm test              # Playwright
npm run postman      # Newman CLI
npm run postman:html  # HTML report

# Other
npm run lint         # Type check
npm run test:headed   # Browser visible
```

---

## 🔗 Links

- Repository: https://github.com/shaitola/Whalo-Home-Assignment
- Branches: main, final-polish (latest)

---

## ⏰ Time Spent

Approximate breakdown:
- Understanding assignment & API: 1 hour
- Project setup & helpers: 1.5 hours
- Core tests: 1 hour
- Bonus tests: 1.5 hours
- Refinement & reviews: 3 hours
- **Total: ~8 hours**
