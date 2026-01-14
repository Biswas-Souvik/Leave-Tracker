process.env.JWT_SECRET = 'test-secret';

import { handler } from '../src/auth/authorizer';
import { verify } from 'jsonwebtoken';

jest.mock('jsonwebtoken', () => ({
  verify: jest.fn(),
}));

const mockedVerify = verify as jest.Mock;

describe('Authorizer handler', () => {
  const METHOD_ARN =
    'arn:aws:execute-api:ap-south-1:123456789012/apiId/stage/GET/resource';

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_SECRET = 'test-secret';
  });

  it('should allow request when token is valid', async () => {
    mockedVerify.mockReturnValue({ userId: '123' } as any);

    const event = {
      authorizationToken: 'Bearer valid.token.here',
      methodArn: METHOD_ARN,
    };

    const result = await handler(event);

    expect(mockedVerify).toHaveBeenCalledWith(
      'valid.token.here',
      'test-secret'
    );

    expect(result.policyDocument.Statement[0].Effect).toBe('Allow');
  });

  it('should deny request when authorization token is missing', async () => {
    const event = {
      methodArn: METHOD_ARN,
    };

    const result = await handler(event);

    expect(mockedVerify).not.toHaveBeenCalled();

    expect(result.policyDocument.Statement[0].Effect).toBe('Deny');
  });

  it('should deny request when token is invalid', async () => {
    mockedVerify.mockImplementation(() => {
      throw new Error('Invalid token');
    });

    const event = {
      authorizationToken: 'Bearer invalid.token',
      methodArn: METHOD_ARN,
    };

    const result = await handler(event);

    expect(mockedVerify).toHaveBeenCalled();

    expect(result.policyDocument.Statement[0].Effect).toBe('Deny');
  });

  it('should deny request if verify throws unknown error', async () => {
    mockedVerify.mockImplementation(() => {
      throw new Error('Unexpected error');
    });

    const event = {
      authorizationToken: 'Bearer some.token',
      methodArn: METHOD_ARN,
    };

    const result = await handler(event);

    expect(result.policyDocument.Statement[0].Effect).toBe('Deny');
  });
});
