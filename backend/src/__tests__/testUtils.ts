import { APIGatewayProxyEvent, Context } from "aws-lambda";

export const createMockEvent = (
  body?: Record<string, unknown>,
  pathParameters?: Record<string, string> | null,
  httpMethod: string = "GET",
): APIGatewayProxyEvent => ({
  body: body ? JSON.stringify(body) : null,
  headers: {},
  multiValueHeaders: {},
  httpMethod,
  isBase64Encoded: false,
  path: "",
  pathParameters,
  queryStringParameters: null,
  multiValueQueryStringParameters: null,
  stageVariables: null,
  requestContext: {
    accountId: "test",
    apiId: "test",
    authorizer: {},
    httpMethod,
    identity: {
      accessKey: null,
      accountId: null,
      apiKey: null,
      apiKeyId: null,
      caller: null,
      clientCert: null,
      cognitoAuthenticationProvider: null,
      cognitoAuthenticationType: null,
      cognitoIdentityId: null,
      cognitoIdentityPoolId: null,
      principalOrgId: null,
      sourceIp: "127.0.0.1",
      user: null,
      userAgent: "test-agent",
      userArn: null,
    },
    path: "",
    protocol: "HTTP/1.1",
    requestId: "test-request-id",
    requestTime: "01/Jan/2023:00:00:00 +0000",
    requestTimeEpoch: 1672531200000,
    resourceId: "test",
    resourcePath: "",
    stage: "test",
  },
  resource: "",
});

export const createMockContext = (): Context => ({
  callbackWaitsForEmptyEventLoop: false,
  functionName: "test-function",
  functionVersion: "1",
  invokedFunctionArn:
    "arn:aws:lambda:us-east-1:123456789012:function:test-function",
  memoryLimitInMB: "128",
  awsRequestId: "test-request-id",
  logGroupName: "/aws/lambda/test-function",
  logStreamName: "2023/01/01/[$LATEST]test",
  getRemainingTimeInMillis: () => 30000,
  done: () => {},
  fail: () => {},
  succeed: () => {},
});

export const mockDynamoDBResponse = (
  items: Record<string, unknown>[] = [],
) => ({
  Items: items.map((item) => ({
    id: { S: item.id },
    name: { S: item.name },
    ...Object.keys(item).reduce(
      (acc, key) => {
        if (key !== "id" && key !== "name") {
          if (typeof item[key] === "number") {
            acc[key] = { N: item[key].toString() };
          } else if (typeof item[key] === "string") {
            acc[key] = { S: item[key] };
          } else {
            acc[key] = { S: JSON.stringify(item[key]) };
          }
        }
        return acc;
      },
      {} as Record<string, unknown>,
    ),
  })),
});
