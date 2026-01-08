import { NotifyUserEvent } from '../types';
import { createResponse } from '../utils/lambda.utils';
import { notifyUser } from '../utils/ses.utils';

export const handler = async (event: NotifyUserEvent) => {
  try {
    const { status, data } = event;
    console.log(event);

    let message = '';
    if (status === 'TIMED_OUT') {
      message = 'No response received within 3 days.';
    }
    const resp = await notifyUser(status, data, message);
    console.log(resp);
    return createResponse('Notified User', 200);
  } catch (err) {
    console.log('Error Notifying User: ' + (err as Error).message);
    return createResponse('Internal Server Error', 500);
  }
};
