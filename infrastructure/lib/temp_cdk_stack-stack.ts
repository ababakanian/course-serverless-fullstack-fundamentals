import * as cdk from "aws-cdk-lib";
import * as path from "path";
import { Construct } from "constructs";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as lambdaNodeJs from "aws-cdk-lib/aws-lambda-nodejs";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as dynamodDb from "aws-cdk-lib/aws-dynamodb";
import * as iam from "aws-cdk-lib/aws-iam";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as s3deploy from "aws-cdk-lib/aws-s3-deployment";
import * as cloudfront from "aws-cdk-lib/aws-cloudfront";
import * as route53 from "aws-cdk-lib/aws-route53";
import * as route53Targets from "aws-cdk-lib/aws-route53-targets";
import * as acm from "aws-cdk-lib/aws-certificatemanager";

export class TempCdkStackStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // project paths
    const projectRoot = "../";
    const lambdasDirPath = path.join(projectRoot, "packages/lambdas");
    const lambdaLayersDirPath = path.join(
      projectRoot,
      "packages/lambda-layers"
    );
    const domain = "redrobotexample.com";
    const fullUrl = `www.${domain}`;
    const apiUrl = `api.${domain}`;

    // fetch route53 zone
    const zone = route53.HostedZone.fromLookup(this, "zone", {
      domainName: domain,
    });

    // this will create a certificate
    const certificate = new acm.Certificate(this, "certificate", {
      domainName: domain,
      subjectAlternativeNames: [fullUrl, apiUrl],
      validation: acm.CertificateValidation.fromDns(zone),
    });

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

    const utilsLambdaLayerPath = path.resolve(
      path.join(lambdaLayersDirPath, "utils-lambda-layer")
    );

    const utilsLambdaLayer = new lambda.LayerVersion(this, "utilsLambdaLayer", {
      code: lambda.Code.fromAsset(utilsLambdaLayerPath),
      compatibleRuntimes: [lambda.Runtime.NODEJS_20_X],
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // top level api gateway construct
    const restApi = new apigateway.RestApi(this, "timeOfDayRestApi", {
      domainName: {
        domainName: apiUrl,
        certificate,
      },
    });

    // the translation lambda
    const translateLambda = new lambdaNodeJs.NodejsFunction(
      this,
      "translateLambda",
      {
        entry: translateLambdaPath,
        handler: "translate",
        runtime: lambda.Runtime.NODEJS_20_X,
        initialPolicy: [translateServicePolicy, translateTablePolicy],
        layers: [utilsLambdaLayer],
        environment: {
          TRANSLATION_TABLE_NAME: table.tableName,
          TRANSLATION_PARTITION_KEY: "requestId",
        },
      }
    );

    restApi.root.addMethod(
      "POST",
      new apigateway.LambdaIntegration(translateLambda)
    );

    // get translation lambda
    const getTranslationsLambda = new lambdaNodeJs.NodejsFunction(
      this,
      "getTranslationsLambda",
      {
        entry: translateLambdaPath,
        handler: "getTranslatons",
        runtime: lambda.Runtime.NODEJS_20_X,
        initialPolicy: [translateTablePolicy],
        layers: [utilsLambdaLayer],
        environment: {
          TRANSLATION_TABLE_NAME: table.tableName,
          TRANSLATION_PARTITION_KEY: "requestId",
        },
      }
    );

    restApi.root.addMethod(
      "GET",
      new apigateway.LambdaIntegration(getTranslationsLambda)
    );

    // viewer certificate
    const viewerCertificate = cloudfront.ViewerCertificate.fromAcmCertificate(
      certificate,
      {
        aliases: [domain, fullUrl],
      }
    );

    // bucket where website dist will reside
    const bucket = new s3.Bucket(this, "WebsiteBucket", {
      websiteIndexDocument: "index.html",
      websiteErrorDocument: "404.html",
      publicReadAccess: true,
      blockPublicAccess: {
        blockPublicAcls: false,
        blockPublicPolicy: false,
        ignorePublicAcls: false,
        restrictPublicBuckets: false,
      },
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });

    const distro = new cloudfront.CloudFrontWebDistribution(
      this,
      "WebsiteCloudfrontDist",
      {
        viewerCertificate,
        originConfigs: [
          {
            s3OriginSource: {
              s3BucketSource: bucket,
            },
            behaviors: [
              {
                isDefaultBehavior: true,
              },
            ],
          },
        ],
      }
    );

    // s3 construct to deploy the website dist content
    new s3deploy.BucketDeployment(this, "WebsiteDeploy", {
      destinationBucket: bucket,
      sources: [s3deploy.Source.asset("../apps/frontend/dist")],
      distribution: distro,
      distributionPaths: ["/*"],
    });

    new route53.ARecord(this, "route53Domain", {
      zone,
      recordName: domain,
      target: route53.RecordTarget.fromAlias(
        new route53Targets.CloudFrontTarget(distro)
      ),
    });

    new route53.ARecord(this, "route53FullUrl", {
      zone,
      recordName: "www",
      target: route53.RecordTarget.fromAlias(
        new route53Targets.CloudFrontTarget(distro)
      ),
    });

    new route53.ARecord(this, "apiDns", {
      zone,
      recordName: "api",
      target: route53.RecordTarget.fromAlias(
        new route53Targets.ApiGateway(restApi)
      ),
    });

    new cdk.CfnOutput(this, "webUrl", {
      exportName: "webUrl",
      value: `https://${distro.distributionDomainName}`,
    });
  }
}
