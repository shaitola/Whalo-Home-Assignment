import { test, expect } from '@playwright/test';
import { login, loginWithDeviceId } from '../helpers/login.helper';
import { spinWheel, extractAllRewards } from '../helpers/wheel.helper';
import { config } from '../helpers/config.helper';

test.describe('Bonus Tests', () => {

  test('should assert AccountCreated field for new users', async () => {
    const loginResult = await login();

    expect(loginResult.accountCreated).toBe(true);
    expect(typeof loginResult.accountCreated).toBe('boolean');
  });

  test('should handle and report multiple reward types', async () => {
    const loginResult = await login();
    const spinsToPerform = Math.min(3, loginResult.userBalance.Energy);
    
    let totalCoins = 0;
    let totalGems = 0;
    let spinsWithRewards = 0;

    for (let i = 0; i < spinsToPerform; i++) {
      const spinResult = await spinWheel(loginResult.accessToken);
      const rewards = extractAllRewards(spinResult.response.response.SpinResult.Rewards);
      
      totalCoins += rewards.coins;
      totalGems += rewards.gems;
      
      if (rewards.rewards.length > 0) {
        spinsWithRewards++;
        console.log(`Spin ${i + 1}: coins=${rewards.coins}, gems=${rewards.gems}, boosters=${rewards.boosters}, totalRewards=${rewards.rewards.length}`);
      }
    }

    console.log(`Total: ${totalCoins} coins, ${totalGems} gems across ${spinsWithRewards} spins with rewards`);
    expect(spinsWithRewards).toBeGreaterThan(0);
  });

  test('should track coins after spins with relogin', async () => {
    const loginResult = await login();
    const deviceId = loginResult.deviceId;
    const loginSource = loginResult.loginSource;

    const initialEnergy = loginResult.userBalance.Energy;
    const initialCoins = loginResult.userBalance.Coins;
    console.log(`Starting with ${initialEnergy} energy, ${initialCoins} coins`);

    const spinsToPerform = Math.min(3, initialEnergy);
    let totalCoinsEarned = 0;
    let coinsAfterSpins = 0;

    for (let i = 0; i < spinsToPerform; i++) {
      const spinResult = await spinWheel(loginResult.accessToken);
      totalCoinsEarned += spinResult.outcome.coinsEarned;
      coinsAfterSpins = spinResult.response.response.SpinResult.UserBalance.Coins;
      console.log(`Spin ${i + 1}: earned ${spinResult.outcome.coinsEarned} coins, balance: ${coinsAfterSpins}`);
    }

    const relogin = await loginWithDeviceId(deviceId, loginSource);
    
    expect(relogin.accountCreated).toBe(false);
    expect(relogin.userBalance.Coins).toBe(coinsAfterSpins);
    expect(relogin.userBalance.Energy).toBeLessThan(initialEnergy);
    
    console.log(`Coins after spins: ${coinsAfterSpins}, After relogin: ${relogin.userBalance.Coins}`);
  });

  test('should observe wheel behavior across sessions (finding: wheel is NOT deterministic)', async () => {
    const deviceId = `${config.test.devicePrefix}_vary_${Date.now()}`;
    const loginSource = `${config.test.loginSourcePrefix}_${config.test.candidateName}_${Date.now()}`;

    const loginResult = await loginWithDeviceId(deviceId, loginSource);
    const spinsToPerform = Math.min(3, loginResult.userBalance.Energy);

    const firstSessionSpins: { selectedIndex: number; coinsEarned: number }[] = [];

    for (let i = 0; i < spinsToPerform; i++) {
      const spinResult = await spinWheel(loginResult.accessToken);
      firstSessionSpins.push({
        selectedIndex: spinResult.outcome.selectedIndex,
        coinsEarned: spinResult.outcome.coinsEarned,
      });
    }

    const relogin = await loginWithDeviceId(deviceId, loginSource);
    const secondSessionSpins: { selectedIndex: number; coinsEarned: number }[] = [];

    for (let i = 0; i < spinsToPerform; i++) {
      const spinResult = await spinWheel(relogin.accessToken);
      secondSessionSpins.push({
        selectedIndex: spinResult.outcome.selectedIndex,
        coinsEarned: spinResult.outcome.coinsEarned,
      });
    }

    console.log('First session spins:', firstSessionSpins.map(s => s.selectedIndex));
    console.log('Second session spins:', secondSessionSpins.map(s => s.selectedIndex));

    expect(firstSessionSpins.length).toBe(secondSessionSpins.length);

    const firstResults = firstSessionSpins.map(s => s.selectedIndex).join(',');
    const secondResults = secondSessionSpins.map(s => s.selectedIndex).join(',');
    
    const resultsMatch = firstResults === secondResults;
    
    console.log(`Finding: Wheel is NOT scripted per device — results differ across sessions`);
    console.log(`Sessions match: ${resultsMatch}`);
    
    test.info().annotations.push({
      type: 'finding',
      description: `Wheel is NOT deterministic: same device produces different spin results across sessions. First: [${firstResults}], Second: [${secondResults}]`
    });
    
    expect(resultsMatch).toBe(false);
  });

  test('should validate additional login response fields', async () => {
    const loginResult = await login();

    expect(loginResult.accessToken).toBeDefined();
    expect(loginResult.accessToken.length).toBeGreaterThan(0);

    const balance = loginResult.userBalance;
    expect(balance).toHaveProperty('Coins');
    expect(balance).toHaveProperty('Gems');
    expect(balance).toHaveProperty('Energy');
    expect(balance).toHaveProperty('EnergyExpirationTS');
    expect(balance).toHaveProperty('EnergyExpirationSeconds');
    expect(balance).toHaveProperty('LastUpdateTS');
    expect(balance).toHaveProperty('MaxEnergyCapacity');

    expect(typeof balance.Coins).toBe('number');
    expect(typeof balance.Gems).toBe('number');
    expect(typeof balance.Energy).toBe('number');
    expect(balance.Energy).toBeGreaterThanOrEqual(0);
    expect(balance.Energy).toBeLessThanOrEqual(balance.MaxEnergyCapacity);
    expect(balance.EnergyExpirationTS).toBeGreaterThan(Date.now());
    expect(balance.LastUpdateTS).toBeGreaterThan(0);
  });

  test('should validate wheel spin response Metus fields', async () => {
    const loginResult = await login();
    const spinResult = await spinWheel(loginResult.accessToken);

    const response = spinResult.response.response;

    expect(response).toHaveProperty('Metus_Rate');
    expect(response).toHaveProperty('Metuzm_Zam');
    expect(response).toHaveProperty('Metuzm_Zam_Data');
    expect(response).toHaveProperty('Metuzm_Zam_Data_Hadash');

    expect(typeof response.Metus_Rate).toBe('boolean');
    expect(typeof response.Metuzm_Zam).toBe('boolean');
    expect(typeof response.Metuzm_Zam_Data).toBe('string');
    expect(typeof response.Metuzm_Zam_Data_Hadash).toBe('string');
  });

  test('should track coins accurately after multiple spins', async () => {
    const loginResult = await login();
    const deviceId = loginResult.deviceId;
    const loginSource = loginResult.loginSource;

    const spinsToPerform = Math.min(3, loginResult.userBalance.Energy);
    let totalCoinsEarned = 0;
    let balanceAfterLastSpin = 0;

    for (let i = 0; i < spinsToPerform; i++) {
      const spinResult = await spinWheel(loginResult.accessToken);
      totalCoinsEarned += spinResult.outcome.coinsEarned;
      balanceAfterLastSpin = spinResult.response.response.SpinResult.UserBalance.Coins;
    }

    const relogin = await loginWithDeviceId(deviceId, loginSource);
    
    expect(relogin.accountCreated).toBe(false);
    expect(relogin.userBalance.Coins).toBe(balanceAfterLastSpin);
    console.log(`Total spins: ${spinsToPerform}, Earned: ${totalCoinsEarned}, Final: ${relogin.userBalance.Coins}`);
  });

  test('should spin until out of energy and validate final balance', async () => {
    const loginResult = await login();
    let accessToken = loginResult.accessToken;
    let totalCoinsEarned = 0;
    let lastCoinBalance = loginResult.userBalance.Coins;
    const trackingIds: string[] = [];

    console.log(`Starting energy: ${loginResult.userBalance.Energy}`);

    let currentEnergy = loginResult.userBalance.Energy;
    let spinsCompleted = 0;
    while (currentEnergy > 0) {
      const spinResult = await spinWheel(accessToken);
      totalCoinsEarned += spinResult.outcome.coinsEarned;
      lastCoinBalance = spinResult.response.response.SpinResult.UserBalance.Coins;
      currentEnergy = spinResult.response.response.SpinResult.UserBalance.Energy;
      spinsCompleted++;
      
      const coinsReward = spinResult.response.response.SpinResult.Rewards.find(
        r => r.RewardResourceType === 1
      );
      if (coinsReward?.TrackingId) {
        trackingIds.push(coinsReward.TrackingId);
      }
      
      console.log(`Spin ${spinsCompleted}: energy remaining ${currentEnergy}`);
    }

    const uniqueIds = new Set(trackingIds);
    expect(uniqueIds.size).toBe(trackingIds.length);
    console.log(`TrackingIds: all ${uniqueIds.size} unique ✓`);

    console.log(`Completed ${spinsCompleted} spins, earned ${totalCoinsEarned} total coins`);
    console.log(`Final coin balance: ${lastCoinBalance}`);

    const relogin = await loginWithDeviceId(loginResult.deviceId, loginResult.loginSource);
    
    expect(relogin.accountCreated).toBe(false);
    expect(relogin.userBalance.Coins).toBe(lastCoinBalance);
  });
});
