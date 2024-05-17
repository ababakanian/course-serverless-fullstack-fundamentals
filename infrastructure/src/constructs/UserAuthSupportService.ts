import { Construct } from "constructs";
import * as cdk from "aws-cdk-lib";
import * as cognito from "aws-cdk-lib/aws-cognito";

export interface IUserAuthSupportService extends cdk.StackProps {}

export class UserAuthSupportService extends Construct {
  constructor(scope: Construct, id: string, props?: IUserAuthSupportService) {
    super(scope, id);

    const userPool = new cognito.UserPool(this, "translatorUserPool", {
      selfSignUpEnabled: true,
      signInAliases: { email: true },
      autoVerify: { email: true },
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    const userPoolClient = new cognito.UserPoolClient(
      this,
      "translatorUSerPoolClient",
      {
        userPool,
        userPoolClientName: "translator-web-client",
        generateSecret: false,
        supportedIdentityProviders: [
          cognito.UserPoolClientIdentityProvider.COGNITO,
        ],
      }
    );

    new cdk.CfnOutput(this, "userPoolId", {
      value: userPool.userPoolId,
    });

    new cdk.CfnOutput(this, "userPoolClient", {
      value: userPoolClient.userPoolClientId,
    });
  }
}
