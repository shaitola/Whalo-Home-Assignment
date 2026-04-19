import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

export const config = {
  api: {
    baseUrl: process.env.API_BASE_URL || 'https://fof-devplayground-api.whalosvc.com',
    loginEndpoint: process.env.API_LOGIN_ENDPOINT || '/api/frontend/login/v4/login',
    wheelSpinEndpoint: process.env.API_WHEEL_SPIN_ENDPOINT || '/api/frontend/wheel//v1',
  },
  test: {
    devicePrefix: process.env.TEST_DEVICE_PREFIX || 'candidate_test',
    loginSourcePrefix: process.env.TEST_LOGIN_SOURCE_PREFIX || 'test',
    candidateName: process.env.CANDIDATE_NAME || 'candidate',
    candidatePhone: process.env.TEST_CANDIDATE_PHONE || '05XXXXXXXXX',
    spinMultiplier: 1,
    energyCostPerSpin: 1,
  },
};
