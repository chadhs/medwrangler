import { APIGatewayProxyHandler } from "aws-lambda";
import { DynamoDBClient, ScanCommand } from "@aws-sdk/client-dynamodb";
import { unmarshall } from "@aws-sdk/util-dynamodb";

const client = new DynamoDBClient({});
const TABLE = process.env.TABLE_NAME!;

export const handler: APIGatewayProxyHandler = async () => {
  const resp = await client.send(new ScanCommand({ TableName: TABLE }));
  const items = resp.Items?.map((i) => unmarshall(i)) || [];
  return { statusCode: 200, body: JSON.stringify(items) };
};
