import * as lambda from "aws-lambda";
import {
  gateway,
  getTranslation,
  exception,
  TranslationTable,
} from "/opt/nodejs/utils-lambda-layer";

import {
  ITranslateDbObject,
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

export const publicTranslate: lambda.APIGatewayProxyHandler = async function (
  event: lambda.APIGatewayProxyEvent,
  context: lambda.Context
) {
  try {
    if (!event.body) {
      throw new exception.MissingBodyData();
    }

    let body = JSON.parse(event.body) as ITranslateRequest;

    if (!body.sourceLang) {
      throw new exception.MissingParameters("sourceLang");
    }
    if (!body.targetLang) {
      throw new exception.MissingParameters("targetLang");
    }
    if (!body.sourceText) {
      throw new exception.MissingParameters("sourceText");
    }

    const now = new Date(Date.now()).toString();
    console.log(now);

    const result = await getTranslation(body);
    console.log(result);

    if (!result.TranslatedText) {
      throw new exception.MissingParameters("TranslationText");
    }

    const rtnData: ITranslateResponse = {
      timestamp: now,
      targetText: result.TranslatedText,
    };

    return gateway.createSuccessJsonResponse(rtnData);
  } catch (e: any) {
    console.error(e);
    return gateway.createErrorJsonResponse(e);
  }
};

export const userTranslate: lambda.APIGatewayProxyHandler = async function (
  event: lambda.APIGatewayProxyEvent,
  context: lambda.Context
) {
  try {
    const username = getUsername(event);
    console.log(username);

    if (!event.body) {
      throw new exception.MissingBodyData();
    }

    let body = JSON.parse(event.body) as ITranslateRequest;

    if (!body.sourceLang) {
      throw new exception.MissingParameters("sourceLang");
    }
    if (!body.targetLang) {
      throw new exception.MissingParameters("targetLang");
    }
    if (!body.sourceText) {
      throw new exception.MissingParameters("sourceText");
    }

    const now = new Date(Date.now()).toString();
    console.log(now);

    const result = await getTranslation(body);
    console.log(result);

    if (!result.TranslatedText) {
      throw new exception.MissingParameters("TranslationText");
    }

    const rtnData: ITranslateResponse = {
      timestamp: now,
      targetText: result.TranslatedText,
    };

    // save the translation into our translation table
    // the table object that is saved to the database
    const tableObj: ITranslateDbObject = {
      requestId: context.awsRequestId,
      username,
      ...body,
      ...rtnData,
    };

    await translateTable.insert(tableObj);
    return gateway.createSuccessJsonResponse(rtnData);
  } catch (e: any) {
    console.error(e);
    return gateway.createErrorJsonResponse(e);
  }
};

export const getUserTranslations: lambda.APIGatewayProxyHandler =
  async function (event: lambda.APIGatewayProxyEvent, context: lambda.Context) {
    try {
      const username = getUsername(event);
      console.log(username);

      // const rtnData = await translateTable.getAll();
      const rtnData = await translateTable.query({ username });
      return gateway.createSuccessJsonResponse(rtnData);
    } catch (e: any) {
      console.error(e);
      return gateway.createErrorJsonResponse(e);
    }
  };

export const deleteUserTranslation: lambda.APIGatewayProxyHandler =
  async function (event: lambda.APIGatewayProxyEvent, context: lambda.Context) {
    try {
      const username = getUsername(event);
      console.log(username);

      if (!event.body) {
        throw new exception.MissingBodyData();
      }

      let body = JSON.parse(event.body) as { requestId: string };
      if (!body.requestId) {
        throw new exception.MissingParameters("requestId");
      }

      let requestId = body.requestId;

      const rtnData = await translateTable.delete({ username, requestId });
      return gateway.createSuccessJsonResponse(rtnData);
    } catch (e: any) {
      console.error(e);
      return gateway.createErrorJsonResponse(e);
    }
  };
