import * as clientTranslate from "@aws-sdk/client-translate";
import { ITranslateRequest } from "@sff/shared-types";
import { MissingParameters } from "./appExceptions";

export async function getTranslation({
  sourceLang,
  targetLang,
  sourceText,
}: ITranslateRequest) {
  const translateClient = new clientTranslate.TranslateClient({});

  const translateCommand = new clientTranslate.TranslateTextCommand({
    SourceLanguageCode: sourceLang,
    TargetLanguageCode: targetLang,
    Text: sourceText,
  });

  const result = await translateClient.send(translateCommand);

  if (!result.TranslatedText) {
    throw new MissingParameters("TranslationText");
  }

  return result.TranslatedText;
}
