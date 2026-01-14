process.env.DECISION_API_BASE_URL = 'https://example.com/decision';
process.env.SOURCE_EMAIL = 'no-reply@test.com';
process.env.APPROVER_EMAIL = 'approver@test.com';

import { sentLeaveRequestEmail, notifyUser } from '../src/utils/ses.utils';
import { SESClient } from '@aws-sdk/client-ses';

jest.mock('@aws-sdk/client-ses', () => ({
  SESClient: jest.fn(),
  SendTemplatedEmailCommand: jest.fn((input) => ({
    input,
  })),
}));

describe('email.service', () => {
  const mockSend = jest.fn();

  beforeAll(() => {
    SESClient.prototype.send = mockSend;
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('sentLeaveRequestEmail', () => {
    const leaveRequest = {
      email: 'employee@test.com',
      fromDate: '2026-01-01',
      toDate: '2026-01-03',
      reason: 'Vacation',
    };

    test('sends approval email successfully', async () => {
      mockSend.mockResolvedValueOnce({ MessageId: '123' });

      const token = 'token with spaces';
      const res = await sentLeaveRequestEmail(token, leaveRequest);

      expect(res).toEqual({ MessageId: '123' });
      expect(mockSend).toHaveBeenCalledTimes(1);

      const command = mockSend.mock.calls[0][0] as any;

      const input = command.input;

      expect(input.Template).toBe('LeaveApprovalRequestSouvik');
      expect(input.Source).toBe('no-reply@test.com');
      expect(input.Destination.ToAddresses).toEqual(['approver@test.com']);

      const templateData = JSON.parse(input.TemplateData);

      expect(templateData).toMatchObject({
        employeeEmail: leaveRequest.email,
        fromDate: leaveRequest.fromDate,
        toDate: leaveRequest.toDate,
        reason: leaveRequest.reason,
      });

      expect(templateData.approveLink).toContain(encodeURIComponent(token));
      expect(templateData.rejectLink).toContain(encodeURIComponent(token));
    });

    test('throws error when SES fails', async () => {
      mockSend.mockRejectedValueOnce(new Error('SES error'));

      await expect(
        sentLeaveRequestEmail('token', leaveRequest)
      ).rejects.toThrow('Error while sending Mail: SES error');
    });
  });

  describe('notifyUser', () => {
    const notifyData = {
      email: 'employee@test.com',
      fromDate: '2026-01-01',
      toDate: '2026-01-03',
    };

    test('sends notification email successfully', async () => {
      mockSend.mockResolvedValueOnce({ MessageId: '456' });

      const res = await notifyUser(
        'APPROVED',
        notifyData,
        'Your leave is approved'
      );

      expect(res).toEqual({ MessageId: '456' });
      expect(mockSend).toHaveBeenCalledTimes(1);

      const command = mockSend.mock.calls[0][0] as any;
      const input = command.input;

      expect(input.Template).toBe('LeaveDecisionNotificationSouvik');
      expect(input.Destination.ToAddresses).toEqual(['employee@test.com']);

      const templateData = JSON.parse(input.TemplateData);

      expect(templateData).toEqual({
        status: 'APPROVED',
        fromDate: notifyData.fromDate,
        toDate: notifyData.toDate,
        message: 'Your leave is approved',
      });
    });

    test('throws error when SES fails', async () => {
      mockSend.mockRejectedValueOnce(new Error('SES failure'));

      await expect(
        notifyUser('REJECTED', notifyData, 'Rejected')
      ).rejects.toThrow('Error Notifying User.');
    });
  });
});
