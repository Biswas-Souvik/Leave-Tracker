import { createResponse, isValidLeaveRequest } from '../src/utils/lambda.utils';

describe('createResponse', () => {
  it('returns response with default statusCode 200', () => {
    const result = createResponse('ok');

    expect(result).toEqual({
      body: 'ok',
      statusCode: 200,
    });
  });

  it('returns response with provided statusCode', () => {
    const result = createResponse('bad request', 400);

    expect(result).toEqual({
      body: 'bad request',
      statusCode: 400,
    });
  });
});

describe('isValidLeaveRequest', () => {
  it('returns true for valid leave request object', () => {
    const input = {
      email: 'test@example.com',
      fromDate: '2025-01-01',
      toDate: '2025-01-02',
      reason: 'Vacation',
    };

    expect(isValidLeaveRequest(input)).toBe(true);
  });

  it('returns false when input is null', () => {
    const output = isValidLeaveRequest(null);
    console.log(output);
    expect(output).toBe(false);
  });

  it('returns false when input is undefined', () => {
    expect(isValidLeaveRequest(undefined)).toBe(false);
  });

  it('returns false when input is not an object', () => {
    expect(isValidLeaveRequest('string')).toBe(false);
    expect(isValidLeaveRequest(123)).toBe(false);
    expect(isValidLeaveRequest(true)).toBe(false);
  });

  it('returns false when object is empty', () => {
    expect(isValidLeaveRequest({})).toBe(false);
  });

  it('returns false when email is missing or not a string', () => {
    const input = {
      fromDate: '2025-01-01',
      toDate: '2025-01-02',
      reason: 'Vacation',
    };

    expect(isValidLeaveRequest(input)).toBe(false);

    expect(
      isValidLeaveRequest({
        ...input,
        email: 123,
      })
    ).toBe(false);
  });

  it('returns false when fromDate is missing or not a string', () => {
    const input = {
      email: 'test@example.com',
      toDate: '2025-01-02',
      reason: 'Vacation',
    };

    expect(isValidLeaveRequest(input)).toBe(false);

    expect(
      isValidLeaveRequest({
        ...input,
        fromDate: 123,
      })
    ).toBe(false);
  });

  it('returns false when toDate is missing or not a string', () => {
    const input = {
      email: 'test@example.com',
      fromDate: '2025-01-01',
      reason: 'Vacation',
    };

    expect(isValidLeaveRequest(input)).toBe(false);

    expect(
      isValidLeaveRequest({
        ...input,
        toDate: {},
      })
    ).toBe(false);
  });

  it('returns false when reason is missing or not a string', () => {
    const input = {
      email: 'test@example.com',
      fromDate: '2025-01-01',
      toDate: '2025-01-02',
    };

    expect(isValidLeaveRequest(input)).toBe(false);

    expect(
      isValidLeaveRequest({
        ...input,
        reason: [],
      })
    ).toBe(false);
  });
});
