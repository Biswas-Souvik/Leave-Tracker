import { handler } from '../src/functions/resumeApproval';
import { createResponse } from '../src/utils/lambda.utils';
import { SFNClient } from '@aws-sdk/client-sfn';

jest.mock('../src/utils/lambda.utils');

jest.mock('@aws-sdk/client-sfn', () => ({
  SFNClient: jest.fn(),
  SendTaskSuccessCommand: jest.fn((input) => ({
    input,
  })),
}));

describe('resumeApproval handler', () => {
  const mockSend = jest.fn();
  const mockCreateResponse = createResponse as jest.Mock;

  beforeAll(() => {
    SFNClient.prototype.send = mockSend;
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('returns 400 for invalid query parameters', () => {
    test.each([
      {
        name: 'query string is missing',
        event: {},
      },
      {
        name: 'token or status is missing',
        event: { queryStringParameters: {} },
      },
    ])('$name', async ({ event }) => {
      mockCreateResponse.mockReturnValueOnce({
        statusCode: 400,
        body: 'Missing token or status',
      });

      const res = await handler(event as unknown as any);

      expect(mockSend).not.toHaveBeenCalled();
      expect(mockCreateResponse).toHaveBeenCalledWith(
        'Missing token or status',
        400
      );
      expect(res.statusCode).toBe(400);
    });
  });

  test('returns 400 for invalid status', async () => {
    mockCreateResponse.mockReturnValueOnce({
      statusCode: 400,
      body: 'Invalid Status',
    });

    const event = {
      queryStringParameters: {
        token: 'abc',
        status: 'PENDING',
      },
    };

    const res = await handler(event as any);

    expect(mockSend).not.toHaveBeenCalled();
    expect(mockCreateResponse).toHaveBeenCalledWith('Invalid Status', 400);
    expect(res.statusCode).toBe(400);
  });

  describe('handler task success', () => {
    test.each([
      {
        status: 'APPROVED',
        responseBody: 'Leave approved',
        decision: 'APPROVED',
      },
      {
        status: 'REJECTED',
        responseBody: 'Leave rejected',
        decision: 'REJECTED',
      },
    ])(
      'sends task success for $status',
      async ({ status, responseBody, decision }) => {
        mockSend.mockResolvedValueOnce({});
        mockCreateResponse.mockReturnValueOnce({
          statusCode: 200,
          body: responseBody,
        });

        const event = {
          queryStringParameters: {
            token: encodeURIComponent('task-token'),
            status,
          },
        };

        const res = await handler(event as any);

        expect(mockSend).toHaveBeenCalledTimes(1);

        const command = mockSend.mock.calls[0][0] as any;
        const input = command.input;

        expect(input.taskToken).toBe('task-token');
        expect(input.output).toBe(JSON.stringify({ decision }));

        expect(mockCreateResponse).toHaveBeenCalledWith(responseBody);
        expect(res.body).toBe(responseBody);
      }
    );
  });

  test('returns 500 when SFN send fails', async () => {
    mockSend.mockRejectedValueOnce(new Error('SFN failure'));
    mockCreateResponse.mockReturnValueOnce({
      statusCode: 500,
      body: 'Internal Server Error',
    });

    const event = {
      queryStringParameters: {
        token: encodeURIComponent('task-token'),
        status: 'APPROVED',
      },
    };

    const res = await handler(event as any);

    expect(mockSend).toHaveBeenCalledTimes(1);
    expect(mockCreateResponse).toHaveBeenCalledWith(
      'Internal Server Error',
      500
    );
    expect(res.statusCode).toBe(500);
  });
});
