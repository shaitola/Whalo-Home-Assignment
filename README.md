# Whalo E2E Test Suite

E2E automated tests for Whalo's Fish of Fortune mobile game backend APIs, focusing on the Wheel Spin feature.

## Project Structure

```
├── src/
│   ├── helpers/
│   │   ├── config.helper.ts      # Configuration and environment setup
│   │   ├── login.helper.ts       # Login API helper functions
│   │   ├── wheel.helper.ts       # Wheel spin API helper + extractAllRewards
│   │   ├── balance.helper.ts     # Balance validation utilities
│   │   └── negative.helper.ts    # Error scenario helpers
│   ├── tests/
│   │   ├── wheel-spin-e2e.spec.ts    # Core E2E flow tests
│   │   ├── state-consistency.spec.ts # State persistence tests
│   │   ├── bonus-tests.spec.ts       # Bonus/advanced tests
│   │   ├── negative-tests.spec.ts    # Negative/error case tests
│   │   └── parallel-users.spec.ts    # Parallel users isolation tests
│   └── types/
│       └── api.types.ts          # TypeScript interfaces for API responses
├── postman/
│   ├── Whalo_WheelSpin_E2E.postman_collection.json
│   └── Whalo_E2E_Environment.postman_environment.json
├── playwright.config.ts
├── tsconfig.json
├── package.json
└── README.md
```

## Test Flow

### Core E2E Flow (Required)

```
1. Create User/Login
   └── Generate unique DeviceId + LoginSource
   └── Call POST /api/frontend/login/v4/login
   └── Extract AccessToken and initial UserBalance

2. Wheel Spin
   └── Call POST /api/frontend/wheel//v1 with AccessToken
   └── Validate response structure
   └── Extract coins earned and new balance

3. State Persistence Check (Relogin)
   └── Call POST /api/frontend/login/v4/login with same credentials
   └── Verify balance matches balance after spin
   └── Ensure no duplicate rewards or rollback occurred
```

### Key Invariants Validated

| Invariant | Description |
|-----------|-------------|
| Reward applied exactly once | Coins earned match the difference between initial and post-spin balance |
| State persists across sessions | Balance after relogin matches balance immediately after spin |
| No duplicate rewards | Balance difference from initial to relogin equals single spin reward |
| No rollback | Post-relogin balance is never less than post-spin balance |
| Energy deducted per spin | Energy decreases by exactly 1 per spin |
| Multi-spin until energy depleted | Tests ability to spin until energy reaches 0 |
| Wheel randomness verified | Tests hypothesis that wheel is NOT scripted |

## How to Run

### Prerequisites

- Node.js 18+
- npm 9+

### Setup

```bash
npm install
cp .env.example .env
```

### Playwright Tests

```bash
# Run all tests
npm test

# Run with visible browser
npm run test:headed

# Run with debug mode
npm run test:debug

# View HTML report
npm run test:report
```

### Postman Tests

```bash
# Run via Newman (CLI)
npm run postman

# Run with HTML report export
npm run postman:html
```

### Manual Postman Execution

1. Open Postman
2. Import `postman/Whalo_WheelSpin_E2E.postman_collection.json`
3. Import `postman/Whalo_E2E_Environment.postman_environment.json`
4. Select "Whalo E2E Environment"
5. Run the collection in sequence mode

### Postman Assertions (examples)

The collection includes test scripts with assertions like:
```javascript
pm.expect(jsonData.status).to.eql(0);
pm.expect(jsonData.response.SpinResult.Rewards.length).to.be.greaterThan(0);
// In relogin step — asserts returning user, not new account
pm.expect(jsonData.response.LoginResponse.AccountCreated).to.be.false;
```

## Assumptions & Design Decisions

### API Behavior Assumptions

| Assumption | Rationale |
|------------|-----------|
| Energy cost is exactly 1 per spin | Per specification in assignment |
| Coins reward type is `RewardResourceType=1` with `RewardDefinitionType=1` | As specified in API documentation |
| DeviceId is the primary user identifier | Used for login and state persistence |
| `status: 0` indicates success (even on HTTP 200) | API uses body status, not HTTP status for errors |
| Login response structure has `response.LoginResponse.AccessToken` | Confirmed via API testing |
| `AccountCreated` field indicates new vs returning user | Observed in API response |
| Energy regenerates during gameplay | Observed during long-running tests |
| Wheel is randomized (not scripted) | Tested hypothesis - same device produces different results |

### Multiple Reward Types

The wheel can return multiple reward types per spin:
- **Coins** (`RewardResourceType=1`) - Primary reward, tracked and asserted explicitly
- **Gems** (`RewardResourceType=2`) - Secondary currency, logged but not asserted
- **Boosters** (`RewardResourceType=3`) - Power-ups, logged but not asserted
- **Unknown** (`RewardResourceType=0`) - Observed in responses, logged for observation

**Note**: Other reward types can affect the coins balance. We validate the final balance after relogin rather than calculating expected balance from individual rewards to account for these side effects.

### Multi-Spin Until Energy Depleted

