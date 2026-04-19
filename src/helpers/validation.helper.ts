import { LoginResponse, WheelSpinResponse, UserBalance, Reward } from '../types/api.types';
import { REWARD_RESOURCE_TYPES } from '../types/api.types';

export interface LoginValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  validatedFields: Record<string, { value: unknown; type: string }>;
}

export interface SpinValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  validatedFields: Record<string, { value: unknown; type: string }>;
  rewardsSummary: {
    coins: number;
    gems: number;
    boosters: number;
    unknown: number;
    total: number;
  };
}

export function validateLoginResponse(response: LoginResponse, isNewUser: boolean): LoginValidationResult {
  const result: LoginValidationResult = {
    isValid: true,
    errors: [],
    warnings: [],
    validatedFields: {},
  };

  if (response.status !== 0) {
    result.errors.push(`Login status is ${response.status}, expected 0`);
    result.isValid = false;
  }
  result.validatedFields['status'] = { value: response.status, type: 'number' };

  if (!response.response) {
    result.errors.push('Missing response object');
    result.isValid = false;
    return result;
  }
  result.validatedFields['response'] = { value: 'present', type: 'object' };

  if (response.response.LoginStatus !== 0) {
    result.warnings.push(`LoginStatus is ${response.response.LoginStatus}, expected 0`);
  }
  result.validatedFields['response.LoginStatus'] = { value: response.response.LoginStatus, type: 'number' };

  const loginResponse = response.response.LoginResponse;
  if (!loginResponse) {
    result.errors.push('Missing LoginResponse object');
    result.isValid = false;
    return result;
  }

  if (!loginResponse.AccessToken || typeof loginResponse.AccessToken !== 'string' || loginResponse.AccessToken.length === 0) {
    result.errors.push('Missing or invalid AccessToken');
    result.isValid = false;
  } else {
    result.validatedFields['response.LoginResponse.AccessToken'] = { value: loginResponse.AccessToken, type: 'string' };
  }

  if (typeof loginResponse.AccountCreated !== 'boolean') {
    result.warnings.push('AccountCreated is not a boolean');
  } else if (isNewUser && !loginResponse.AccountCreated) {
    result.warnings.push('New user returned AccountCreated=false');
  } else if (!isNewUser && loginResponse.AccountCreated) {
    result.warnings.push('Returning user returned AccountCreated=true');
  }
  result.validatedFields['response.LoginResponse.AccountCreated'] = { value: loginResponse.AccountCreated, type: 'boolean' };

  if (typeof loginResponse.ExternalPlayerId !== 'string') {
    result.warnings.push('ExternalPlayerId is not a string');
  } else {
    result.validatedFields['response.LoginResponse.ExternalPlayerId'] = { value: loginResponse.ExternalPlayerId, type: 'string' };
  }

  if (typeof loginResponse.DisplayName !== 'string') {
    result.warnings.push('DisplayName is not a string');
  } else {
    result.validatedFields['response.LoginResponse.DisplayName'] = { value: loginResponse.DisplayName, type: 'string' };
  }

  if (typeof loginResponse.Avatar !== 'number') {
    result.warnings.push('Avatar is not a number');
  } else {
    result.validatedFields['response.LoginResponse.Avatar'] = { value: loginResponse.Avatar, type: 'number' };
  }

  if (typeof loginResponse.FacebookId !== 'string') {
    result.warnings.push('FacebookId is not a string');
  } else {
    result.validatedFields['response.LoginResponse.FacebookId'] = { value: loginResponse.FacebookId, type: 'string' };
  }

  if (typeof loginResponse.CoinsAmount !== 'number') {
    result.warnings.push('CoinsAmount is not a number');
  } else {
    result.validatedFields['response.LoginResponse.CoinsAmount'] = { value: loginResponse.CoinsAmount, type: 'number' };
  }

  if (typeof loginResponse.GemsAmount !== 'number') {
    result.warnings.push('GemsAmount is not a number');
  } else {
    result.validatedFields['response.LoginResponse.GemsAmount'] = { value: loginResponse.GemsAmount, type: 'number' };
  }

  if (typeof loginResponse.EnergyAmount !== 'number') {
    result.warnings.push('EnergyAmount is not a number');
  } else {
    result.validatedFields['response.LoginResponse.EnergyAmount'] = { value: loginResponse.EnergyAmount, type: 'number' };
  }

  if (typeof loginResponse.EnergyExpirationSeconds !== 'number') {
    result.warnings.push('EnergyExpirationSeconds is not a number');
  } else {
    result.validatedFields['response.LoginResponse.EnergyExpirationSeconds'] = { value: loginResponse.EnergyExpirationSeconds, type: 'number' };
  }

  validateUserBalance(loginResponse.UserBalance, result);

  if (typeof loginResponse.AbTest !== 'object' || loginResponse.AbTest === null) {
    result.warnings.push('AbTest is not an object');
  } else {
    result.validatedFields['response.LoginResponse.AbTest'] = { value: 'present', type: 'object' };
  }

  if (typeof loginResponse.Campaigns !== 'object' || !Array.isArray(loginResponse.Campaigns)) {
    result.warnings.push('Campaigns is not an array');
  }

  if (typeof loginResponse.SegmentIds !== 'object' || !Array.isArray(loginResponse.SegmentIds)) {
    result.warnings.push('SegmentIds is not an array');
  }

  if (typeof loginResponse.ImageFacebookId !== 'string') {
    result.warnings.push('ImageFacebookId is not a string');
  } else {
    result.validatedFields['response.LoginResponse.ImageFacebookId'] = { value: loginResponse.ImageFacebookId, type: 'string' };
  }

  if (typeof loginResponse.Level !== 'object' || loginResponse.Level === null) {
    result.warnings.push('Level is not an object');
  } else {
    result.validatedFields['response.LoginResponse.Level'] = { value: 'present', type: 'object' };
  }

  if (typeof loginResponse.Cards !== 'object' || !Array.isArray(loginResponse.Cards)) {
    result.warnings.push('Cards is not an array');
  } else {
    result.validatedFields['response.LoginResponse.Cards'] = { value: `array[${loginResponse.Cards.length}]`, type: 'array' };
  }

  if (typeof loginResponse.Boosters !== 'object' || !Array.isArray(loginResponse.Boosters)) {
    result.warnings.push('Boosters is not an array');
  }

  if (typeof loginResponse.CashKing !== 'object') {
    result.warnings.push('CashKing is not an object');
  }

  if (typeof loginResponse.Wheel !== 'object' || loginResponse.Wheel === null) {
    result.warnings.push('Wheel is not an object');
  } else {
    result.validatedFields['response.LoginResponse.Wheel'] = { value: 'present', type: 'object' };
  }

  if (typeof loginResponse.Session !== 'object' || loginResponse.Session === null) {
    result.warnings.push('Session is not an object');
  } else {
    result.validatedFields['response.LoginResponse.Session'] = { value: 'present', type: 'object' };
  }

  if (typeof loginResponse.ShortId !== 'object' || loginResponse.ShortId === null) {
    result.warnings.push('ShortId is not an object');
  } else {
    result.validatedFields['response.LoginResponse.ShortId'] = { value: 'present', type: 'object' };
  }

  if (typeof loginResponse.RefreshToken !== 'string') {
    result.warnings.push('RefreshToken is not a string');
  } else {
    result.validatedFields['response.LoginResponse.RefreshToken'] = { value: loginResponse.RefreshToken, type: 'string' };
  }

  if (typeof loginResponse.RefreshTokenUsedForLogin !== 'boolean') {
    result.warnings.push('RefreshTokenUsedForLogin is not a boolean');
  } else {
    result.validatedFields['response.LoginResponse.RefreshTokenUsedForLogin'] = { value: loginResponse.RefreshTokenUsedForLogin, type: 'boolean' };
  }

  return result;
}

