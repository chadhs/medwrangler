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
import { handler } from "../functions/getTaken";

describe("getTaken", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return all taken doses successfully", async () => {
    const mockTakenItems = [
      {
        id: { S: "taken-1" },
        scheduleId: { S: "schedule-1" },
        doseTime: { S: "2023-01-15T08:00:00.000Z" },
        takenAt: { S: "2023-01-15T08:05:00.000Z" },
      },
      {
        id: { S: "taken-2" },
        scheduleId: { S: "schedule-2" },
        doseTime: { S: "2023-01-15T20:00:00.000Z" },
        takenAt: { S: "2023-01-15T20:02:00.000Z" },
      },
    ];

    mockSend.mockResolvedValue({ Items: mockTakenItems });

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
      id: "taken-1",
      scheduleId: "schedule-1",
      doseTime: "2023-01-15T08:00:00.000Z",
      takenAt: "2023-01-15T08:05:00.000Z",
    });
    expect(body[1]).toEqual({
      id: "taken-2",
      scheduleId: "schedule-2",
      doseTime: "2023-01-15T20:00:00.000Z",
      takenAt: "2023-01-15T20:02:00.000Z",
    });
    expect(mockSend).toHaveBeenCalledTimes(1);
  });

  it("should return empty array when no taken doses exist", async () => {
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

  it("should handle DynamoDB errors", async () => {
    mockSend.mockRejectedValue(new Error("DynamoDB error"));

    const event = createMockEvent();
    const context = createMockContext();

    await expect(handler(event, context, () => {})).rejects.toThrow(
      "DynamoDB error",
    );
  });
});
