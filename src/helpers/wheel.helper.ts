import { config } from './config.helper';
import { apiPostWithStatusCheck } from './api.helper';
import { WheelSpinResponse, SpinOutcome, REWARD_RESOURCE_TYPES, Reward } from '../types/api.types';

export interface AllRewards {
  coins: number;
  gems: number;
  boosters: number;
  rewards: Reward[];
}

export interface SpinWheelResult {
  outcome: SpinOutcome;
  response: WheelSpinResponse;
}

export async function spinWheel(accessToken: string): Promise<SpinWheelResult> {
  const body = await apiPostWithStatusCheck<WheelSpinResponse>(config.api.wheelSpinEndpoint, {
    headers: { 'accessToken': accessToken },
    data: { multiplier: config.test.spinMultiplier },
  });

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
      case REWARD_RESOURCE_TYPES.NONE:
        break;
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
        break;
    }
  }

  return result;
}
