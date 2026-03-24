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
  ExperiencePoints?: number;
  Level?: number;
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
  BonusMultiplier?: number;
  ExperiencePoints?: number;
  Level?: number;
  LevelProgress?: number;
  MaxLevel?: number;
  TutorialStep?: number;
  TutorialCompleted?: boolean;
  LastSessionId?: string;
  SessionNumber?: number;
  TotalPlayTime?: number;
  TotalSpins?: number;
  LifetimeCoins?: number;
  LifetimeGems?: number;
  PlayerId?: string;
  ReferralCode?: string;
  VIPLevel?: number;
  VIPPoints?: number;
  StreakDays?: number;
  LastActiveDate?: string;
  CountryCode?: string;
  LanguageCode?: string;
  DeviceType?: string;
  OSVersion?: string;
  AppVersion?: string;
  RegistrationDate?: string;
  LastLoginDate?: string;
  FriendsCount?: number;
  PendingFriendRequests?: number;
  NotificationsEnabled?: boolean;
  SoundEnabled?: boolean;
  MusicEnabled?: boolean;
  VibrateEnabled?: boolean;
  PushNotificationsEnabled?: boolean;
  DailyBonusAvailable?: boolean;
  DailyBonusDay?: number;
  WeeklyTournamentAvailable?: boolean;
  SeasonPassActive?: boolean;
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
    totalPoints?: number;
    currentRank?: number;
    nextRankPoints?: number;
  };
  BonusSummary?: {
    totalBonusEarned?: number;
    bonusType?: string;
    bonusSource?: string;
  };
  AchievementSummary?: {
    achievementsUnlocked?: number;
    achievementIds?: string[];
  };
  LevelSummary?: {
    currentLevel?: number;
    experiencePoints?: number;
    experienceToNextLevel?: number;
    levelProgress?: number;
  };
  SessionSummary?: {
    sessionId?: string;
    sessionStartTime?: number;
    spinsInSession?: number;
    totalCoinsEarned?: number;
    totalGemsEarned?: number;
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
    SpinId?: string;
    SpinTimestamp?: number;
    ClientTime?: number;
    ServerTime?: number;
    RoundTripMs?: number;
    SequenceNumber?: number;
    SessionId?: string;
    EventId?: string;
    SegmentId?: string;
    VariantId?: string;
    WheelConfigId?: string;
    WheelType?: string;
    SpinDurationMs?: number;
    AnimationDurationMs?: number;
    SoundEffectId?: string;
    VibrationPatternId?: string;
    BonusAwarded?: boolean;
    BonusType?: string;
    BonusMultiplier?: number;
    JackpotTriggered?: boolean;
    JackpotAmount?: number;
    LoyaltyPointsEarned?: number;
    TournamentPointsEarned?: number;
    AchievementUnlocked?: boolean;
    AchievementId?: string;
    LevelUp?: boolean;
    NewLevel?: number;
    ExperienceGained?: number;
    StreakBonus?: number;
    DailyBonusMultiplier?: number;
    VIPPointsEarned?: number;
    ComboBonus?: number;
    MysteryReward?: boolean;
    MysteryRewardType?: string;
    MysteryRewardAmount?: number;
    FreeSpinsRemaining?: number;
    AdsWatched?: number;
    DailySpinAvailable?: boolean;
    DailySpinExpiry?: number;
    WheelLocked?: boolean;
    LockReason?: string;
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
  NONE: 0,
  COINS: 1,
  GEMS: 2,
  BOOSTERS: 3,
} as const;

export const REWARD_RESOURCE_TYPE_NAMES: Record<number, string> = {
  0: 'NONE',
  1: 'COINS',
  2: 'GEMS',
  3: 'BOOSTERS',
};

export const REWARD_DEFINITION_TYPES = {
  REWARD: 1,
  PROMOTION: 2,
  EVENT: 3,
} as const;
