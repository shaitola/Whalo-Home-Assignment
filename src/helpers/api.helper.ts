import { APIRequestContext, request as createRequest } from '@playwright/test';
import { config } from './config.helper';
import { LoginResponse, WheelSpinResponse } from '../types/api.types';

let requestContext: APIRequestContext | null = null;

export async function getRequestContext(): Promise<APIRequestContext> {
  if (!requestContext) {
    requestContext = await createRequest.newContext({
      baseURL: config.api.baseUrl,
    });
  }
  return requestContext;
}

export interface ApiOptions {
  headers?: Record<string, string>;
  data?: object;
}

export async function apiPost<T = unknown>(endpoint: string, options: ApiOptions = {}): Promise<T> {
  const request = await getRequestContext();
  const response = await request.post(endpoint, {
    headers: options.headers,
    data: options.data,
  });

  const body = await response.json() as T;

  return body;
}

export async function apiPostWithStatusCheck<T = unknown>(
  endpoint: string,
  options: ApiOptions = {},
  expectedStatus: number = 200
): Promise<T> {
  const request = await getRequestContext();
  const response = await request.post(endpoint, {
    headers: options.headers,
    data: options.data,
  });

  const body = await response.json() as T;

  if (response.status() !== expectedStatus) {
    throw new Error(`API call failed with status ${response.status()}. Body: ${JSON.stringify(body)}`);
  }

  return body;
}

export type { APIRequestContext, APIResponse } from '@playwright/test';