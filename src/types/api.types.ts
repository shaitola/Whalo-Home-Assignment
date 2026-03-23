export interface UserBalance {
  Coins: number;
  Gems: number;
  Energy: number;
  EnergyExpirationTS: number;
  EnergyExpirationSeconds: number;
  LastUpdateTS: number;
  ShieldsAmount: number;
  Shields: unknown[];
  MaxEnergyCapacity: number;
}

export interface LoginResponseData {
  Campaigns: unknown[];
  SegmentIds: unknown[];
  AbTest: unknown;
  ExternalPlayerId: string;
  DisplayName: string;
  Avatar: number;
  FacebookId: string;
  ImageFacebookId: string;
  AccessToken: string;
  CoinsAmount: number;
  GemsAmount: number;
  EnergyAmount: number;
  UserBalance: UserBalance;
  EnergyExpirationSeconds: number;
  AccountCreated: boolean;
  [key: string]: unknown;
}

export interface LoginResponse {
  status: number;
  response: {
    LoginStatus: number;
    LoginResponse: LoginResponseData;
  };
  [key: string]: unknown;
}

export interface Reward {
  RewardDefinitionType: number;
  TrackingId: string;
  RewardResourceType: number;
  Amount: number;
  Multiplier: number;
}

export interface SpinResult {
  Rewards: Reward[];
  UserBalance: UserBalance;
  PointCollectingSummary: {
    tournaments: unknown[];
  };
}

export interface WheelSpinResponse {
  status: number;
  response: {
    SelectedIndex: number;
    SpinResult: SpinResult;
    Metus_Rate: boolean;
    Metuzm_Zam: boolean;
    Metuzm_Zam_Data: string;
    Metuzm_Zam_Data_Hadash: string;
  };
  messages: unknown[];
}

export interface SpinOutcome {
  coinsEarned: number;
  newEnergy: number;
  trackingId: string;
  selectedIndex: number;
}

export interface TestContext {
  deviceId: string;
  loginSource: string;
  accessToken: string;
  initialBalance: UserBalance;
  balanceAfterSpin: UserBalance;
  spinOutcome: SpinOutcome;
}

export const REWARD_RESOURCE_TYPES = {
  COINS: 1,
  GEMS: 2,
  BOOSTERS: 3,
} as const;

export const REWARD_DEFINITION_TYPES = {
  REWARD: 1,
  PROMOTION: 2,
  EVENT: 3,
} as const;
