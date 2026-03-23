import { UserBalance } from '../types/api.types';

export function validateRewardAppliedOnce(
  initialBalance: UserBalance,
  balanceAfterSpin: UserBalance,
  expectedCoinsDiff: number,
  expectedEnergyDiff: number
): void {
  const actualCoinsDiff = balanceAfterSpin.Coins - initialBalance.Coins;
  const actualEnergyDiff = balanceAfterSpin.Energy - initialBalance.Energy;

  if (actualCoinsDiff !== expectedCoinsDiff) {
    throw new Error(`Coins reward not applied exactly once. Expected ${expectedCoinsDiff}, got ${actualCoinsDiff}`);
  }
  if (actualEnergyDiff !== expectedEnergyDiff) {
    throw new Error(`Energy cost not applied exactly once. Expected ${expectedEnergyDiff}, got ${actualEnergyDiff}`);
  }
}

export function validateNoRollback(
  balanceAfterSpin: UserBalance,
  balanceAfterRelogin: UserBalance
): void {
  if (balanceAfterRelogin.Coins < balanceAfterSpin.Coins) {
    throw new Error('Coins balance rolled back after relogin');
  }
  if (balanceAfterRelogin.Energy < balanceAfterSpin.Energy) {
    throw new Error('Energy balance rolled back after relogin');
  }
}

export function formatBalance(balance: UserBalance): string {
  return JSON.stringify({
    Coins: balance.Coins,
    Gems: balance.Gems,
    Energy: balance.Energy,
    MaxEnergyCapacity: balance.MaxEnergyCapacity,
  }, null, 2);
}
