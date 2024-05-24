"use client";
import { useState } from "react";
import { useTranslate } from "@/hooks";

export default function Home() {
  const [inputLang, setInputLang] = useState<string>("");
  const [outputLang, setOutputLang] = useState<string>("");
  const [inputText, setInputText] = useState<string>("");

  const {
    isLoading,
    translations,
    translate,
    isTranslating,
    deleteTranslation,
    isDeleting,
  } = useTranslate();

  if (isLoading) {
    return <p>loading...</p>;
  }

  return (
    <main className="flex flex-col m-8">
      <form
        className="flex flex-col space-y-4"
        onSubmit={async (event) => {
          event.preventDefault();
          let result = await translate({
            sourceLang: inputLang,
            targetLang: outputLang,
            sourceText: inputText,
          });
          console.log(result);
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
          {isTranslating ? "translating..." : "translate"}
        </button>
      </form>

      <div className="flex flex-col space-y-1">
        {translations.map((item) => (
          <div
            className="flex flex-row justify-between p-1 space-x-1 bg-slate-400"
            key={item.requestId}
          >
            <p>
              {item.sourceLang}/{item.sourceText}
            </p>
            <p>
              {item.targetLang}/{item.targetText}
            </p>
            <button
              className="btn p-1 bg-red-500 hover:bg-red-300 rounded-md"
              type="button"
              onClick={async () => {
                deleteTranslation(item);
              }}
            >
              {isDeleting ? "..." : "X"}
            </button>
          </div>
        ))}
      </div>
    </main>
  );
}
