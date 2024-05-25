import * as lambda from "aws-lambda";
import {
  gateway,
  getTranslation,
  exception,
  TranslationTable,
} from "/opt/nodejs/utils-lambda-layer";

import {
  ITranslateResult,
  ITranslateRequest,
  ITranslateResponse,
} from "@sff/shared-types";

const {
  TRANSLATION_TABLE_NAME,
  TRANSLATION_PARTITION_KEY,
  TRANSLATION_SORT_KEY,
} = process.env;

if (!TRANSLATION_TABLE_NAME) {
  throw new exception.MissingEnvironmentVariable("TRANSLATION_TABLE_NAME");
}

if (!TRANSLATION_PARTITION_KEY) {
  throw new exception.MissingEnvironmentVariable("TRANSLATION_PARTITION_KEY");
}

if (!TRANSLATION_SORT_KEY) {
  throw new exception.MissingEnvironmentVariable("TRANSLATION_SORT_KEY");
}

const translateTable = new TranslationTable({
  tableName: TRANSLATION_TABLE_NAME,
  partitionKey: TRANSLATION_PARTITION_KEY,
  sortKey: TRANSLATION_SORT_KEY,
});

const getUsername = (event: lambda.APIGatewayProxyEvent) => {
  const claims = event.requestContext.authorizer?.claims;
  if (!claims) {
    throw new Error("user not authenticated");
  }

  const username = claims["cognito:username"];
  if (!username) {
    throw new Error("username doesn't exist");
  }
  return username;
};

const parseTranslateRequest = (requestStr: string) => {
  let request = JSON.parse(requestStr) as ITranslateRequest;

  if (!request.sourceLang) {
    throw new exception.MissingParameters("sourceLang");
  }
  if (!request.targetLang) {
    throw new exception.MissingParameters("targetLang");
  }
  if (!request.sourceText) {
    throw new exception.MissingParameters("sourceText");
  }

  return request;
};

const parseDeleteRequest = (requestStr: string) => {
  let request = JSON.parse(requestStr) as { requestId: string };
  if (!request.requestId) {
    throw new exception.MissingParameters("requestId");
  }

  return request;
};

const getCurrentTime = () => {
  return Date.now();
};

const formatTime = (time: number) => {
  return new Date(time).toString();
};

export const publicTranslate: lambda.APIGatewayProxyHandler = async function (
  event: lambda.APIGatewayProxyEvent,
  context: lambda.Context
) {
  try {
    if (!event.body) {
      throw new exception.MissingBodyData();
    }
    const request = parseTranslateRequest(event.body);
    console.log("parsed request", request);

    const nowEpoch = getCurrentTime();
    console.log("nowEpoch", nowEpoch);

    const targetText = await getTranslation(request);
    console.log("targetText", targetText);

    const response: ITranslateResponse = {
      timestamp: formatTime(nowEpoch),
      targetText,
    };

    const result: ITranslateResult = {
      requestId: nowEpoch.toString(),
      username: "",
      ...request,
      ...response,
    };

    console.log(result);

    return gateway.createSuccessJsonResponse(result);
  } catch (e: any) {
    console.error(e);
    return gateway.createErrorJsonResponse(e.toString());
  }
};

export const userTranslate: lambda.APIGatewayProxyHandler = async function (
  event: lambda.APIGatewayProxyEvent,
  context: lambda.Context
) {
  try {
    if (!event.body) {
      throw new exception.MissingBodyData();
    }

    const username = getUsername(event);
    console.log("username:", username);

    const request = parseTranslateRequest(event.body);
    console.log("parsed request", request);

    const now = new Date(Date.now()).toString();
    console.log(now);

    const nowEpoch = getCurrentTime();
    console.log("nowEpoch", nowEpoch);

    const targetText = await getTranslation(request);
    console.log("targetText", targetText);

    const response: ITranslateResponse = {
      timestamp: formatTime(nowEpoch),
      targetText,
    };

    // save the translation into our translation table
    // the table object that is saved to the database
    const result: ITranslateResult = {
      requestId: nowEpoch.toString(),
      username,
      ...request,
      ...response,
    };

    await translateTable.insert(result);
    return gateway.createSuccessJsonResponse(result);
  } catch (e: any) {
    console.error(e);
    return gateway.createErrorJsonResponse(e.toString());
  }
};

export const getUserTranslations: lambda.APIGatewayProxyHandler =
  async function (event: lambda.APIGatewayProxyEvent, context: lambda.Context) {
    try {
      const username = getUsername(event);
      console.log("username:", username);

      const rtnData = await translateTable.query({ username, requestId: "" });
      return gateway.createSuccessJsonResponse(rtnData);
    } catch (e: any) {
      console.error(e);
      return gateway.createErrorJsonResponse(e);
    }
  };

export const deleteUserTranslation: lambda.APIGatewayProxyHandler =
  async function (event: lambda.APIGatewayProxyEvent, context: lambda.Context) {
    try {
      if (!event.body) {
        throw new exception.MissingBodyData();
      }

      const username = getUsername(event);
      console.log("username:", username);

      const { requestId } = parseDeleteRequest(event.body);
      console.log("requestId:", requestId);

      const rtnData = await translateTable.delete({ username, requestId });
      return gateway.createSuccessJsonResponse(rtnData);
    } catch (e: any) {
      console.error(e);
      return gateway.createErrorJsonResponse(e);
    }
  };
