"use client";
import { useState } from "react";
import { ITranslateRequest, ITranslateResponse } from "@sff/shared-types";

const URL = "https://uq8tjcg2n9.execute-api.us-west-1.amazonaws.com/prod/";

export const translateText = async ({
  inputLang,
  inputText,
  outputLang,
}: {
  inputLang: string;
  inputText: string;
  outputLang: string;
}) => {
  try {
    const request: ITranslateRequest = {
      sourceLang: inputLang,
      targetLang: outputLang,
      sourceText: inputText,
    };

    const result = await fetch(`${URL}`, {
      method: "POST",
      body: JSON.stringify(request),
    });

    const rtnValue = (await result.json()) as ITranslateResponse;
    return rtnValue;
  } catch (e: any) {
    console.error(e);
    throw e;
  }
};

export default function Home() {
  const [inputLang, setInputLang] = useState<string>("");
  const [outputLang, setOutputLang] = useState<string>("");
  const [inputText, setInputText] = useState<string>("");
  const [outputText, setOutputText] = useState<ITranslateResponse | null>(null);

  return (
    <main className="flex flex-col m-8">
      <form
        className="flex flex-col space-y-4"
        onSubmit={async (event) => {
          event.preventDefault();
          const result = await translateText({
            inputLang,
            outputLang,
            inputText,
          });
          console.log(result);
          setOutputText(result);
        }}
      >
        <div>
          <label htmlFor="inputText">Input text:</label>
          <textarea
            id="inputText"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            rows={3}
          />
        </div>

        <div>
          <label htmlFor="inputLang">Input Language:</label>
          <input
            id="inputLang"
            type="text"
            value={inputLang}
            onChange={(e) => setInputLang(e.target.value)}
          />
        </div>

        <div>
          <label htmlFor="outputLang">Output Language:</label>
          <input
            id="outputLang"
            type="text"
            value={outputLang}
            onChange={(e) => setOutputLang(e.target.value)}
          />
        </div>

        <button className="btn bg-blue-500" type="submit">
          translate
        </button>
      </form>

      <div>
        <p>Result:</p>
        <pre style={{ whiteSpace: "pre-wrap" }} className="w-full">
          {JSON.stringify(outputText, null, 2)}
        </pre>
      </div>
    </main>
  );
}
