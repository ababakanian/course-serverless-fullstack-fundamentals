export type ITranslateRequest = {
  sourceLang: string;
  targetLang: string;
  sourceText: string;
};

export type ITranslateResponse = {
  timestamp: string;
  targetText: string;
};

export type ITranslateDbObject = ITranslateRequest &
  ITranslateResponse & {
    requestId: string;
  };
