# Whalo E2E Test Suite

E2E automated tests for Whalo's Fish of Fortune mobile game backend APIs, focusing on the Wheel Spin feature.

## Project Structure

```
├── src/
│   ├── helpers/
│   │   ├── api.helper.ts        # Centralized HTTP client (NEW)
│   │   ├── config.helper.ts   # Configuration and environment setup
│   │   ├── login.helper.ts    # Login API helper functions
│   │   ├── wheel.helper.ts   # Wheel spin API helper + extractAllRewards
│   │   ├── balance.helper.ts# Balance validation utilities
│   │   ├── negative.helper.ts# Error scenario helpers
│   │   └── validation.helper.ts# Response validation
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

| Assumption | Rationale | Test Coverage |
|------------|-----------|---------------|
| Energy cost is exactly 1 per spin | Per specification in assignment | `bonus-tests.spec.ts:spin until out of energy` |
| Coins reward type is `RewardResourceType=1` with `RewardDefinitionType=1` | As specified in API documentation | `wheel.helper.ts:extractAllRewards` |
| **DeviceId is the primary key for user identity** | Used for login and state persistence; entire test isolation depends on this | All tests |
| **Energy may regenerate between sessions** | When energy reaches 0, it refills to max capacity; tests use ≤ not === for energy checks | `bonus-tests.spec.ts:spin until out of energy` |
| `status: 0` indicates success (even on HTTP 200) | API uses body status, not HTTP status for errors | `negative-tests.spec.ts` |
| Login response structure nests under `response.LoginResponse` | Confirmed via API testing | `login.helper.ts` |
| `AccountCreated` field indicates new vs returning user | Observed in API response | `bonus-tests.spec.ts:AccountCreated` |
| LoginSource format is `test_{phone}_{uniqueSuffix}` | Per specification; unique suffix prevents collisions across runs | `login.helper.ts` |
| Wheel is randomized (not scripted) | Tested hypothesis - same device produces different results | `bonus-tests.spec.ts:wheel scripted test` |

### Login Response Field Assumptions

> **Note:** Fields marked with ✅ are validated if present in the response. Fields marked with ⭐ are core/required fields always present in the API response.

| Field | Expected Type | Status | Notes |
|-------|--------------|--------|-------|
| `status` | number (0) | ⭐ | Success indicator (required) |
| `response.LoginStatus` | number (0 or 1) | ✅* | Secondary status check (can be 1) |
| `response.LoginResponse.AccessToken` | string (non-empty) | ⭐ | Required for subsequent API calls |
| `response.LoginResponse.AccountCreated` | boolean | ⭐ | True for new users, false for returning |
| `response.LoginResponse.ExternalPlayerId` | string | ✅* | Player identifier |
| `response.LoginResponse.DisplayName` | string | ✅* | User display name |
| `response.LoginResponse.Avatar` | number | ✅* | Avatar selection index |
| `response.LoginResponse.FacebookId` | string | ✅* | Facebook integration ID |
| `response.LoginResponse.ImageFacebookId` | string | ✅* | Facebook image URL identifier |
| `response.LoginResponse.CoinsAmount` | number (>= 0) | ✅* | Coin balance (legacy field) |
| `response.LoginResponse.GemsAmount` | number (>= 0) | ✅* | Gem balance (legacy field) |
| `response.LoginResponse.EnergyAmount` | number (>= 0) | ✅* | Energy level (legacy field) |
| `response.LoginResponse.UserBalance.Coins` | number (>= 0) | ⭐ | Current coin balance |
| `response.LoginResponse.UserBalance.Gems` | number (>= 0) | ⭐ | Current gem balance |
| `response.LoginResponse.UserBalance.Energy` | number (0 to MaxCapacity) | ⭐ | Current energy level |
| `response.LoginResponse.UserBalance.MaxEnergyCapacity` | number (> 0) | ⭐ | Maximum energy cap |
| `response.LoginResponse.UserBalance.EnergyExpirationTS` | number (future timestamp) | ⭐ | When energy will be fully restored |
| `response.LoginResponse.UserBalance.EnergyExpirationSeconds` | number | ⭐ | Seconds until energy cap |
| `response.LoginResponse.UserBalance.LastUpdateTS` | number (> 0) | ⭐ | Last balance update time |
| `response.LoginResponse.UserBalance.ShieldsAmount` | number (>= 0) | ⭐ | Number of shields |
| `response.LoginResponse.UserBalance.Shields` | array | ⭐ | Shield details array |
| `response.LoginResponse.Level` | object (complex) | ✅ | Player level info (not a number!) |
| `response.LoginResponse.Cards` | array | ✅ | Level card rewards |
| `response.LoginResponse.Wheel` | object | ✅ | Wheel configuration |
| `response.LoginResponse.Session` | object | ✅ | Session information |
| `response.LoginResponse.ShortId` | object | ✅ | Short link info |
| `response.LoginResponse.RefreshToken` | string | ✅ | Refresh token |
| `response.LoginResponse.RefreshTokenUsedForLogin` | boolean | ✅ | Token usage flag |

### Wheel Spin Response Field Assumptions

> **Note:** Fields marked with ✅ are validated if present in the response. Fields marked with ⭐ are core/required fields always present in the API response.

| Field | Expected Type | Status | Notes |
|-------|--------------|--------|-------|
| `status` | number (0) | ⭐ | Success indicator (required) |
| `response.SelectedIndex` | number (>= 0) | ⭐ | Wheel wedge index |
| `response.SpinResult.Rewards` | array (non-empty) | ⭐ | List of rewards |
| `response.SpinResult.Rewards[].RewardDefinitionType` | number | ⭐ | 1=reward, 2=promotion, 3=event |
| `response.SpinResult.Rewards[].RewardResourceType` | number | ⭐ | 1=coins, 2=gems, 3=boosters, 0=unknown |
| `response.SpinResult.Rewards[].Amount` | number | ⭐ | Reward quantity |
| `response.SpinResult.Rewards[].TrackingId` | string (non-empty) | ⭐ | Unique reward identifier |
| `response.SpinResult.Rewards[].Multiplier` | number | ⭐ | Applied multiplier |
| `response.SpinResult.UserBalance.Coins` | number | ⭐ | Updated coin balance |
| `response.SpinResult.UserBalance.Energy` | number | ⭐ | Decreased by 1 |
| `response.SpinResult.UserBalance.Gems` | number | ⭐ | Updated gem balance |
| `response.SpinResult.UserBalance.ShieldsAmount` | number | ⭐ | Updated shield count |
| `response.SpinResult.UserBalance.Shields` | array | ⭐ | Shield details |
| `response.Metus_Rate` | boolean | ⭐ | Rating prompt flag |
| `response.Metuzm_Zam` | boolean | ⭐ | Feature flag |
| `response.Metuzm_Zam_Data` | string | ⭐ | Feature flag data |
| `response.Metuzm_Zam_Data_Hadash` | string | ⭐ | Feature flag data (new) |
| `response.SpinResult.PointCollectingSummary.tournaments` | array | ✅ | Tournament points (only field returned) |

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
- Validates all TrackingIds are unique

### Wheel Scripted vs Random

Assignment hypothesis: "Each device-id will do the same flow till reached out of energy, you can check that the flows return the same wedges on the wheel"

**Finding**: Wheel is **NOT scripted (randomized)**. Same device spun until energy depleted produces different `SelectedIndex` sequences in different sessions.

**Test**: `bonus-tests.spec.ts` - "should verify wheel is NOT scripted by spinning same device until out of energy, twice"
- First session: Spins until energy = 0, records all SelectedIndex values
- Relogin with same device
- Second session: Spins until energy = 0, records all SelectedIndex values
- Compares sequences: If identical, wheel is scripted; if different, wheel is randomized

### Assignment Requirements Coverage

| Requirement | Coverage | Test |
|-------------|----------|------|
| Login with DeviceId | ✅ | `wheel-spin-e2e.spec.ts` |
| Wheel Spin validation | ✅ | All test files |
| State persistence after relogin | ✅ | `state-consistency.spec.ts` |
| No duplicate rewards | ✅ | `state-consistency.spec.ts` |
| No rollback | ✅ | `state-consistency.spec.ts` |
| Multi-spin until energy depleted | ✅ | `bonus-tests.spec.ts` |
| Wheel scripted check | ✅ | `bonus-tests.spec.ts:wheel scripted test` |
| Multiple reward types | ✅ | `bonus-tests.spec.ts:multiple reward types` |
| Comprehensive login response validation | ✅ | `bonus-tests.spec.ts:validate complete login response` |
| Comprehensive spin response validation | ✅ | `bonus-tests.spec.ts:validate complete spin response` |
| Login response field validation helper | ✅ | `validation.helper.ts:validateLoginResponse` |
| Spin response field validation helper | ✅ | `validation.helper.ts:validateSpinResponse` |
| 24+ field validation on login | ✅ | `validation.helper.ts` |
| 19+ field validation on spin | ✅ | `validation.helper.ts` |

### Actual Findings (Verified via Testing)

| Finding | Evidence | Implication |
|---------|----------|-------------|
| Login response structure nests under `response.LoginResponse` | API returns nested structure | Adjust response parsing |
| New DeviceId does NOT create fresh user with 0 balance | New users receive initial coins (~80000) | Adjust balance expectations |
| Wheel is RANDOMIZED (not scripted) | Same device produces different spin results across sessions | Cannot predict outcomes |
| State persists correctly after relogin | Balance matches between spin response and post-relogin | Backend state management works |
| Wheel returns multiple reward types per spin | Observed coins, gems, and boosters | Track all reward types |
| Concurrent user state is fully isolated | 3 simultaneous spins showed no cross-user contamination | Backend concurrency is safe |
| Server returns HTTP 200 with non-zero body status for errors | Adjusted test assertions to check body status, not HTTP status | Check body status, not HTTP status |
| TrackingIds are unique per reward | All tracking IDs are unique | No duplicate reward processing |
| Energy regenerates when it reaches 0 | Spinning to 0 energy refills energy to max capacity | Energy regeneration occurs mid-session |
| `LoginStatus` can be 1 (not just 0) | Observed LoginStatus=1 in responses | LoginStatus is not always 0 for success |
| Wheel returns unknown reward type (0) | Observed type 0 in rewards array | Some rewards have unclassified type |
| Level field may be invalid | Warnings about Level being invalid | Level validation has edge cases |

### Additional Test Coverage

| Test | Description | Finding |
|------|-------------|---------|
| `validateLoginResponse` helper | Comprehensive 24+ field validation | Validates entire login response structure |
| `validateSpinResponse` helper | Comprehensive spin response validation | Validates rewards, balance, metadata |
| Wheel scripted test | Same device spins in two sessions | Confirms wheel is NOT deterministic |
| Energy regeneration test | Spins until energy depleted | Energy refills to max when hitting 0 |

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
| Comprehensive response validation | `validation.helper.ts` provides detailed field checking |

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
