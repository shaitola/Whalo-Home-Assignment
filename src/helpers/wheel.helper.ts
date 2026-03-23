import { getFullUrl, config } from './config.helper';
import { WheelSpinResponse, SpinOutcome, REWARD_RESOURCE_TYPES, Reward } from '../types/api.types';

export interface SpinResult {
  outcome: SpinOutcome;
  response: WheelSpinResponse;
}

export interface AllRewards {
  coins: number;
  gems: number;
  boosters: number;
  rewards: Reward[];
}

export async function spinWheel(accessToken: string): Promise<SpinResult> {
  const spinUrl = getFullUrl(config.api.wheelSpinEndpoint);

  const response = await fetch(spinUrl, {
    method: 'POST',
    headers: {
      'accessToken': accessToken,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      multiplier: config.test.spinMultiplier,
    }),
  });

  const status = response.status;
  const body: WheelSpinResponse = await response.json() as WheelSpinResponse;

  if (status !== 200) {
    throw new Error(`Wheel spin failed with status ${status}. Body: ${JSON.stringify(body)}`);
  }

  if (body.status !== 0) {
    throw new Error(`Wheel spin returned non-zero status: ${body.status}`);
  }

  const allRewards = extractAllRewards(body.response.SpinResult.Rewards);
  const coinsReward = body.response.SpinResult.Rewards.find(
    reward => reward.RewardDefinitionType === 1 && reward.RewardResourceType === REWARD_RESOURCE_TYPES.COINS
  );

  const outcome: SpinOutcome = {
    coinsEarned: coinsReward?.Amount || 0,
    newEnergy: body.response.SpinResult.UserBalance.Energy,
    trackingId: coinsReward?.TrackingId || '',
    selectedIndex: body.response.SelectedIndex,
  };

  return {
    outcome,
    response: body,
  };
}

export function extractAllRewards(rewards: Reward[]): AllRewards {
  const result: AllRewards = {
    coins: 0,
    gems: 0,
    boosters: 0,
    rewards: rewards,
  };

  for (const reward of rewards) {
    switch (reward.RewardResourceType) {
      case REWARD_RESOURCE_TYPES.COINS:
        result.coins += reward.Amount;
        break;
      case REWARD_RESOURCE_TYPES.GEMS:
        result.gems += reward.Amount;
        break;
      case REWARD_RESOURCE_TYPES.BOOSTERS:
        result.boosters += reward.Amount;
        break;
      default:
        console.log(`Unknown reward type: ${reward.RewardResourceType}`);
    }
  }

  return result;
}

export function validateSpinResponse(response: WheelSpinResponse): void {
  if (typeof response.status !== 'number' || response.status !== 0) {
    throw new Error(`Invalid status in spin response: ${response.status}`);
  }

  if (typeof response.response.SelectedIndex !== 'number') {
    throw new Error('Missing or invalid SelectedIndex in spin response');
  }

  if (!Array.isArray(response.response.SpinResult.Rewards)) {
    throw new Error('Missing or invalid Rewards array in spin response');
  }

  if (response.response.SpinResult.Rewards.length === 0) {
    throw new Error('Spin response contains no rewards');
  }

  for (const reward of response.response.SpinResult.Rewards) {
    if (typeof reward.RewardDefinitionType !== 'number') {
      throw new Error('Missing or invalid RewardDefinitionType');
    }
    if (typeof reward.RewardResourceType !== 'number') {
      throw new Error('Missing or invalid RewardResourceType');
    }
    if (typeof reward.Amount !== 'number') {
      throw new Error('Missing or invalid Amount');
    }
    if (typeof reward.TrackingId !== 'string' || reward.TrackingId.length === 0) {
      throw new Error('Missing or invalid TrackingId');
    }
    if (typeof reward.Multiplier !== 'number') {
      throw new Error('Missing or invalid Multiplier');
    }
  }

  const coinsReward = response.response.SpinResult.Rewards.find(
    reward => reward.RewardResourceType === REWARD_RESOURCE_TYPES.COINS
  );

  if (coinsReward) {
    if (typeof coinsReward.Amount !== 'number' || coinsReward.Amount < 0) {
      throw new Error(`Invalid coin reward amount: ${coinsReward.Amount}`);
    }
    if (!coinsReward.TrackingId) {
      throw new Error('Missing TrackingId for coin reward');
    }
  }

  if (!response.response.SpinResult.UserBalance) {
    throw new Error('Missing UserBalance in spin response');
  }

  if (typeof response.response.SpinResult.UserBalance.Energy !== 'number') {
    throw new Error('Missing or invalid Energy in spin response');
  }

  if (typeof response.response.SpinResult.UserBalance.Coins !== 'number') {
    throw new Error('Missing or invalid Coins in spin response');
  }
}
