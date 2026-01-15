export function createResponse(body: string, statusCode: number = 200) {
  return {
    body,
    statusCode,
  };
}

export function isValidLeaveRequest(obj: any): boolean {
  return Boolean(
    obj &&
      typeof obj === 'object' &&
      Object.keys(obj).length > 0 &&
      typeof obj.email === 'string' &&
      typeof obj.fromDate === 'string' &&
      typeof obj.toDate === 'string' &&
      typeof obj.reason === 'string'
  );
}

export function getEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`${key} is required`);
  }
  return value;
}
