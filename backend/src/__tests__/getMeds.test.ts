import { APIGatewayProxyResult } from "aws-lambda";
import {
  createMockEvent,
  createMockContext,
  mockDynamoDBResponse,
} from "./testUtils";

const mockSend = jest.fn();

// Mock the AWS SDK
jest.mock("@aws-sdk/client-dynamodb", () => ({
  DynamoDBClient: jest.fn().mockImplementation(() => ({
    send: mockSend,
  })),
  ScanCommand: jest.fn().mockImplementation((params) => ({ input: params })),
}));

// Import after mocking
import { handler } from "../functions/getMeds";

describe("getMeds", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return all medications successfully", async () => {
    const testMeds = [
      { id: "med-1", name: "Aspirin" },
      { id: "med-2", name: "Ibuprofen" },
    ];

    mockSend.mockResolvedValue(mockDynamoDBResponse(testMeds));

    const event = createMockEvent();
    const context = createMockContext();

    const result = (await handler(
      event,
      context,
      () => {},
    )) as APIGatewayProxyResult;

    expect(result.statusCode).toBe(200);
    expect(JSON.parse(result.body)).toEqual(testMeds);
    expect(mockSend).toHaveBeenCalledTimes(1);
  });

  it("should return empty array when no medications exist", async () => {
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
