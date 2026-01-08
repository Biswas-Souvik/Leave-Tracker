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
