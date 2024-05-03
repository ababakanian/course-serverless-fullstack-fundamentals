import { Construct } from "constructs";
import * as cdk from "aws-cdk-lib";
import * as route53 from "aws-cdk-lib/aws-route53";
import * as acm from "aws-cdk-lib/aws-certificatemanager";

export interface ICertificateWrapperProps extends cdk.StackProps {
  domain: string;
  webUrl: string;
  apiUrl: string;
}

export class CertificateWrapper extends Construct {
  public zone: route53.IHostedZone;
  public certificate: acm.Certificate;

  constructor(
    scope: Construct,
    id: string,
    { domain, webUrl, apiUrl }: ICertificateWrapperProps
  ) {
    super(scope, id);

    // fetch route53 zone
    this.zone = route53.HostedZone.fromLookup(this, "zone", {
      domainName: domain,
    });

    // this will create a certificate
    this.certificate = new acm.Certificate(this, "certificate", {
      domainName: domain,
      subjectAlternativeNames: [webUrl, apiUrl],
      validation: acm.CertificateValidation.fromDns(this.zone),
    });
  }
}
