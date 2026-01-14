import { handler } from '../src/functions/sendApprovalEmail';
import { createResponse, isValidLeaveRequest } from '../src/utils/lambda.utils';
import { sentLeaveRequestEmail } from '../src/utils/ses.utils';

jest.mock('../src/utils/ses.utils');
jest.mock('../src/utils/lambda.utils');

describe('startApproval handler', () => {
  const mockSendLeaveRequestEmail = sentLeaveRequestEmail as jest.Mock;
  const mockCreateResponse = createResponse as jest.Mock;
  const mockIsValidLeaveRequest = isValidLeaveRequest as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('returns 400 when taskToken or leaveRequest is missing', async () => {
    mockCreateResponse.mockReturnValueOnce({
      statusCode: 400,
      body: 'Tasktoken and Leave Request are required.',
    });

    const event = {};

    const res = await handler(event as any);

    expect(mockSendLeaveRequestEmail).not.toHaveBeenCalled();
    expect(mockCreateResponse).toHaveBeenCalledWith(
      'Tasktoken and Leave Request are required.',
      400
    );
    expect(res.statusCode).toBe(400);
  });

  test('returns 400 when leaveRequest is invalid', async () => {
    mockIsValidLeaveRequest.mockReturnValueOnce(false);
    mockCreateResponse.mockReturnValueOnce({
      statusCode: 400,
      body: 'email, fromdate, todate, reason are required',
    });

    const event = {
      taskToken: 'token',
      leaveRequest: {},
    };

    const res = await handler(event as any);

    expect(mockIsValidLeaveRequest).toHaveBeenCalledWith(event.leaveRequest);
    expect(mockSendLeaveRequestEmail).not.toHaveBeenCalled();
    expect(mockCreateResponse).toHaveBeenCalledWith(
      'email, fromdate, todate, reason are required',
      400
    );
    expect(res.statusCode).toBe(400);
  });

  test('sends email and returns success when input is valid', async () => {
    mockIsValidLeaveRequest.mockReturnValueOnce(true);
    mockSendLeaveRequestEmail.mockResolvedValueOnce({
      MessageId: '123',
    });
    mockCreateResponse.mockReturnValueOnce({
      statusCode: 200,
      body: 'Email sent to Approver',
    });

    const leaveRequest = {
      email: 'user@test.com',
      fromDate: '2026-01-01',
      toDate: '2026-01-03',
      reason: 'Vacation',
    };

    const event = {
      taskToken: 'task-token',
      leaveRequest,
    };

    const res = await handler(event as any);

    expect(mockIsValidLeaveRequest).toHaveBeenCalledWith(leaveRequest);
    expect(mockSendLeaveRequestEmail).toHaveBeenCalledWith(
      'task-token',
      leaveRequest
    );
    expect(mockCreateResponse).toHaveBeenCalledWith('Email sent to Approver');
    expect(res.body).toBe('Email sent to Approver');
  });

  test('returns 500 when sentLeaveRequestEmail throws error', async () => {
    mockIsValidLeaveRequest.mockReturnValueOnce(true);
    mockSendLeaveRequestEmail.mockRejectedValueOnce(new Error('SES failure'));
    mockCreateResponse.mockReturnValueOnce({
      statusCode: 500,
      body: 'Internal Server Error',
    });

    const event = {
      taskToken: 'task-token',
      leaveRequest: {
        email: 'user@test.com',
        fromDate: '2026-01-01',
        toDate: '2026-01-03',
        reason: 'Vacation',
      },
    };

    const res = await handler(event as any);

    expect(mockSendLeaveRequestEmail).toHaveBeenCalledTimes(1);
    expect(mockCreateResponse).toHaveBeenCalledWith(
      'Internal Server Error',
      500
    );
    expect(res.statusCode).toBe(500);
  });
});
