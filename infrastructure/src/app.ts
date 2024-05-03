#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { TranslatorServiceStack } from "./stacks";
import { getConfig } from "./helpers";

const config = getConfig();

const app = new cdk.App();
new TranslatorServiceStack(app, "TranslatorService", {
  env: {
    account: config.awsAccountId,
    region: config.awsRegion,
  },
});
