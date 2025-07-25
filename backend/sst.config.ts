import { SSTConfig } from "sst";
import { MyStack } from "./stacks/MyStack";

export default {
  config(_input) {
    return {
      name: "medwrangler",
      region: "us-east-2"
    };
  },
  stacks(app) {
    app.stack(MyStack);
  }
} as SSTConfig;
