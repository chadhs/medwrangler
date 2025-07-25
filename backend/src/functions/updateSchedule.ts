import { APIGatewayProxyHandler } from "aws-lambda";
import { DynamoDBClient, UpdateItemCommand } from "@aws-sdk/client-dynamodb";

const client = new DynamoDBClient({});
const TABLE = process.env.SCHEDULES_TABLE_NAME!;

export const handler: APIGatewayProxyHandler = async (e) => {
  const id = e.pathParameters?.id;
  if (!id) {
    return { statusCode: 400, body: "Missing 'id'" };
  }
  const { medId, frequency, days } = JSON.parse(e.body || "{}") as {
    medId?: string;
    frequency?: number;
    days?: number[];
  };
  if (!medId || !frequency || !Array.isArray(days)) {
    return { statusCode: 400, body: "Missing 'medId', 'frequency', or 'days'" };
  }
  await client.send(
    new UpdateItemCommand({
      TableName: TABLE,
      Key: { id: { S: id } },
      UpdateExpression: "SET medId = :m, frequency = :f, days = :d",
      ExpressionAttributeValues: {
        ":m": { S: medId },
        ":f": { N: frequency.toString() },
        ":d": { S: JSON.stringify(days) },
      },
    }),
  );
  return {
    statusCode: 200,
    body: JSON.stringify({ id, medId, frequency, days }),
  };
};
