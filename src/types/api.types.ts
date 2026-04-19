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
  AbTest: {
    AbDisplayName: string;
    VariationDisplayName: string;
  };
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
  EnergyLevelsFactorChange: unknown[];
  Level: {
    Blast: unknown[];
    BlastV2: Record<string, unknown>;
    IsLandBlasted: boolean;
    CompletedQuests: unknown[];
    LandId: string;
    LevelId: number;
    DaysToComplete: number;
    GiftsZone: unknown[];
    SuggestedBlasts: unknown[];
    SuggestedQuests: Array<{
      QuestId: number;
      SubQuestId: number;
      TotalSubQuests: number;
      Cost: number;
    }>;
  };
  Cards: Array<{
    Weight: number;
    CardId: string;
    Type: number;
    Amount: number;
    Level: number;
    BaseReward: number;
    NextLevelUpAmount: number;
    InsideLevelAmount: number;
    LevelRewardInformation: {
      CurrentRewardMultiplier: number;
      NextRewardMultiplier: number;
    };
  }>;
  Boosters: unknown[];
  CashKing: {
    CoinsAmount: number;
    DisplayName: string;
    ExternalId: string;
    FacebookId: string;
    ImageUrl: string;
    Avatar: number;
  } | null;
  DragonMiniGameStatus: unknown;
  UnhandledMiniGames: unknown[];
  MissionInformation: {
    MissionConfig: {
      action: string;
      level: number;
      quest: number;
    };
    MissionPlayerStatus: string;
  };
  Wheel: {
    Wedges: Array<{
      Rewards: Array<{
        RewardDefinitionType: number;
        RewardResourceType: number;
        RewardActionType?: number;
        Amount: number;
      }>;
      WedgeType: number;
    }>;
    WheelId: string;
    TimerInfo: {
      timerId: number;
      ttlSec: number;
      wheelId: string;
    };
    CrmInfo: {
      active: unknown;
      future: unknown[];
    };
    displayName: string;
  };
  RevealFeatures: Record<string, unknown>;
  PointCollector: {
    Mission: unknown[];
    Tournament: unknown[];
    GenericBar: unknown[];
    Trail: unknown[];
    RollingOffer: unknown[];
    PersonalOffer: unknown[];
    Promotion: unknown[];
  };
  StickerBook: {
    Jokers: unknown[];
  };
  Floatings: unknown[];
  Session: {
    SessionStartTtlSec: number;
    SessionCounter: number;
  };
  CrmFishes: {
    active: unknown[];
    future: unknown[];
  };
  WheelMultipliers: {
    config: {
      displayName: string;
      ExtraData: {
        name: string;
        displayName: string;
        CrmData: {
          name: string;
          displayName: string;
          ButtonText: string;
          ShowTimer: boolean;
          HideCoreButton: boolean;
          AssetsFolderName: string;
          Variant: number;
        };
      };
      Multipliers: Array<{
        EnergyThreshold: number;
        AvailableMultipliers: number[];
      }>;
      multiplierId: string;
    };
    crmInfo: {
      active: unknown;
      future: unknown[];
    };
    timerInfo: {
      multiplierId: string;
      ttlSec: number;
      timerId: number;
    };
  };
  CrmFishesCampaigns: {
    active: unknown[];
    future: unknown[];
  };
  PopupTriggersInfo: {
    Triggers: Array<{
      ExtraData: {
        Cap: number;
      };
      Trigger: string;
    }>;
  };
  Puyf: unknown[];
  ActiveFlags: unknown[];
  ShortId: {
    Id: string;
    Link: string;
  };
  Options: {
    DTCToggle: boolean;
    ForceDTC: boolean;
    ForcePaymentMethod: string;
    DTCPurchasesToDirectFlow: number;
  };
  DTCParams: {
    DTCCounter: number;
    ForcePaymentMethod: string;
    DTCPurchasesToDirectFlow: number;
    DTC_Popup_first_appearance: number;
    IAP_Cooldown: number;
    SaveSelection_first_appearance: number;
    SaveSelection_cooldown_counter: number;
    IAP_Cooldown_counter: number;
    SaveSelection_cooldown: number;
  };
  DTCCounter: number;
  RefreshToken: string;
  RefreshTokenUsedForLogin: boolean;
}

export interface LoginResponse {
  status: number;
  response: {
    LoginStatus: number;
    LoginResponse: LoginResponseData;
  };
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

export const REWARD_RESOURCE_TYPES = {
  NONE: 0,
  COINS: 1,
  GEMS: 2,
  BOOSTERS: 3,
} as const;

export const REWARD_DEFINITION_TYPES = {
  REWARD: 1,
  PROMOTION: 2,
  EVENT: 3,
} as const;