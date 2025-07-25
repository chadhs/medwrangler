import { APIGatewayProxyHandler } from "aws-lambda";
import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";
import { v4 as uuidv4 } from "uuid";

const client = new DynamoDBClient({});
const TABLE = process.env.TAKEN_TABLE_NAME!;

export const handler: APIGatewayProxyHandler = async (e) => {
  const { scheduleId, doseTime } = JSON.parse(e.body || "{}") as {
    scheduleId?: string;
    doseTime?: string;
  };
  if (!scheduleId || !doseTime) {
    return { statusCode: 400, body: "Missing 'scheduleId' or 'doseTime'" };
  }
  const id = uuidv4();
  const takenAt = new Date().toISOString();
  await client.send(
    new PutItemCommand({
      TableName: TABLE,
      Item: {
        id: { S: id },
        scheduleId: { S: scheduleId },
        doseTime: { S: doseTime },
        takenAt: { S: takenAt },
      },
    }),
  );
  return {
    statusCode: 201,
    body: JSON.stringify({ id, scheduleId, doseTime, takenAt }),
  };
};
