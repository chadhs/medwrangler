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
import { handler } from "../functions/updateMed";

describe("updateMed", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should update a medication successfully", async () => {
    mockSend.mockResolvedValue({
      Attributes: {
        id: { S: "med-123" },
        name: { S: "Updated Aspirin" },
      },
    });

    const event = createMockEvent(
      { name: "Updated Aspirin" },
      { id: "med-123" },
      "PUT",
    );
    const context = createMockContext();

    const result = (await handler(
      event,
      context,
      () => {},
    )) as APIGatewayProxyResult;

    expect(result.statusCode).toBe(200);
    const body = JSON.parse(result.body);
    expect(body.id).toBe("med-123");
    expect(body.name).toBe("Updated Aspirin");
    expect(mockSend).toHaveBeenCalledTimes(1);
  });

  it("should return 400 when name is missing", async () => {
    const event = createMockEvent({}, { id: "med-123" }, "PUT");
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

  it("should return 400 when id is missing in path", async () => {
    const event = createMockEvent({ name: "Updated Name" }, null, "PUT");
    const context = createMockContext();

    const result = (await handler(
      event,
      context,
      () => {},
    )) as APIGatewayProxyResult;

    expect(result.statusCode).toBe(400);
    expect(result.body).toBe("Missing 'id'");
  });

  it("should handle DynamoDB errors", async () => {
    mockSend.mockRejectedValue(new Error("DynamoDB error"));

    const event = createMockEvent(
      { name: "Updated Aspirin" },
      { id: "med-123" },
      "PUT",
    );
    const context = createMockContext();

    await expect(handler(event, context, () => {})).rejects.toThrow(
      "DynamoDB error",
    );
  });
});
