"use client";
import { Amplify } from "aws-amplify";

Amplify.configure(
  {
    Auth: {
      Cognito: {
        userPoolId: "us-east-1_psJL0v6WI",
        userPoolClientId: "4nf3lp7ifi559vn45vl8p95h9l",
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
