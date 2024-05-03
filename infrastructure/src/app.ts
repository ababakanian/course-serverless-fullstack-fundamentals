#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { TranslatorServiceStack } from "./stacks";

const app = new cdk.App();
new TranslatorServiceStack(app, "TranslatorService", {
  env: {
    account: "211125538771",
    region: "us-east-1",
  },
});
