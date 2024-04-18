"use client";
import { useState } from "react";

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
  return fetch(`${URL}`, {
    method: "POST",
    body: JSON.stringify({
      sourceLang: inputLang,
      targetLang: outputLang,
      text: inputText,
    }),
  })
    .then((response) => response.json())
    .catch((e) => e.toString());
};

export default function Home() {
  const [inputLang, setInputLang] = useState("");
  const [outputLang, setOutputLang] = useState("");
  const [inputText, setInputText] = useState("");
  const [outputText, setOutputText] = useState("");

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
