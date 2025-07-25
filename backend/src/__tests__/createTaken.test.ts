import { APIGatewayProxyResult } from "aws-lambda";
import { createMockEvent, createMockContext } from "./testUtils";

const mockSend = jest.fn();

// Mock the AWS SDK
jest.mock("@aws-sdk/client-dynamodb", () => ({
  DynamoDBClient: jest.fn().mockImplementation(() => ({
    send: mockSend,
  })),
  PutItemCommand: jest.fn().mockImplementation((params) => ({ input: params })),
}));

// Mock UUID
jest.mock("uuid", () => ({
  v4: jest.fn(() => "test-uuid-123"),
}));

// Import after mocking
import { handler } from "../functions/createTaken";

describe("createTaken", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock Date to get consistent timestamp
    jest
      .spyOn(Date.prototype, "toISOString")
      .mockReturnValue("2023-01-15T08:05:00.000Z");
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("should create a taken dose successfully", async () => {
    mockSend.mockResolvedValue({});

    const takenData = {
      scheduleId: "schedule-123",
      doseTime: "2023-01-15T08:00:00.000Z",
    };

    const event = createMockEvent(takenData, undefined, "POST");
    const context = createMockContext();

    const result = (await handler(
      event,
      context,
      () => {},
    )) as APIGatewayProxyResult;

    expect(result.statusCode).toBe(201);
    const body = JSON.parse(result.body);
    expect(body.id).toBe("test-uuid-123");
    expect(body.scheduleId).toBe("schedule-123");
    expect(body.doseTime).toBe("2023-01-15T08:00:00.000Z");
    expect(body.takenAt).toBe("2023-01-15T08:05:00.000Z");
    expect(mockSend).toHaveBeenCalledTimes(1);
  });

  it("should return 400 when scheduleId is missing", async () => {
    const event = createMockEvent(
      { doseTime: "2023-01-15T08:00:00.000Z" },
      undefined,
      "POST",
    );
    const context = createMockContext();

    const result = (await handler(
      event,
      context,
      () => {},
    )) as APIGatewayProxyResult;

    expect(result.statusCode).toBe(400);
    expect(result.body).toBe("Missing 'scheduleId' or 'doseTime'");
    expect(mockSend).not.toHaveBeenCalled();
  });

  it("should return 400 when doseTime is missing", async () => {
    const event = createMockEvent(
      { scheduleId: "schedule-123" },
      undefined,
      "POST",
    );
    const context = createMockContext();

    const result = (await handler(
      event,
      context,
      () => {},
    )) as APIGatewayProxyResult;

    expect(result.statusCode).toBe(400);
    expect(result.body).toBe("Missing 'scheduleId' or 'doseTime'");
  });

  it("should return 400 when body is empty", async () => {
    const event = createMockEvent(null, undefined, "POST");
    const context = createMockContext();

    const result = (await handler(
      event,
      context,
      () => {},
    )) as APIGatewayProxyResult;

    expect(result.statusCode).toBe(400);
    expect(result.body).toBe("Missing 'scheduleId' or 'doseTime'");
  });

  it("should handle DynamoDB errors", async () => {
    mockSend.mockRejectedValue(new Error("DynamoDB error"));

    const event = createMockEvent(
      { scheduleId: "schedule-123", doseTime: "2023-01-15T08:00:00.000Z" },
      undefined,
      "POST",
    );
    const context = createMockContext();

    await expect(handler(event, context, () => {})).rejects.toThrow(
      "DynamoDB error",
    );
  });
});
