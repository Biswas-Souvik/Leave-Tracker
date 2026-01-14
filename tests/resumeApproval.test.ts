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

  test('returns 400 when qeury string is missing', async () => {
    mockCreateResponse.mockReturnValueOnce({
      statusCode: 400,
      body: 'Missing token or status',
    });

    const res = await handler({} as any);

    expect(mockSend).not.toHaveBeenCalled();
    expect(mockCreateResponse).toHaveBeenCalledWith(
      'Missing token or status',
      400
    );
    expect(res.statusCode).toBe(400);
  });

  test('returns 400 when token or status is missing', async () => {
    mockCreateResponse.mockReturnValueOnce({
      statusCode: 400,
      body: 'Missing token or status',
    });

    const event = {
      queryStringParameters: {},
    };

    const res = await handler(event as any);

    expect(mockSend).not.toHaveBeenCalled();
    expect(mockCreateResponse).toHaveBeenCalledWith(
      'Missing token or status',
      400
    );
    expect(res.statusCode).toBe(400);
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

  test('sends task success for APPROVED', async () => {
    mockSend.mockResolvedValueOnce({});
    mockCreateResponse.mockReturnValueOnce({
      statusCode: 200,
      body: 'Leave approved',
    });

    const event = {
      queryStringParameters: {
        token: encodeURIComponent('task-token'),
        status: 'APPROVED',
      },
    };

    const res = await handler(event as any);

    expect(mockSend).toHaveBeenCalledTimes(1);

    const command = mockSend.mock.calls[0][0] as any;
    const input = command.input;

    expect(input.taskToken).toBe('task-token');
    expect(input.output).toBe(JSON.stringify({ decision: 'APPROVED' }));

    expect(mockCreateResponse).toHaveBeenCalledWith('Leave approved');
    expect(res.body).toBe('Leave approved');
  });

  test('sends task success for REJECTED', async () => {
    mockSend.mockResolvedValueOnce({});
    mockCreateResponse.mockReturnValueOnce({
      statusCode: 200,
      body: 'Leave rejected',
    });

    const event = {
      queryStringParameters: {
        token: encodeURIComponent('task-token'),
        status: 'REJECTED',
      },
    };

    const res = await handler(event as any);

    expect(mockSend).toHaveBeenCalledTimes(1);

    const command = mockSend.mock.calls[0][0] as any;
    const input = command.input;

    expect(input.taskToken).toBe('task-token');
    expect(input.output).toBe(JSON.stringify({ decision: 'REJECTED' }));

    expect(mockCreateResponse).toHaveBeenCalledWith('Leave rejected');
    expect(res.body).toBe('Leave rejected');
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
