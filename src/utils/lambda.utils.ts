export function createResponse(body: string, statusCode: number = 200) {
  return {
    body,
    statusCode,
  };
}

export function isValidLeaveRequest(obj: any): boolean {
  return (
    obj &&
    typeof obj === 'object' &&
    Object.keys(obj).length > 0 &&
    typeof obj.email === 'string' &&
    typeof obj.fromDate === 'string' &&
    typeof obj.toDate === 'string' &&
    typeof obj.reason === 'string'
  );
}
