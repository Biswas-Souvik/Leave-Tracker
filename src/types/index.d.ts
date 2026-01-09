export interface LeaveRequest {
  email: string;
  fromDate: string;
  toDate: string;
  reason: string;
}

export interface StartApprovalEvent {
  taskToken: string;
  leaveRequest: LeaveRequest;
}

export interface ResumeApprovalEvent {
  queryStringParameters: { token: string; status: string };
}

export interface NotifyUserData {
  email: string;
  fromDate: string;
  toDate: string;
}

export interface NotifyUserEvent {
  status: string;
  data: NotifyUserData;
}

export interface PolicyStatement {
  Action: string;
  Effect: 'Allow' | 'Deny';
  Resource: string;
}

export interface PolicyDocument {
  Version: string;
  Statement: PolicyStatement[];
}

export interface Policy {
  principalId: string;
  policyDocument: PolicyDocument;
}
