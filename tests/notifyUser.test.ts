import { handler } from '../src/functions/notifyUser';
import { notifyUser } from '../src/utils/ses.utils';
import { createResponse } from '../src/utils/lambda.utils';

jest.mock('../src/utils/ses.utils');
jest.mock('../src/utils/lambda.utils');

describe('notifyUser handler', () => {
  const mockNotifyUser = notifyUser as jest.Mock;
  const mockCreateResponse = createResponse as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('returns 200 and notifies user for normal status', async () => {
    mockNotifyUser.mockResolvedValueOnce({ MessageId: '123' });
    mockCreateResponse.mockReturnValueOnce({
      statusCode: 200,
      body: 'Notified User',
    });

    const event = {
      status: 'APPROVED',
      data: {
        email: 'user@test.com',
        fromDate: '2026-01-01',
        toDate: '2026-01-03',
      },
    };

    const res = await handler(event);

    expect(mockNotifyUser).toHaveBeenCalledTimes(1);
    expect(mockNotifyUser).toHaveBeenCalledWith('APPROVED', event.data, '');

    expect(mockCreateResponse).toHaveBeenCalledWith('Notified User', 200);
    expect(res).toEqual({
      statusCode: 200,
      body: 'Notified User',
    });
  });

  test('adds timeout message when status is TIMED_OUT', async () => {
    mockNotifyUser.mockResolvedValueOnce({ MessageId: '456' });
    mockCreateResponse.mockReturnValueOnce({
      statusCode: 200,
      body: 'Notified User',
    });

    const event = {
      status: 'TIMED_OUT',
      data: {
        email: 'user@test.com',
        fromDate: '2026-01-01',
        toDate: '2026-01-03',
      },
    };

    await handler(event);

    expect(mockNotifyUser).toHaveBeenCalledWith(
      'TIMED_OUT',
      event.data,
      'No response received within 3 days.'
    );
  });

  test('returns 500 when notifyUser throws error', async () => {
    mockNotifyUser.mockRejectedValueOnce(new Error('SES failure'));
    mockCreateResponse.mockReturnValueOnce({
      statusCode: 500,
      body: 'Internal Server Error',
    });

    const event = {
      status: 'REJECTED',
      data: {
        email: 'user@test.com',
        fromDate: '2026-01-01',
        toDate: '2026-01-03',
      },
    };

    const res = await handler(event);

    expect(mockNotifyUser).toHaveBeenCalledTimes(1);
    expect(mockCreateResponse).toHaveBeenCalledWith(
      'Internal Server Error',
      500
    );
    expect(res).toEqual({
      statusCode: 500,
      body: 'Internal Server Error',
    });
  });
});