function validateUserBalance(balance: UserBalance, result: LoginValidationResult): void {
  result.validatedFields['response.LoginResponse.UserBalance'] = { value: 'present', type: 'object' };

  if (typeof balance?.Coins !== 'number') {
    result.warnings.push('UserBalance.Coins is not a number');
  } else {
    result.validatedFields['response.LoginResponse.UserBalance.Coins'] = { value: balance.Coins, type: 'number' };
    if (balance.Coins < 0) {
      result.errors.push('Coins balance is negative');
      result.isValid = false;
    }
  }

  if (typeof balance?.Gems !== 'number') {
    result.warnings.push('UserBalance.Gems is not a number');
  } else {
    result.validatedFields['response.LoginResponse.UserBalance.Gems'] = { value: balance.Gems, type: 'number' };
    if (balance.Gems < 0) {
      result.errors.push('Gems balance is negative');
      result.isValid = false;
    }
  }

  if (typeof balance?.Energy !== 'number') {
    result.warnings.push('UserBalance.Energy is not a number');
  } else {
    result.validatedFields['response.LoginResponse.UserBalance.Energy'] = { value: balance.Energy, type: 'number' };
    if (balance.Energy < 0) {
      result.errors.push('Energy is negative');
      result.isValid = false;
    }
    if (balance.MaxEnergyCapacity !== undefined && balance.Energy > balance.MaxEnergyCapacity) {
      result.warnings.push('Energy exceeds MaxEnergyCapacity');
    }
  }

  if (typeof balance?.MaxEnergyCapacity !== 'number' || balance.MaxEnergyCapacity <= 0) {
    result.warnings.push('MaxEnergyCapacity is invalid');
  } else {
    result.validatedFields['response.LoginResponse.UserBalance.MaxEnergyCapacity'] = { value: balance.MaxEnergyCapacity, type: 'number' };
  }

  if (typeof balance?.EnergyExpirationTS !== 'number') {
    result.warnings.push('EnergyExpirationTS is not a number');
  } else {
    result.validatedFields['response.LoginResponse.UserBalance.EnergyExpirationTS'] = { value: balance.EnergyExpirationTS, type: 'number' };
  }

  if (typeof balance?.EnergyExpirationSeconds !== 'number') {
    result.warnings.push('EnergyExpirationSeconds is not a number');
  } else {
    result.validatedFields['response.LoginResponse.UserBalance.EnergyExpirationSeconds'] = { value: balance.EnergyExpirationSeconds, type: 'number' };
  }

  if (typeof balance?.LastUpdateTS !== 'number') {
    result.warnings.push('LastUpdateTS is not a number');
  } else {
    result.validatedFields['response.LoginResponse.UserBalance.LastUpdateTS'] = { value: balance.LastUpdateTS, type: 'number' };
  }

  if (typeof balance?.ShieldsAmount !== 'number') {
    result.warnings.push('ShieldsAmount is not a number');
  } else {
    result.validatedFields['response.LoginResponse.UserBalance.ShieldsAmount'] = { value: balance.ShieldsAmount, type: 'number' };
  }

  if (!Array.isArray(balance?.Shields)) {
    result.warnings.push('Shields is not an array');
  } else {
    result.validatedFields['response.LoginResponse.UserBalance.Shields'] = { value: `array[${balance.Shields.length}]`, type: 'array' };
  }
}

