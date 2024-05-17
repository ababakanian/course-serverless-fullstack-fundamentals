"use client";
import { Amplify } from "aws-amplify";

Amplify.configure(
  {
    Auth: {
      Cognito: {
        userPoolId: "us-east-1_T6rqYRjTD",
        userPoolClientId: "4m9pvrob0olnii8slnguh20krc",
      },
    },
  },
  {
    ssr: true,
  }
);

export function ConfigureAmplify() {
  return null;
}
