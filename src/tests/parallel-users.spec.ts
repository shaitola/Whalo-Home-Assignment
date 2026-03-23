import { test, expect } from '@playwright/test';
import { login, loginWithDeviceId } from '../helpers/login.helper';
import { spinWheel } from '../helpers/wheel.helper';

test.describe('Parallel Users Tests', () => {

  test('should not have cross-user contamination when spinning simultaneously', async () => {
    const [user1, user2, user3] = await Promise.all([
      login(),
      login(),
      login(),
    ]);

    expect(user1.deviceId).not.toBe(user2.deviceId);
    expect(user2.deviceId).not.toBe(user3.deviceId);
    expect(user1.deviceId).not.toBe(user3.deviceId);

    const initialBalances = {
      user1: { coins: user1.userBalance.Coins, energy: user1.userBalance.Energy },
      user2: { coins: user2.userBalance.Coins, energy: user2.userBalance.Energy },
      user3: { coins: user3.userBalance.Coins, energy: user3.userBalance.Energy },
    };

    const [result1, result2, result3] = await Promise.all([
      spinWheel(user1.accessToken),
      spinWheel(user2.accessToken),
      spinWheel(user3.accessToken),
    ]);

    const finalBalances = {
      user1: result1.response.response.SpinResult.UserBalance,
      user2: result2.response.response.SpinResult.UserBalance,
      user3: result3.response.response.SpinResult.UserBalance,
    };

    expect(finalBalances.user1.Energy).toBe(initialBalances.user1.energy - 1);
    expect(finalBalances.user2.Energy).toBe(initialBalances.user2.energy - 1);
    expect(finalBalances.user3.Energy).toBe(initialBalances.user3.energy - 1);

    expect(finalBalances.user1.Coins - initialBalances.user1.coins).toBe(result1.outcome.coinsEarned);
    expect(finalBalances.user2.Coins - initialBalances.user2.coins).toBe(result2.outcome.coinsEarned);
    expect(finalBalances.user3.Coins - initialBalances.user3.coins).toBe(result3.outcome.coinsEarned);

    const relogins = await Promise.all([
      loginWithDeviceId(user1.deviceId, user1.loginSource),
      loginWithDeviceId(user2.deviceId, user2.loginSource),
      loginWithDeviceId(user3.deviceId, user3.loginSource),
    ]);

    expect(relogins[0].userBalance.Coins).toBe(finalBalances.user1.Coins);
    expect(relogins[1].userBalance.Coins).toBe(finalBalances.user2.Coins);
    expect(relogins[2].userBalance.Coins).toBe(finalBalances.user3.Coins);
  });

});
