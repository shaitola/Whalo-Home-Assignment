import { v4 as uuidv4 } from 'uuid';
import { config } from './config.helper';
import { apiPostWithStatusCheck } from './api.helper';
import { LoginResponse, UserBalance } from '../types/api.types';

export interface LoginResult {
  accessToken: string;
  userBalance: UserBalance;
  deviceId: string;
  loginSource: string;
  accountCreated: boolean;
  rawResponse?: LoginResponse;
}

export async function login(deviceId?: string, loginSource?: string): Promise<LoginResult> {
  const finalDeviceId = deviceId ?? `${config.test.devicePrefix}_${uuidv4()}`;
  const finalLoginSource = loginSource ?? `${config.test.loginSourcePrefix}_${config.test.candidatePhone}_${uuidv4().slice(0, 8)}`;

  const body = await apiPostWithStatusCheck<LoginResponse>(config.api.loginEndpoint, {
    headers: { 'Content-Type': 'application/json' },
    data: { DeviceId: finalDeviceId, LoginSource: finalLoginSource },
  });

  if (body.status !== 0) {
    throw new Error(`Login returned non-zero status: ${body.status}`);
  }

  if (!body.response?.LoginResponse?.AccessToken) {
    throw new Error('Login response missing AccessToken');
  }

  if (!body.response?.LoginResponse?.UserBalance) {
    throw new Error('Login response missing UserBalance');
  }

  return {
    accessToken: body.response.LoginResponse.AccessToken,
    userBalance: body.response.LoginResponse.UserBalance,
    deviceId: finalDeviceId,
    loginSource: finalLoginSource,
    accountCreated: body.response.LoginResponse.AccountCreated ?? false,
    rawResponse: body,
  };
}
