import { Construct } from "constructs";
import * as cdk from "aws-cdk-lib";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as route53 from "aws-cdk-lib/aws-route53";
import * as route53Targets from "aws-cdk-lib/aws-route53-targets";
import * as acm from "aws-cdk-lib/aws-certificatemanager";
import * as lambda from "aws-cdk-lib/aws-lambda";

export interface IRestApiServiceProps extends cdk.StackProps {
  apiUrl: string;
  certificate: acm.Certificate;
  zone: route53.IHostedZone;
}

export class RestApiService extends Construct {
  public restApi: apigateway.RestApi;
  constructor(
    scope: Construct,
    id: string,
    { apiUrl, certificate, zone }: IRestApiServiceProps
  ) {
    super(scope, id);

    // top level api gateway construct
    this.restApi = new apigateway.RestApi(this, "timeOfDayRestApi", {
      domainName: {
        domainName: apiUrl,
        certificate,
      },
    });

    new route53.ARecord(this, "apiDns", {
      zone,
      recordName: "api",
      target: route53.RecordTarget.fromAlias(
        new route53Targets.ApiGateway(this.restApi)
      ),
    });
  }

  addTranslateMethod({
    httpMethod,
    lambda,
  }: {
    httpMethod: string;
    lambda: lambda.IFunction;
  }) {
    this.restApi.root.addMethod(
      httpMethod,
      new apigateway.LambdaIntegration(lambda)
    );
  }
}
