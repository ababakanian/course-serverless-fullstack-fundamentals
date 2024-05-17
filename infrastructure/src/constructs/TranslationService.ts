import * as path from "path";
import { Construct } from "constructs";
import * as cdk from "aws-cdk-lib";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as dynamodDb from "aws-cdk-lib/aws-dynamodb";
import * as iam from "aws-cdk-lib/aws-iam";
import * as lambdaNodeJs from "aws-cdk-lib/aws-lambda-nodejs";
import { RestApiService } from "./RestApiService";
import {
  createNodeJsLambda,
  lambdaLayersDirPath,
  lambdasDirPath,
} from "../helpers";

export interface ITranslationServiceProps extends cdk.StackProps {
  restApi: RestApiService;
}

export class TranslationService extends Construct {
  public restApi: apigateway.RestApi;
  constructor(
    scope: Construct,
    id: string,
    { restApi }: ITranslationServiceProps
  ) {
    super(scope, id);

    const utilsLambdaLayerPath = path.resolve(
      path.join(lambdaLayersDirPath, "utils-lambda-layer")
    );

    // DynamoDb construct goes here
    const table = new dynamodDb.Table(this, "translations", {
      tableName: "translation",
      partitionKey: {
        name: "username",
        type: dynamodDb.AttributeType.STRING,
      },
      sortKey: {
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

    // translate table access policy
    const translateTablePolicy = new iam.PolicyStatement({
      actions: [
        "dynamodb:PutItem",
        "dynamodb:Scan",
        "dynamodb:GetItem",
        "dynamodb:DeleteItem",
        "dynamodb:Query",
      ],
      resources: ["*"],
    });

    // lambda layer
    const utilsLambdaLayer = new lambda.LayerVersion(this, "utilsLambdaLayer", {
      code: lambda.Code.fromAsset(utilsLambdaLayerPath),
      compatibleRuntimes: [lambda.Runtime.NODEJS_20_X],
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    const environment = {
      TRANSLATION_TABLE_NAME: table.tableName,
      TRANSLATION_PARTITION_KEY: "username",
      TRANSLATION_SORT_KEY: "requestId",
    };

    // the translation lambda

    const translateLambda = createNodeJsLambda(this, "translateLambda", {
      lambdaRelPath: "translate/index.ts",
      handler: "userTranslate",
      initialPolicy: [translateServicePolicy, translateTablePolicy],
      lambdaLayers: [utilsLambdaLayer],
      environment,
    });

    // adding lambda to restApi
    restApi.addTranslateMethod({
      resource: restApi.userResource,
      httpMethod: "POST",
      lambda: translateLambda,
      isAuth: true,
    });

    // get translation lambda
    const getTranslationsLambda = createNodeJsLambda(
      this,
      "getTranslationsLambda",
      {
        lambdaRelPath: "translate/index.ts",
        handler: "getUserTranslations",
        initialPolicy: [translateTablePolicy],
        lambdaLayers: [utilsLambdaLayer],
        environment,
      }
    );

    // adding the get translate to the restApi
    restApi.addTranslateMethod({
      resource: restApi.userResource,
      httpMethod: "GET",
      lambda: getTranslationsLambda,
      isAuth: true,
    });

    const userDeleteTranslateLambda = createNodeJsLambda(
      this,
      "userDeleteTranslateLambda",
      {
        lambdaRelPath: "translate/index.ts",
        handler: "deleteUserTranslation",
        initialPolicy: [translateTablePolicy],
        lambdaLayers: [utilsLambdaLayer],
        environment,
      }
    );

    // adding the get translate to the restApi
    restApi.addTranslateMethod({
      resource: restApi.userResource,
      httpMethod: "DELETE",
      lambda: userDeleteTranslateLambda,
      isAuth: true,
    });

    const publicTranslateLambda = createNodeJsLambda(
      this,
      "publicTranslateLambda",
      {
        lambdaRelPath: "translate/index.ts",
        handler: "publicTranslate",
        initialPolicy: [translateServicePolicy],
        lambdaLayers: [utilsLambdaLayer],
        environment,
      }
    );

    // adding the get translate to the restApi
    restApi.addTranslateMethod({
      resource: restApi.publicResource,
      httpMethod: "POST",
      lambda: publicTranslateLambda,
      isAuth: false,
    });
  }
}