Per assignment requirements, tests include spinning until energy reaches 0:
- `bonus-tests.spec.ts` - "should spin until out of energy and validate final balance"
- Validates energy decreases to exactly 0
- Validates final balance persists correctly after relogin

### Wheel Scripted vs Random

Assignment hypothesis: "Each device-id will do the same flow till reached out of energy, you can check that the flows return the same wedges on the wheel"

**Finding**: Wheel is **NOT scripted (randomized)**. Same device produces different `SelectedIndex` values across sessions.

### Assignment Requirements Coverage

| Requirement | Coverage |
|-------------|----------|
| Login with DeviceId | ✅ Implemented |
| Wheel Spin validation | ✅ Implemented |
| State persistence after relogin | ✅ Implemented |
| No duplicate rewards | ✅ Implemented |
| No rollback | ✅ Implemented |
| Multi-spin until energy depleted | ✅ Implemented |
| Wheel scripted check | ✅ Tested (found: randomized) |
| Multiple reward types | ✅ Tracked (coins asserted, others logged) |

### Actual Findings (Verified via Testing)

| Finding | Evidence |
|---------|----------|
| Login response structure nests data under `response.LoginResponse` | API returns nested structure |
| New DeviceId does NOT create fresh user with 0 balance | New users receive initial coins balance (~80000) |
| Wheel is RANDOMIZED (not scripted) | Tested the scripted hypothesis - same device produces different spin results across sessions |
| State persists correctly after relogin | Balance matches between spin response and post-relogin |
| Wheel returns multiple reward types per spin | Observed coins, gems, and boosters in rewards array |
| Concurrent user state is fully isolated | 3 simultaneous spins showed no cross-user balance contamination |
| Server returns HTTP 200 with non-zero body status for errors | Adjusted test assertions to check body status, not just HTTP status |

### Test Design Decisions

| Decision | Rationale |
|----------|-----------|
| Generate unique DeviceId per test | Prevent test interdependency and flakiness |
| Store initial balance before spin | Enable precise validation of reward application |
| Test both immediate and post-relogin state | Verify both single-session and persistent state |
| Use sequential tests (workers=1) | API tests don't require parallelization; ensures clean state |
| Explicit parallel tests in parallel-users.spec.ts | Stress-test backend concurrency with simultaneous spins |
| Validate balance consistency rather than exact values | Account for potential login bonuses |
| Validate diffs instead of absolute values | Rewards are randomized, so we validate the delta |
| Add negative tests | Cover edge cases like invalid tokens |

## Response Validation Details

### Login Response Fields Validated

| Field | Expected | Assertion |
|-------|----------|-----------|
| `status` | 0 | Success indicator |
| `response.LoginResponse.AccessToken` | Non-empty string | Valid token received |
| `response.LoginResponse.AccountCreated` | Boolean | True for new users, false for returning |
| `response.LoginResponse.UserBalance.Coins` | Number >= 0 | Valid balance |
| `response.LoginResponse.UserBalance.Energy` | 0 <= Energy <= MaxCapacity | Within valid range |
| `response.LoginResponse.UserBalance.Gems` | Number >= 0 | Valid balance |
| `response.LoginResponse.UserBalance.MaxEnergyCapacity` | Number > 0 | Energy cap defined |
| `response.LoginResponse.UserBalance.EnergyExpirationTS` | Future timestamp | Expiration time set |
| `response.LoginResponse.UserBalance.LastUpdateTS` | Positive number | Last update recorded |
| `response.LoginResponse.ExternalPlayerId` | String | Player identifier |
| `response.LoginResponse.DisplayName` | String | User display name |

### Wheel Spin Response Fields Validated

| Field | Expected | Assertion |
|-------|----------|-----------|
| `status` | 0 | Success (note: HTTP 200 always, check body status) |
| `response.SelectedIndex` | Number | Valid wheel wedge index |
| `response.SpinResult.Rewards` | Non-empty array | At least one reward |
| `response.SpinResult.Rewards[].RewardDefinitionType` | Number | Reward category (1=reward) |
| `response.SpinResult.Rewards[].RewardResourceType` | Number | Resource type (1=coins, 2=gems, etc.) |
| `response.SpinResult.Rewards[].Amount` | Number | Reward quantity |
| `response.SpinResult.Rewards[].TrackingId` | Non-empty string | Unique reward identifier |
| `response.SpinResult.Rewards[].Multiplier` | Number | Reward multiplier |
| `response.SpinResult.UserBalance.Coins` | Number | Updated balance |
| `response.SpinResult.UserBalance.Energy` | Number | Decreased by 1 |
| `response.Metus_Rate`, `Metuzm_Zam` | Boolean | Bonus fields (observed) |

## CI/CD Integration

### GitHub Actions Example

```yaml
name: E2E Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npm test
      - uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/
```

## Troubleshooting

### Common Issues

**Connection refused errors**
- Check internet connectivity
- Verify API base URL is accessible

**Tests failing with "energy" errors**
- This is expected behavior when energy reaches 0
- Tests handle this gracefully

**Token expiration**
- Access tokens may expire between requests
- Tests that span multiple requests use fresh tokens via re-login

## License

ISC
