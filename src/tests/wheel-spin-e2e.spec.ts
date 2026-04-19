import { test, expect } from '@playwright/test';
import { login } from '../helpers/login.helper';
import { spinWheel } from '../helpers/wheel.helper';
import { validateSpinResponse } from '../helpers/validation.helper';
import { 
  validateRewardAppliedOnce,
  validateNoRollback,
  formatBalance 
} from '../helpers/balance.helper';
import { config } from '../helpers/config.helper';

test.describe('Wheel Spin E2E Flow', () => {
  test('should complete wheel spin flow with state persistence', async () => {
    const loginResult = await login();
    const deviceId = loginResult.deviceId;
    const loginSource = loginResult.loginSource;
    const initialBalance = loginResult.userBalance;

    console.log('Initial balance:', formatBalance(initialBalance));

    const spinResult = await spinWheel(loginResult.accessToken);
    
    const validation = validateSpinResponse(spinResult.response, initialBalance.Energy - 1);
    expect(validation.isValid, `Spin validation failed: ${validation.errors.join(', ')}`).toBe(true);

    const balanceAfterSpin = spinResult.response.response.SpinResult.UserBalance;
    console.log('Balance after spin:', formatBalance(balanceAfterSpin));

    const expectedCoinsDiff = spinResult.outcome.coinsEarned;
    const expectedEnergyDiff = -config.test.energyCostPerSpin;

    validateRewardAppliedOnce(
      initialBalance,
      balanceAfterSpin,
      expectedCoinsDiff,
      expectedEnergyDiff
    );

    console.log('Re-logging in to verify state persistence...');
    const reloginResult = await login(deviceId, loginSource);
    const balanceAfterRelogin = reloginResult.userBalance;

    console.log('Balance after relogin:', formatBalance(balanceAfterRelogin));

    expect(balanceAfterRelogin.Coins).toBe(balanceAfterSpin.Coins);
    expect(balanceAfterRelogin.Energy).toBe(balanceAfterSpin.Energy);
    expect(reloginResult.accountCreated).toBe(false);

    validateNoRollback(balanceAfterSpin, balanceAfterRelogin);

    expect(balanceAfterRelogin.Energy).toBeLessThan(initialBalance.Energy);
    expect(balanceAfterRelogin.Coins - initialBalance.Coins).toBe(expectedCoinsDiff);
  });

  test('should apply reward exactly once per spin', async () => {
    const loginResult = await login();
    const initialCoins = loginResult.userBalance.Coins;

    const spinResult = await spinWheel(loginResult.accessToken);
    const coinsEarned = spinResult.outcome.coinsEarned;

    const actualCoinsDiff = spinResult.response.response.SpinResult.UserBalance.Coins - initialCoins;

    expect(actualCoinsDiff).toBe(coinsEarned);
    expect(actualCoinsDiff).toBeGreaterThan(0);
  });

  test('should deduct energy cost for each spin', async () => {
    const loginResult = await login();
    const initialEnergy = loginResult.userBalance.Energy;

    const spinResult = await spinWheel(loginResult.accessToken);
    const newEnergy = spinResult.response.response.SpinResult.UserBalance.Energy;

    expect(newEnergy).toBe(initialEnergy - config.test.energyCostPerSpin);
  });

  test('should persist balance after relogin (no rollback)', async () => {
    const loginResult = await login();
    const deviceId = loginResult.deviceId;
    const loginSource = loginResult.loginSource;

    const spinResult = await spinWheel(loginResult.accessToken);
    const balanceAfterSpin = spinResult.response.response.SpinResult.UserBalance;

    const reloginResult = await login(deviceId, loginSource);
    
    expect(reloginResult.accountCreated).toBe(false);
    expect(reloginResult.userBalance.Coins).toBe(balanceAfterSpin.Coins);
    expect(reloginResult.userBalance.Energy).toBe(balanceAfterSpin.Energy);
  });
});
