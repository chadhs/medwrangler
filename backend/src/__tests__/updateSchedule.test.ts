import { APIGatewayProxyResult } from "aws-lambda";
import { createMockEvent, createMockContext } from "./testUtils";

const mockSend = jest.fn();

// Mock the AWS SDK
jest.mock("@aws-sdk/client-dynamodb", () => ({
  DynamoDBClient: jest.fn().mockImplementation(() => ({
    send: mockSend,
  })),
  UpdateItemCommand: jest
    .fn()
    .mockImplementation((params) => ({ input: params })),
}));

// Import after mocking
import { handler } from "../functions/updateSchedule";

describe("updateSchedule", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should update a schedule successfully", async () => {
    mockSend.mockResolvedValue({});

    const updateData = {
      medId: "med-456",
      frequency: 12,
      days: [0, 6], // Weekend only
    };

    const event = createMockEvent(updateData, { id: "schedule-123" }, "PUT");
    const context = createMockContext();

    const result = (await handler(
      event,
      context,
      () => {},
    )) as APIGatewayProxyResult;

    expect(result.statusCode).toBe(200);
    const body = JSON.parse(result.body);
    expect(body.id).toBe("schedule-123");
    expect(body.medId).toBe("med-456");
    expect(body.frequency).toBe(12);
    expect(body.days).toEqual([0, 6]);
    expect(mockSend).toHaveBeenCalledTimes(1);
  });

  it("should return 400 when id is missing in path", async () => {
    const event = createMockEvent(
      { medId: "med-456", frequency: 12, days: [1, 2] },
      null,
      "PUT",
    );
    const context = createMockContext();

    const result = (await handler(
      event,
      context,
      () => {},
    )) as APIGatewayProxyResult;

    expect(result.statusCode).toBe(400);
    expect(result.body).toBe("Missing 'id'");
    expect(mockSend).not.toHaveBeenCalled();
  });

  it("should return 400 when medId is missing", async () => {
    const event = createMockEvent(
      { frequency: 12, days: [1, 2] },
      { id: "schedule-123" },
      "PUT",
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

  it("should return 400 when frequency is missing", async () => {
    const event = createMockEvent(
      { medId: "med-456", days: [1, 2] },
      { id: "schedule-123" },
      "PUT",
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
      { medId: "med-456", frequency: 12, days: "invalid" },
      { id: "schedule-123" },
      "PUT",
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

  it("should handle DynamoDB errors", async () => {
    mockSend.mockRejectedValue(new Error("DynamoDB error"));

    const event = createMockEvent(
      { medId: "med-456", frequency: 12, days: [1, 2] },
      { id: "schedule-123" },
      "PUT",
    );
    const context = createMockContext();

    await expect(handler(event, context, () => {})).rejects.toThrow(
      "DynamoDB error",
    );
  });
});
