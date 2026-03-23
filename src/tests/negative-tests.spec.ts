import { test, expect } from '@playwright/test';
import { spinWithInvalidToken, spinWithMalformedPayload, spinAfterDrain } from '../helpers/negative.helper';
import { login } from '../helpers/login.helper';
import { spinWheel } from '../helpers/wheel.helper';

test.describe('Negative Tests', () => {

  test('should return non-zero status for invalid access token', async () => {
    const result = await spinWithInvalidToken('invalid_token_12345');
    
    expect(result.status).toBe(200);
    expect(result.errorStatus).not.toBe(0);
  });

  test('should return non-zero status for malformed request body', async () => {
    const loginResult = await login();
    const result = await spinWithMalformedPayload(loginResult.accessToken);
    
    expect(result.status).toBe(200);
    expect(result.errorStatus).not.toBe(0);
  });

  test('should return error when spinning with no energy', async () => {
    const loginResult = await login();
    let accessToken = loginResult.accessToken;
    let currentEnergy = loginResult.userBalance.Energy;

    while (currentEnergy > 0) {
      const spinResult = await spinWheel(accessToken);
      currentEnergy = spinResult.response.response.SpinResult.UserBalance.Energy;
    }

    const result = await spinAfterDrain(accessToken);
    expect(result.status).toBe(200);
    expect(result.errorStatus).not.toBe(0);
  });

});
