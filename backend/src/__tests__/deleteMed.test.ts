import { APIGatewayProxyResult } from "aws-lambda";
import { createMockEvent, createMockContext } from "./testUtils";

const mockSend = jest.fn();

// Mock the AWS SDK
jest.mock("@aws-sdk/client-dynamodb", () => ({
  DynamoDBClient: jest.fn().mockImplementation(() => ({
    send: mockSend,
  })),
  DeleteItemCommand: jest
    .fn()
    .mockImplementation((params) => ({ input: params })),
}));

// Import after mocking
import { handler } from "../functions/deleteMed";

describe("deleteMed", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should delete a medication successfully", async () => {
    mockSend.mockResolvedValue({});

    const event = createMockEvent(null, { id: "med-123" }, "DELETE");
    const context = createMockContext();

    const result = (await handler(
      event,
      context,
      () => {},
    )) as APIGatewayProxyResult;

    expect(result.statusCode).toBe(204);
    expect(result.body).toBe("");
    expect(mockSend).toHaveBeenCalledTimes(1);
  });

  it("should return 400 when id is missing in path", async () => {
    const event = createMockEvent(null, null, "DELETE");
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

  it("should handle DynamoDB errors", async () => {
    mockSend.mockRejectedValue(new Error("DynamoDB error"));

    const event = createMockEvent(null, { id: "med-123" }, "DELETE");
    const context = createMockContext();

    await expect(handler(event, context, () => {})).rejects.toThrow(
      "DynamoDB error",
    );
  });
});
