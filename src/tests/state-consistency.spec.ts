import { test, expect } from '@playwright/test';
import { login } from '../helpers/login.helper';
import { spinWheel } from '../helpers/wheel.helper';

test.describe('State Consistency Tests', () => {
  test('should persist user balance across multiple sessions', async () => {
    const loginResult = await login();
    const deviceId = loginResult.deviceId;
    const loginSource = loginResult.loginSource;

    await spinWheel(loginResult.accessToken);
    
    const login2 = await login(deviceId, loginSource);
    expect(login2.accountCreated).toBe(false);
    
    const login3 = await login(deviceId, loginSource);
    expect(login3.accountCreated).toBe(false);

    expect(login2.userBalance.Coins).toBe(login3.userBalance.Coins);
    expect(login2.userBalance.Energy).toBe(login3.userBalance.Energy);
    expect(login2.userBalance.Gems).toBe(login3.userBalance.Gems);
  });

  test('should maintain consistent state after multiple spins', async () => {
    const loginResult = await login();
    const deviceId = loginResult.deviceId;
    const loginSource = loginResult.loginSource;

    const spinsToPerform = Math.min(3, loginResult.userBalance.Energy);
    let balanceAfterLastSpin = 0;

    for (let i = 0; i < spinsToPerform; i++) {
      const spinResult = await spinWheel(loginResult.accessToken);
      balanceAfterLastSpin = spinResult.response.response.SpinResult.UserBalance.Coins;
    }

    const login2 = await login(deviceId, loginSource);
    expect(login2.accountCreated).toBe(false);

    expect(login2.userBalance.Coins).toBe(balanceAfterLastSpin);
  });

  test('should not rollback state after relogin', async () => {
    const loginResult = await login();
    const deviceId = loginResult.deviceId;
    const loginSource = loginResult.loginSource;

    const spinResult = await spinWheel(loginResult.accessToken);
    const balanceFromSpinResponse = spinResult.response.response.SpinResult.UserBalance;

    const login2 = await login(deviceId, loginSource);
    expect(login2.accountCreated).toBe(false);

    expect(login2.userBalance.Coins).toBe(balanceFromSpinResponse.Coins);
    expect(login2.userBalance.Energy).toBe(balanceFromSpinResponse.Energy);
  });

  test('should return valid balance for new device ID', async () => {
    const loginResult = await login();

    expect(loginResult.accountCreated).toBe(true);
    expect(loginResult.userBalance.Coins).toBeGreaterThanOrEqual(0);
    expect(loginResult.userBalance.Energy).toBeGreaterThanOrEqual(0);
    expect(loginResult.userBalance.Gems).toBeGreaterThanOrEqual(0);
    expect(loginResult.accessToken).toBeDefined();
    expect(loginResult.accessToken.length).toBeGreaterThan(0);
  });

  test('should return existing user when device ID exists', async () => {
    const loginResult = await login();
    const deviceId = loginResult.deviceId;
    const loginSource = loginResult.loginSource;
    const coinsBefore = loginResult.userBalance.Coins;

    await spinWheel(loginResult.accessToken);

    const login2 = await login(deviceId, loginSource);
    expect(login2.accountCreated).toBe(false);

    expect(login2.userBalance.Coins).toBeGreaterThan(coinsBefore);
  });
});
