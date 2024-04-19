import * as cdk from "aws-cdk-lib";
import * as path from "path";
import { Construct } from "constructs";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as lambdaNodeJs from "aws-cdk-lib/aws-lambda-nodejs";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as dynamodDb from "aws-cdk-lib/aws-dynamodb";
import * as iam from "aws-cdk-lib/aws-iam";

export class TempCdkStackStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const projectRoot = "../";
    const lambdasDirPath = path.join(projectRoot, "packages/lambdas");

    // DynamoDb construct goes here
    const table = new dynamodDb.Table(this, "translations", {
      tableName: "translation",
      partitionKey: {
        name: "requestId",
        type: dynamodDb.AttributeType.STRING,
      },
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // translate access policy
    const translateServicePolicy = new iam.PolicyStatement({
      actions: ["translate:TranslateText"],
      resources: ["*"],
    });

    const translateTablePolicy = new iam.PolicyStatement({
      actions: [
        "dynamodb:PutItem",
        "dynamodb:Scan",
        "dynamodb:GetItem",
        "dynamodb:DeleteItem",
      ],
      resources: ["*"],
    });

    const translateLambdaPath = path.resolve(
      path.join(lambdasDirPath, "translate/index.ts")
    );

    const lambdaFunc = new lambdaNodeJs.NodejsFunction(this, "thisOfDay", {
      entry: translateLambdaPath,
      handler: "index",
      runtime: lambda.Runtime.NODEJS_20_X,
      initialPolicy: [translateServicePolicy, translateTablePolicy],
      environment: {
        TRANSLATION_TABLE_NAME: table.tableName,
        TRANSLATION_PARTITION_KEY: "requestId",
      },
    });

    const restApi = new apigateway.RestApi(this, "timeOfDayRestApi");

    // granting read and write access to our dynamoDb table
    // table.grantReadWriteData(lambdaFunc);

    restApi.root.addMethod(
      "POST",
      new apigateway.LambdaIntegration(lambdaFunc)
    );
  }
}
