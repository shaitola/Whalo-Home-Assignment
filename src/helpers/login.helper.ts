import { v4 as uuidv4 } from 'uuid';
import { config, getFullUrl } from './config.helper';
import { LoginResponse, UserBalance } from '../types/api.types';

export interface LoginResult {
  accessToken: string;
  userBalance: UserBalance;
  deviceId: string;
  loginSource: string;
  accountCreated: boolean;
}

export async function login(): Promise<LoginResult> {
  const deviceId = `${config.test.devicePrefix}_${uuidv4()}`;
  const loginSource = `${config.test.loginSourcePrefix}_${config.test.candidateName}_${uuidv4().slice(0, 8)}`;

  const loginUrl = getFullUrl(config.api.loginEndpoint);

  const response = await fetch(loginUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      DeviceId: deviceId,
      LoginSource: loginSource,
    }),
  });

  const status = response.status;
  const body: LoginResponse = await response.json() as LoginResponse;

  if (status !== 200) {
    throw new Error(`Login failed with status ${status}. Body: ${JSON.stringify(body)}`);
  }

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
    deviceId,
    loginSource,
    accountCreated: body.response.LoginResponse.AccountCreated ?? false,
  };
}

export async function loginWithDeviceId(deviceId: string, loginSource: string): Promise<LoginResult> {
  const loginUrl = getFullUrl(config.api.loginEndpoint);

  const response = await fetch(loginUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      DeviceId: deviceId,
      LoginSource: loginSource,
    }),
  });

  const status = response.status;
  const body: LoginResponse = await response.json() as LoginResponse;

  if (status !== 200) {
    throw new Error(`Login failed with status ${status}. Body: ${JSON.stringify(body)}`);
  }

  if (body.status !== 0) {
    throw new Error(`Login returned non-zero status: ${body.status}`);
  }

  return {
    accessToken: body.response.LoginResponse.AccessToken,
    userBalance: body.response.LoginResponse.UserBalance,
    deviceId,
    loginSource,
    accountCreated: body.response.LoginResponse.AccountCreated ?? false,
  };
}
