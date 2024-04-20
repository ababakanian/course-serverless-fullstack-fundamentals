import * as clientTranslate from "@aws-sdk/client-translate";
import * as dynamodb from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";
import * as lambda from "aws-lambda";
import { gateway } from "/opt/nodejs/utils-lambda-layer";

import {
  ITranslateDbObject,
  ITranslateRequest,
  ITranslateResponse,
} from "@sff/shared-types";

const { TRANSLATION_TABLE_NAME, TRANSLATION_PARTITION_KEY } = process.env;
console.log("{ TRANSLATION_TABLE_NAME, TRANSLATION_PARTITION_KEY }", {
  TRANSLATION_TABLE_NAME,
  TRANSLATION_PARTITION_KEY,
});

if (!TRANSLATION_TABLE_NAME) {
  throw new Error("TRANSLATION_TABLE_NAME is empty");
}

if (!TRANSLATION_PARTITION_KEY) {
  throw new Error("TRANSLATION_PARTITION_KEY is empty");
}

const translateClient = new clientTranslate.TranslateClient({});
const dynamodbClient = new dynamodb.DynamoDBClient({});

export const translate: lambda.APIGatewayProxyHandler = async function (
  event: lambda.APIGatewayProxyEvent,
  context: lambda.Context
) {
  try {
    if (!event.body) {
      throw new Error("body is missing");
    }
    console.log(event.body);

    let body = JSON.parse(event.body) as ITranslateRequest;

    if (!body.sourceLang) {
      throw new Error("sourceLang is missing");
    }
    if (!body.targetLang) {
      throw new Error("targetLang is missing");
    }
    if (!body.sourceText) {
      throw new Error("sourceText is missing");
    }

    const { sourceLang, targetLang, sourceText } = body;

    const now = new Date(Date.now()).toString();
    console.log(now);

    const translateCommand = new clientTranslate.TranslateTextCommand({
      SourceLanguageCode: sourceLang,
      TargetLanguageCode: targetLang,
      Text: sourceText,
    });

    const result = await translateClient.send(translateCommand);
    console.log(result);

    if (!result.TranslatedText) {
      throw new Error("translation is empty");
    }

    const rtnData: ITranslateResponse = {
      timestamp: now,
      targetText: result.TranslatedText,
    };

    // save the translation into our translation table
    // the table object that is saved to the database
    const tableObj: ITranslateDbObject = {
      requestId: context.awsRequestId,
      ...body,
      ...rtnData,
    };

    const tableInsetCmd: dynamodb.PutItemCommandInput = {
      TableName: TRANSLATION_TABLE_NAME,
      Item: marshall(tableObj),
    };

    await dynamodbClient.send(new dynamodb.PutItemCommand(tableInsetCmd));
    return gateway.createSuccessJsonResponse(rtnData);
  } catch (e: any) {
    console.error(e);
    return gateway.createErrorJsonResponse(e);
  }
};

export const getTranslatons: lambda.APIGatewayProxyHandler = async function (
  event: lambda.APIGatewayProxyEvent,
  context: lambda.Context
) {
  try {
    const scanCmd: dynamodb.ScanCommandInput = {
      TableName: TRANSLATION_TABLE_NAME,
    };

    console.log("scanCmd", scanCmd);

    const { Items } = await dynamodbClient.send(
      new dynamodb.ScanCommand(scanCmd)
    );

    if (!Items) {
      throw new Error("no items found");
    }

    console.log("Items", Items);

    const rtnData = Items.map((item) => unmarshall(item) as ITranslateDbObject);
    console.log(rtnData);

    return gateway.createSuccessJsonResponse(rtnData);
  } catch (e: any) {
    console.error(e);
    return gateway.createErrorJsonResponse(e);
  }
};
