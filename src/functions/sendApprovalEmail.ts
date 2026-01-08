import { sentLeaveRequestEmail } from '../utils/ses.utils';
import { createResponse, isValidLeaveRequest } from '../utils/lambda.utils';
import { StartApprovalEvent, LeaveRequest } from '../types';

export const handler = async (event: StartApprovalEvent) => {
  try {
    const { taskToken, leaveRequest } = event;
    if (!taskToken || !leaveRequest)
      return createResponse('Tasktoken and Leave Request are required.', 400);

    if (!isValidLeaveRequest(leaveRequest))
      return createResponse('email, fromdate, todate, reason are required');

    const resp = await sentLeaveRequestEmail(taskToken, leaveRequest);
    console.log(resp);

    return createResponse('Email sent to Approver');
  } catch (err) {
    console.error('Internal Server Error' + (err as Error).message);
  }
};
