import * as path from "path";
import * as fs from "fs";
import { Construct } from "constructs";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as lambdaNodeJs from "aws-cdk-lib/aws-lambda-nodejs";
import * as iam from "aws-cdk-lib/aws-iam";
import { lambdasDirPath } from "./appPaths";

export type ILambdaWrapperProps = {
  lambdaRelPath: string;
  handler: string;
  initialPolicy: Array<iam.PolicyStatement>;
  lambdaLayers: Array<lambda.ILayerVersion>;
  environment: Record<string, string>;
};

const bundling: lambdaNodeJs.BundlingOptions = {
  minify: true,
  externalModules: ["/opt/nodejs/utils-lambda-layer"],
};

export const createNodeJsLambda = (
  scope: Construct,
  lambdaName: string,
  {
    lambdaRelPath,
    handler,
    initialPolicy,
    lambdaLayers,
    environment,
  }: ILambdaWrapperProps
) => {
  const lambdaPath = path.join(lambdasDirPath, lambdaRelPath);

  if (!fs.existsSync(lambdaPath)) {
    throw new Error("lambdaPath doesn't exist");
  }

  return new lambdaNodeJs.NodejsFunction(scope, lambdaName, {
    entry: lambdaPath,
    handler,
    runtime: lambda.Runtime.NODEJS_20_X,
    initialPolicy,
    layers: lambdaLayers,
    environment,
    bundling,
  });
};
