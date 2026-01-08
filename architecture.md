User
│
▼
API Gateway (AWS integration)
│
▼
Step Functions ───────────▶ Lambda (email, logic)
│
│ WAIT (callback, 3 days)
│
▼
API Gateway
│
▼
Lambda (resume execution)
│
▼
Step Functions
│
▼
Lambda (notify user)