export function validateSpinResponse(response: WheelSpinResponse, expectedEnergyAfterSpin?: number): SpinValidationResult {
  const result: SpinValidationResult = {
    isValid: true,
    errors: [],
    warnings: [],
    validatedFields: {},
    rewardsSummary: {
      coins: 0,
      gems: 0,
      boosters: 0,
      unknown: 0,
      total: 0,
    },
  };

  if (response.status !== 0) {
    result.errors.push(`Spin status is ${response.status}, expected 0`);
    result.isValid = false;
  }
  result.validatedFields['status'] = { value: response.status, type: 'number' };

  if (!response.response) {
    result.errors.push('Missing response object');
    result.isValid = false;
    return result;
  }
  result.validatedFields['response'] = { value: 'present', type: 'object' };

  if (typeof response.response.SelectedIndex !== 'number') {
    result.errors.push('SelectedIndex is missing or not a number');
    result.isValid = false;
  } else {
    result.validatedFields['response.SelectedIndex'] = { value: response.response.SelectedIndex, type: 'number' };
    if (response.response.SelectedIndex < 0) {
      result.errors.push('SelectedIndex is negative');
      result.isValid = false;
    }
  }

  if (!response.response.SpinResult) {
    result.errors.push('Missing SpinResult object');
    result.isValid = false;
    return result;
  }

  const rewards = response.response.SpinResult.Rewards;
  if (!Array.isArray(rewards) || rewards.length === 0) {
    result.errors.push('Rewards is missing or empty');
    result.isValid = false;
  } else {
    result.validatedFields['response.SpinResult.Rewards'] = { value: `array[${rewards.length}]`, type: 'array' };

    for (let i = 0; i < rewards.length; i++) {
      const reward = rewards[i];
      validateReward(reward, i, result);
    }
  }

  const userBalance = response.response.SpinResult.UserBalance;
  if (!userBalance) {
    result.errors.push('UserBalance is missing');
    result.isValid = false;
  } else {
    validateUserBalanceInSpin(userBalance, result, expectedEnergyAfterSpin);
  }

  if (typeof response.response.Metus_Rate !== 'boolean') {
    result.warnings.push('Metus_Rate is not a boolean');
  } else {
    result.validatedFields['response.Metus_Rate'] = { value: response.response.Metus_Rate, type: 'boolean' };
  }

  if (typeof response.response.Metuzm_Zam !== 'boolean') {
    result.warnings.push('Metuzm_Zam is not a boolean');
  } else {
    result.validatedFields['response.Metuzm_Zam'] = { value: response.response.Metuzm_Zam, type: 'boolean' };
  }

  if (typeof response.response.Metuzm_Zam_Data !== 'string') {
    result.warnings.push('Metuzm_Zam_Data is not a string');
  } else {
    result.validatedFields['response.Metuzm_Zam_Data'] = { value: response.response.Metuzm_Zam_Data, type: 'string' };
  }

  if (typeof response.response.Metuzm_Zam_Data_Hadash !== 'string') {
    result.warnings.push('Metuzm_Zam_Data_Hadash is not a string');
  } else {
    result.validatedFields['response.Metuzm_Zam_Data_Hadash'] = { value: response.response.Metuzm_Zam_Data_Hadash, type: 'string' };
  }

  return result;
}

