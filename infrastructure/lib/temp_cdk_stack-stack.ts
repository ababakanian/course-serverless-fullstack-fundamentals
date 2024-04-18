import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as lambdaNodeJs from "aws-cdk-lib/aws-lambda-nodejs";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as iam from "aws-cdk-lib/aws-iam";

export class TempCdkStackStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const translatePolicyStatement = new iam.PolicyStatement({
      actions: ["translate:TranslateText"],
      resources: ["*"],
    });

    const lambdaFunc = new lambdaNodeJs.NodejsFunction(this, "thisOfDay", {
      entry: "./lambda/timeOfDay.ts",
      handler: "index",
      runtime: lambda.Runtime.NODEJS_20_X,
      initialPolicy: [translatePolicyStatement],
    });

    const restApi = new apigateway.RestApi(this, "timeOfDayRestApi");

    restApi.root.addMethod(
      "POST",
      new apigateway.LambdaIntegration(lambdaFunc)
    );
  }
}
