import { LeaveRequest, NotifyUserData } from '../types';
import { getEnv } from '../utils/lambda.utils';
import { SESClient, SendTemplatedEmailCommand } from '@aws-sdk/client-ses';

const ses = new SESClient({});

const DECISION_API_BASE_URL = getEnv('DECISION_API_BASE_URL');
const SOURCE_EMAIL = getEnv('SOURCE_EMAIL');
const APPROVER_EMAIL = getEnv('APPROVER_EMAIL');

export async function sentLeaveRequestEmail(
  taskToken: string,
  leaveRequest: LeaveRequest
) {
  try {
    const encodedToken = encodeURIComponent(taskToken);
    const approveLink = `${DECISION_API_BASE_URL}?token=${encodedToken}&status=APPROVED`;
    const rejectLink = `${DECISION_API_BASE_URL}?token=${encodedToken}&status=REJECTED`;

    const resp = await ses.send(
      new SendTemplatedEmailCommand({
        Source: SOURCE_EMAIL,
        Destination: {
          ToAddresses: [APPROVER_EMAIL],
        },
        Template: 'LeaveApprovalRequestSouvik',
        TemplateData: JSON.stringify({
          employeeEmail: leaveRequest.email,
          fromDate: leaveRequest.fromDate,
          toDate: leaveRequest.toDate,
          reason: leaveRequest.reason,
          approveLink,
          rejectLink,
        }),
      })
    );
    return resp;
  } catch (err) {
    throw new Error('Error while sending Mail: ' + (err as Error).message);
  }
}

export async function notifyUser(
  status: string,
  data: NotifyUserData,
  message: string
) {
  try {
    const resp = await ses.send(
      new SendTemplatedEmailCommand({
        Source: SOURCE_EMAIL,
        Destination: {
          ToAddresses: [data.email],
        },
        Template: 'LeaveDecisionNotificationSouvik',
        TemplateData: JSON.stringify({
          status,
          fromDate: data.fromDate,
          toDate: data.toDate,
          message,
        }),
      })
    );
    return resp;
  } catch (err) {
    throw new Error(`Error Notifying User.\n${(err as Error).message}`);
  }
}
