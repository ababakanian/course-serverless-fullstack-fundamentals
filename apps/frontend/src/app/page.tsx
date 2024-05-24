"use client";
import { useState } from "react";
import { useTranslate } from "@/hooks";
import { TranslateRequestForm } from "@/components";

export default function Home() {
  const { isLoading, translations, deleteTranslation, isDeleting } =
    useTranslate();

  if (isLoading) {
    return <p>loading...</p>;
  }

  return (
    <main className="flex flex-col m-8">
      <TranslateRequestForm />

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
