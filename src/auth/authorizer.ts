import { Policy } from '../types';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET!;

export const handler = async (event: any) => {
  try {
    console.log(JSON.stringify(event, null, 2));
    const token = event.authorizationToken?.replace('Bearer ', '');
    if (!token) throw new Error('No token');

    jwt.verify(token, JWT_SECRET);

    return generatePolicy('user', 'Allow', event.methodArn);
  } catch (error: any) {
    console.error('Authorization failed', error.message);
    return generatePolicy('user', 'Deny', event.methodArn);
  }
};

const generatePolicy = (
  principalId: string,
  effect: 'Allow' | 'Deny',
  resource: string
): Policy => ({
  principalId,
  policyDocument: {
    Version: '2012-10-17',
    Statement: [
      {
        Action: 'execute-api:Invoke',
        Effect: effect,
        Resource: resource,
      },
    ],
  },
});
