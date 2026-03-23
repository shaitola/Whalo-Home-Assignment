import { getFullUrl, config } from './config.helper';
import { WheelSpinResponse } from '../types/api.types';

export interface ApiErrorResult {
  status: number;
  errorStatus: number;
}

export async function spinWithInvalidToken(token: string): Promise<ApiErrorResult> {
  const spinUrl = getFullUrl(config.api.wheelSpinEndpoint);

  const response = await fetch(spinUrl, {
    method: 'POST',
    headers: {
      'accessToken': token,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      multiplier: 1,
    }),
  });

  const body = await response.json() as WheelSpinResponse;

  return {
    status: response.status,
    errorStatus: body.status,
  };
}

export async function spinWithMalformedPayload(token: string): Promise<ApiErrorResult> {
  const spinUrl = getFullUrl(config.api.wheelSpinEndpoint);

  const response = await fetch(spinUrl, {
    method: 'POST',
    headers: {
      'accessToken': token,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      multiplier: 'not_a_number',
    }),
  });

  const body = await response.json() as WheelSpinResponse;

  return {
    status: response.status,
    errorStatus: body.status,
  };
}

export async function spinAfterDrain(token: string): Promise<ApiErrorResult> {
  const spinUrl = getFullUrl(config.api.wheelSpinEndpoint);

  const response = await fetch(spinUrl, {
    method: 'POST',
    headers: {
      'accessToken': token,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      multiplier: 1,
    }),
  });

  const body = await response.json() as WheelSpinResponse;

  return {
    status: response.status,
    errorStatus: body.status,
  };
}
