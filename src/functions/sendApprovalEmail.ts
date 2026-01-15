import { sentLeaveRequestEmail } from '../utils/ses.utils';
import { createResponse, isValidLeaveRequest } from '../utils/lambda.utils';
import { StartApprovalEvent } from '../types';

export const handler = async (event: StartApprovalEvent) => {
  try {
    console.log(JSON.stringify(event, null, 2));
    const { taskToken, leaveRequest } = event;
    if (!taskToken || !leaveRequest)
      return createResponse('Tasktoken and Leave Request are required.', 400);

    if (!isValidLeaveRequest(leaveRequest))
      return createResponse(
        'email, fromdate, todate, reason are required',
        400
      );

    const resp = await sentLeaveRequestEmail(taskToken, leaveRequest);
    console.log(resp);

    return createResponse('Email sent to Approver');
  } catch (err) {
    console.error(
      'Error sending mail to Approver. Reason: ' + (err as Error).message
    );
    return createResponse('Internal Server Error', 500);
  }
};
