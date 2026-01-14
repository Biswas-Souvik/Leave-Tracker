import { createResponse } from '../utils/lambda.utils';
import { ResumeApprovalEvent } from '../types';

import { SFNClient, SendTaskSuccessCommand } from '@aws-sdk/client-sfn';

const sfn = new SFNClient({});

export const handler = async (event: ResumeApprovalEvent) => {
  try {
    console.log(JSON.stringify(event, null, 2));
    const allowedStatus = ['APPROVED', 'REJECTED'];
    const { token, status } = event.queryStringParameters ?? {};
    if (!token || !status)
      return createResponse('Missing token or status', 400);

    if (!allowedStatus.includes(status)) {
      return createResponse('Invalid Status', 400);
    }
    const taskToken = decodeURIComponent(token);

    await sfn.send(
      new SendTaskSuccessCommand({
        taskToken: taskToken,
        output: JSON.stringify({ decision: status }),
      })
    );

    return createResponse(`Leave ${status.toLowerCase()}`);
  } catch (err) {
    console.error('Error Approving: ' + (err as Error).message);
    return createResponse('Internal Server Error', 500);
  }
};
