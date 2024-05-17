import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import {
  RestApiService,
  TranslationService,
  StaticWebsiteDeployment,
  CertificateWrapper,
  UserAuthSupportService,
} from "../constructs";
import { getConfig } from "../helpers";

export class TranslatorServiceStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    const config = getConfig();

    const domain = config.domain;
    const webUrl = `${config.webSubdomain}.${domain}`;
    const apiUrl = `${config.apiSubdomain}.${domain}`;

    const cw = new CertificateWrapper(this, "certificateWrapper", {
      domain,
      apiUrl,
      webUrl,
    });

    // UserAuth Support
    const userAuth = new UserAuthSupportService(this, "userAuthSupport");

    const restApi = new RestApiService(this, "restApiService", {
      apiUrl,
      certificate: cw.certificate,
      zone: cw.zone,
      userPool: userAuth.userPool,
    });

    new TranslationService(this, "translationService", {
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
