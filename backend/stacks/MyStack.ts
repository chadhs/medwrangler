import { Api, Table, StackContext, StaticSite } from "sst/constructs";

export function MyStack({ stack }: StackContext) {
  // DynamoDB tables
  const table = new Table(stack, "Meds", {
    fields: { id: "string" },
    primaryIndex: { partitionKey: "id" },
  });
  const scheduleTable = new Table(stack, "Schedules", {
    fields: { id: "string" },
    primaryIndex: { partitionKey: "id" },
  });

  // Taken doses table
  const takenTable = new Table(stack, "TakenDoses", {
    fields: { id: "string" },
    primaryIndex: { partitionKey: "id" },
  });

  // API Gateway + Lambda
  const api = new Api(stack, "Api", {
    defaults: {
      function: {
        runtime: "nodejs18.x",
        environment: {
          MEDS_TABLE_NAME: table.tableName,
          SCHEDULES_TABLE_NAME: scheduleTable.tableName,
          TAKEN_TABLE_NAME: takenTable.tableName,
        },
      },
    },
    routes: {
      // Medications
      "GET    /meds": "src/functions/getMeds.handler",
      "POST   /meds": "src/functions/createMed.handler",
      "PUT    /meds/{id}": "src/functions/updateMed.handler",
      "DELETE /meds/{id}": "src/functions/deleteMed.handler",

      // Schedules
      "GET    /schedules": "src/functions/getSchedules.handler",
      "POST   /schedules": "src/functions/createSchedule.handler",
      "PUT    /schedules/{id}": "src/functions/updateSchedule.handler",
      "DELETE /schedules/{id}": "src/functions/deleteSchedule.handler",

      // Taken doses
      "GET    /taken": "src/functions/getTaken.handler",
      "POST   /taken": "src/functions/createTaken.handler",
      "DELETE /taken/{id}": "src/functions/deleteTaken.handler",
    },
  });

  // Grant all functions full access to the tables
  api.attachPermissions([table, scheduleTable, takenTable]);

  const site = new StaticSite(stack, "Frontend", {
    path: "../frontend", // relative to your backend folder
    buildCommand: "npm install && npm run build",
    buildOutput: "dist",
    environment: {
      VITE_API_URL: api.url, // automatically injects the prod API URL
    },
  });

  stack.addOutputs({ ApiEndpoint: api.url });
  stack.addOutputs({ WebsiteURL: site.url });
}
