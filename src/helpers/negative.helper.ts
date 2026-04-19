import { config } from './config.helper';
import { apiPost } from './api.helper';
import { WheelSpinResponse } from '../types/api.types';

export interface ApiErrorResult {
  status: number;
  errorStatus: number;
}

async function spinWithError(token: string, payload: object): Promise<ApiErrorResult> {
  const body = await apiPost<WheelSpinResponse>(config.api.wheelSpinEndpoint, {
    headers: { 'accessToken': token },
    data: payload,
  });

  return {
    status: 200, 
    errorStatus: body.status,
  };
}

export const spinWithInvalidToken = (token: string) => spinWithError(token, { multiplier: 1 });
export const spinWithMalformedPayload = (token: string) => spinWithError(token, { multiplier: 'not_a_number' });
export const spinAfterDrain = (token: string) => spinWithError(token, { multiplier: 1 });
