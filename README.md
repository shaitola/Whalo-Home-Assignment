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

## How to Run

### Prerequisites

- Node.js 18+
- npm 9+

### Setup

```bash
npm install
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

## Assumptions & Design Decisions

### API Behavior Assumptions

| Assumption | Rationale |
|------------|-----------|
| Energy cost is exactly 1 per spin | Per specification in assignment |
| Coins reward type is `RewardResourceType=1` with `RewardDefinitionType=1` | As specified in API documentation |
| Existing DeviceId returns existing user state | As documented in login API |
| `status: 0` indicates success | Standard API response pattern |
| Login response structure has `response.LoginResponse.AccessToken` | Confirmed via API testing |
| `AccountCreated` field indicates new vs returning user | Observed in API response |

### Multiple Reward Types

The wheel can return multiple reward types:
- **Coins** (`RewardResourceType=1`) - Primary reward, tracked explicitly
- **Gems** (`RewardResourceType=2`) - Secondary currency, tracked but not asserted on
- **Boosters** (`RewardResourceType=3`) - Power-ups, tracked but not asserted on

**Design Decision**: We validate coin rewards explicitly because they are the primary test invariant. Other reward types are logged and tracked but not asserted on to keep tests focused on the core wheel spin behavior.

### Actual Findings (Verified via Testing)

| Finding | Evidence |
|---------|----------|
| Login response structure nests data under `response.LoginResponse` | API returns nested structure |
| New DeviceId does NOT create fresh user with 0 balance | New users receive initial coins balance (~80000) |
| Wheel is NOT deterministic | Same device produces different spin results across sessions |
| State persists correctly after relogin | Balance matches between spin response and post-relogin |
| Wheel returns multiple reward types per spin | Observed coins, gems, and boosters in rewards array |

### Test Design Decisions

| Decision | Rationale |
|----------|-----------|
| Generate unique DeviceId per test | Prevent test interdependency and flakiness |
| Store initial balance before spin | Enable precise validation of reward application |
| Test both immediate and post-relogin state | Verify both single-session and persistent state |
| Use sequential tests (workers=1) | API tests don't require parallelization; ensures clean state |
| Validate balance consistency rather than exact values | Account for potential login bonuses |
| Validate diffs instead of absolute values | Rewards are randomized, so we validate the delta |
| Add negative tests | Cover edge cases like invalid tokens |

## Response Validation Details

### Login Response Fields Validated

- `status` - Must be 0
- `response.LoginResponse.AccessToken` - Must be non-empty string
- `response.LoginResponse.AccountCreated` - Boolean indicating new user
- `response.LoginResponse.UserBalance.Coins` - Must be number >= 0
- `response.LoginResponse.UserBalance.Energy` - Must be 0 <= Energy <= MaxEnergyCapacity
- `response.LoginResponse.UserBalance.Gems` - Must be number >= 0
- `response.LoginResponse.UserBalance.EnergyExpirationTS` - Must be future timestamp
- `response.LoginResponse.UserBalance.LastUpdateTS` - Must be positive

### Wheel Spin Response Fields Validated

- `status` - Must be 0
- `response.SelectedIndex` - Must be valid number (wheel wedge)
- `response.SpinResult.Rewards` - Must be non-empty array
- `response.SpinResult.Rewards[].TrackingId` - Must be non-empty string
- `response.SpinResult.Rewards[].Amount` - Must be positive number for coins
- `response.SpinResult.UserBalance` - Must contain updated balance
- `response.Metus_Rate`, `Metuzm_Zam` - Boolean fields (bonus validation)

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
