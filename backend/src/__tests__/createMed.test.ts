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
import { handler } from "../functions/createMed";

describe("createMed", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should create a medication successfully", async () => {
    mockSend.mockResolvedValue({});

    const event = createMockEvent({ name: "Aspirin" }, undefined, "POST");
    const context = createMockContext();

    const result = (await handler(
      event,
      context,
      () => {},
    )) as APIGatewayProxyResult;

    expect(result.statusCode).toBe(201);
    const body = JSON.parse(result.body);
    expect(body.name).toBe("Aspirin");
    expect(body.id).toBe("test-uuid-123");
    expect(mockSend).toHaveBeenCalledTimes(1);
  });

  it("should return 400 when name is missing", async () => {
    const event = createMockEvent({}, undefined, "POST");
    const context = createMockContext();

    const result = (await handler(
      event,
      context,
      () => {},
    )) as APIGatewayProxyResult;

    expect(result.statusCode).toBe(400);
    expect(result.body).toBe("Missing 'name'");
    expect(mockSend).not.toHaveBeenCalled();
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
    expect(result.body).toBe("Missing 'name'");
  });

  it("should handle DynamoDB errors", async () => {
    mockSend.mockRejectedValue(new Error("DynamoDB error"));

    const event = createMockEvent({ name: "Aspirin" }, undefined, "POST");
    const context = createMockContext();

    await expect(handler(event, context, () => {})).rejects.toThrow(
      "DynamoDB error",
    );
  });
});