function validateReward(reward: Reward, index: number, result: SpinValidationResult): void {
  const prefix = `response.SpinResult.Rewards[${index}]`;

  if (typeof reward.RewardDefinitionType !== 'number') {
    result.warnings.push(`${prefix}.RewardDefinitionType is not a number`);
  } else {
    result.validatedFields[`${prefix}.RewardDefinitionType`] = { value: reward.RewardDefinitionType, type: 'number' };
  }

  if (typeof reward.RewardResourceType !== 'number') {
    result.warnings.push(`${prefix}.RewardResourceType is not a number`);
  } else {
    result.validatedFields[`${prefix}.RewardResourceType`] = { value: reward.RewardResourceType, type: 'number' };

    switch (reward.RewardResourceType) {
      case REWARD_RESOURCE_TYPES.NONE:
        break;
      case REWARD_RESOURCE_TYPES.COINS:
        result.rewardsSummary.coins += reward.Amount;
        break;
      case REWARD_RESOURCE_TYPES.GEMS:
        result.rewardsSummary.gems += reward.Amount;
        break;
      case REWARD_RESOURCE_TYPES.BOOSTERS:
        result.rewardsSummary.boosters += reward.Amount;
        break;
      default:
        result.rewardsSummary.unknown += reward.Amount;
        result.warnings.push(`${prefix}: Unrecognized reward type (${reward.RewardResourceType}) with amount ${reward.Amount}`);
    }
  }

  if (typeof reward.Amount !== 'number') {
    result.warnings.push(`${prefix}.Amount is not a number`);
  } else {
    result.validatedFields[`${prefix}.Amount`] = { value: reward.Amount, type: 'number' };
    if (reward.Amount < 0) {
      result.warnings.push(`${prefix}.Amount is negative: ${reward.Amount}`);
    }
  }

  if (typeof reward.TrackingId !== 'string' || reward.TrackingId.length === 0) {
    result.warnings.push(`${prefix}.TrackingId is missing or empty`);
  } else {
    result.validatedFields[`${prefix}.TrackingId`] = { value: reward.TrackingId, type: 'string' };
  }

  if (typeof reward.Multiplier !== 'number') {
    result.warnings.push(`${prefix}.Multiplier is not a number`);
  } else {
    result.validatedFields[`${prefix}.Multiplier`] = { value: reward.Multiplier, type: 'number' };
  }

  result.rewardsSummary.total++;
}

function validateUserBalanceInSpin(balance: UserBalance, result: SpinValidationResult, expectedEnergy?: number): void {
  result.validatedFields['response.SpinResult.UserBalance'] = { value: 'present', type: 'object' };

  if (typeof balance.Coins !== 'number') {
    result.warnings.push('UserBalance.Coins is not a number');
  } else {
    result.validatedFields['response.SpinResult.UserBalance.Coins'] = { value: balance.Coins, type: 'number' };
  }

  if (typeof balance.Energy !== 'number') {
    result.warnings.push('UserBalance.Energy is not a number');
  } else {
    result.validatedFields['response.SpinResult.UserBalance.Energy'] = { value: balance.Energy, type: 'number' };

    if (expectedEnergy !== undefined && balance.Energy !== expectedEnergy) {
      result.errors.push(`Energy is ${balance.Energy}, expected ${expectedEnergy}`);
      result.isValid = false;
    }

    if (balance.Energy < 0) {
      result.errors.push('Energy is negative');
      result.isValid = false;
    }

    if (balance.MaxEnergyCapacity !== undefined && balance.Energy > balance.MaxEnergyCapacity) {
      result.warnings.push('Energy exceeds MaxEnergyCapacity');
    }
  }

  if (typeof balance.Gems !== 'number') {
    result.warnings.push('UserBalance.Gems is not a number');
  } else {
    result.validatedFields['response.SpinResult.UserBalance.Gems'] = { value: balance.Gems, type: 'number' };
  }

  if (typeof balance.ShieldsAmount !== 'number') {
    result.warnings.push('UserBalance.ShieldsAmount is not a number');
  } else {
    result.validatedFields['response.SpinResult.UserBalance.ShieldsAmount'] = { value: balance.ShieldsAmount, type: 'number' };
  }

  if (!Array.isArray(balance.Shields)) {
    result.warnings.push('UserBalance.Shields is not an array');
  } else {
    result.validatedFields['response.SpinResult.UserBalance.Shields'] = { value: `array[${balance.Shields.length}]`, type: 'array' };
  }
}
