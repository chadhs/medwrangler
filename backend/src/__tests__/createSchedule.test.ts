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
import { handler } from "../functions/createSchedule";

describe("createSchedule", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock Date to get consistent timestamp
    jest
      .spyOn(Date, "now")
      .mockReturnValue(new Date("2023-01-15T10:30:00.000Z").getTime());
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("should create a schedule successfully", async () => {
    mockSend.mockResolvedValue({});

    const scheduleData = {
      medId: "med-123",
      frequency: 8,
      days: [1, 2, 3, 4, 5], // Mon-Fri
    };

    const event = createMockEvent(scheduleData, undefined, "POST");
    const context = createMockContext();

    const result = (await handler(
      event,
      context,
      () => {},
    )) as APIGatewayProxyResult;

    expect(result.statusCode).toBe(201);
    const body = JSON.parse(result.body);
    expect(body.id).toBe("test-uuid-123");
    expect(body.medId).toBe("med-123");
    expect(body.frequency).toBe(8);
    expect(body.days).toEqual([1, 2, 3, 4, 5]);
    expect(mockSend).toHaveBeenCalledTimes(1);
  });

  it("should return 400 when medId is missing", async () => {
    const event = createMockEvent(
      { frequency: 8, days: [1, 2, 3] },
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
    expect(result.body).toBe("Missing 'medId', 'frequency', or 'days'");
    expect(mockSend).not.toHaveBeenCalled();
  });

  it("should return 400 when frequency is missing", async () => {
    const event = createMockEvent(
      { medId: "med-123", days: [1, 2, 3] },
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
    expect(result.body).toBe("Missing 'medId', 'frequency', or 'days'");
  });

  it("should return 400 when days is not an array", async () => {
    const event = createMockEvent(
      { medId: "med-123", frequency: 8, days: "invalid" },
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
    expect(result.body).toBe("Missing 'medId', 'frequency', or 'days'");
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
    expect(result.body).toBe("Missing 'medId', 'frequency', or 'days'");
  });

  it("should handle DynamoDB errors", async () => {
    mockSend.mockRejectedValue(new Error("DynamoDB error"));

    const event = createMockEvent(
      { medId: "med-123", frequency: 8, days: [1, 2, 3] },
      undefined,
      "POST",
    );
    const context = createMockContext();

    await expect(handler(event, context, () => {})).rejects.toThrow(
      "DynamoDB error",
    );
  });
});
