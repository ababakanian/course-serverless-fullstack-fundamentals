import * as clientTranslate from "@aws-sdk/client-translate";
import * as lambda from "aws-lambda";

const translateClient = new clientTranslate.TranslateClient({});

export const index: lambda.APIGatewayProxyHandler = async function (
  event: lambda.APIGatewayProxyEvent
) {
  try {
    if (!event.body) {
      throw new Error("body is missing");
    }

    let body = JSON.parse(event.body);
    const { sourceLang, targetLang, text } = body;

    const now = new Date(Date.now()).toString();
    console.log(now);

    const translateCommand = new clientTranslate.TranslateTextCommand({
      SourceLanguageCode: sourceLang,
      TargetLanguageCode: targetLang,
      Text: text,
    });

    const result = await translateClient.send(translateCommand);
    console.log(result);

    return {
      statusCode: 200,
      body: result.TranslatedText,
    };
  } catch (e: any) {
    console.error(e);
    return {
      statusCode: 500,
      body: e.toString(),
    };
  }
};
