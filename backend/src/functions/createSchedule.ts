import { APIGatewayProxyHandler } from "aws-lambda";
import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";
import { v4 as uuidv4 } from "uuid";

const client = new DynamoDBClient({});
const TABLE = process.env.SCHEDULES_TABLE_NAME!;

export const handler: APIGatewayProxyHandler = async (e) => {
  const { medId, frequency, days } = JSON.parse(e.body || "{}") as {
    medId?: string;
    frequency?: number;
    days?: number[];
  };
  if (!medId || !frequency || !Array.isArray(days)) {
    return { statusCode: 400, body: "Missing 'medId', 'frequency', or 'days'" };
  }
  const id = uuidv4();
  // default schedule anchor at 8:00 AM local time
  const now = new Date();
  const today8am = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    8,
    0,
    0,
    0,
  );
  await client.send(
    new PutItemCommand({
      TableName: TABLE,
      Item: {
        id: { S: id },
        medId: { S: medId },
        frequency: { N: frequency.toString() },
        startTime: { S: today8am.toISOString() },
        days: { S: JSON.stringify(days) },
      },
    }),
  );
  return {
    statusCode: 201,
    body: JSON.stringify({ id, medId, frequency, days }),
  };
};
