import * as cdk from "aws-cdk-lib";
import * as path from "path";
import { Construct } from "constructs";
import {
  RestApiService,
  TranslationService,
  StaticWebsiteDeployment,
  CertificateWrapper,
} from "../constructs";

export class TranslatorServiceStack extends cdk.Stack {
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
    const webUrl = `www.${domain}`;
    const apiUrl = `api.${domain}`;

    const cw = new CertificateWrapper(this, "certificateWrapper", {
      domain,
      apiUrl,
      webUrl,
    });

    const restApi = new RestApiService(this, "restApiService", {
      apiUrl,
      certificate: cw.certificate,
      zone: cw.zone,
    });

    new TranslationService(this, "translationService", {
      lambdaLayersDirPath,
      lambdasDirPath,
      restApi,
    });

    new StaticWebsiteDeployment(this, "staticWebsiteDeployment", {
      domain,
      webUrl: webUrl,
      certificate: cw.certificate,
      zone: cw.zone,
    });
  }
}
