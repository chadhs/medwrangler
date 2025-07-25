import { APIGatewayProxyHandler } from "aws-lambda";
import { DynamoDBClient, ScanCommand } from "@aws-sdk/client-dynamodb";
import { unmarshall } from "@aws-sdk/util-dynamodb";

const client = new DynamoDBClient({});
const TABLE = process.env.SCHEDULES_TABLE_NAME!;

export const handler: APIGatewayProxyHandler = async () => {
  const resp = await client.send(new ScanCommand({ TableName: TABLE }));
  const raw = resp.Items?.map((i) => unmarshall(i)) || [];
  const items = raw.map((item) => ({
    id: item.id,
    medId: item.medId,
    frequency: Number(item.frequency),
    startTime: item.startTime,
    days: Array.isArray(item.days)
      ? item.days
      : item.days
        ? JSON.parse(item.days)
        : [],
  }));
  return { statusCode: 200, body: JSON.stringify(items) };
};
