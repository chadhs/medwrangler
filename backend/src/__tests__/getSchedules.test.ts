import { APIGatewayProxyResult } from "aws-lambda";
import { createMockEvent, createMockContext } from "./testUtils";

const mockSend = jest.fn();

// Mock the AWS SDK
jest.mock("@aws-sdk/client-dynamodb", () => ({
  DynamoDBClient: jest.fn().mockImplementation(() => ({
    send: mockSend,
  })),
  ScanCommand: jest.fn().mockImplementation((params) => ({ input: params })),
}));

// Mock util-dynamodb
jest.mock("@aws-sdk/util-dynamodb", () => ({
  unmarshall: jest.fn((item: Record<string, unknown>) => {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(item)) {
      if (typeof value === "object" && value !== null) {
        const dynamoValue = value as Record<string, unknown>;
        if (dynamoValue.S) result[key] = dynamoValue.S;
        else if (dynamoValue.N) result[key] = dynamoValue.N;
        else result[key] = dynamoValue;
      }
    }
    return result;
  }),
}));

// Import after mocking
import { handler } from "../functions/getSchedules";

describe("getSchedules", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return all schedules successfully", async () => {
    const mockScheduleItems = [
      {
        id: { S: "schedule-1" },
        medId: { S: "med-1" },
        frequency: { N: "8" },
        startTime: { S: "2023-01-01T08:00:00.000Z" },
        days: { S: "[0,1,2,3,4,5,6]" },
      },
      {
        id: { S: "schedule-2" },
        medId: { S: "med-2" },
        frequency: { N: "12" },
        startTime: { S: "2023-01-01T08:00:00.000Z" },
        days: { S: "[1,3,5]" },
      },
    ];

    mockSend.mockResolvedValue({ Items: mockScheduleItems });

    const event = createMockEvent();
    const context = createMockContext();

    const result = (await handler(
      event,
      context,
      () => {},
    )) as APIGatewayProxyResult;

    expect(result.statusCode).toBe(200);
    const body = JSON.parse(result.body);
    expect(body).toHaveLength(2);
    expect(body[0]).toEqual({
      id: "schedule-1",
      medId: "med-1",
      frequency: 8,
      startTime: "2023-01-01T08:00:00.000Z",
      days: [0, 1, 2, 3, 4, 5, 6],
    });
    expect(body[1]).toEqual({
      id: "schedule-2",
      medId: "med-2",
      frequency: 12,
      startTime: "2023-01-01T08:00:00.000Z",
      days: [1, 3, 5],
    });
  });

  it("should return empty array when no schedules exist", async () => {
    mockSend.mockResolvedValue({ Items: [] });

    const event = createMockEvent();
    const context = createMockContext();

    const result = (await handler(
      event,
      context,
      () => {},
    )) as APIGatewayProxyResult;

    expect(result.statusCode).toBe(200);
    expect(JSON.parse(result.body)).toEqual([]);
  });

  it("should handle schedules with missing days field", async () => {
    const mockScheduleItems = [
      {
        id: { S: "schedule-1" },
        medId: { S: "med-1" },
        frequency: { N: "8" },
        startTime: { S: "2023-01-01T08:00:00.000Z" },
      },
    ];

    mockSend.mockResolvedValue({ Items: mockScheduleItems });

    const event = createMockEvent();
    const context = createMockContext();

    const result = (await handler(
      event,
      context,
      () => {},
    )) as APIGatewayProxyResult;

    expect(result.statusCode).toBe(200);
    const body = JSON.parse(result.body);
    expect(body[0].days).toEqual([]);
  });

  it("should handle DynamoDB errors", async () => {
    mockSend.mockRejectedValue(new Error("DynamoDB error"));

    const event = createMockEvent();
    const context = createMockContext();

    await expect(handler(event, context, () => {})).rejects.toThrow(
      "DynamoDB error",
    );
  });
});
