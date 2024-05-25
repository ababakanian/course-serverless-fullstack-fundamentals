"use client";
import React from "react";
import { ITranslateResult } from "@sff/shared-types";
import { Card } from "./ui/card";
import { cn } from "@/lib/utils";
import { ArrowRight, Trash2 } from "lucide-react";
import { getDate, getTime } from "@/lib";
import { Button } from "./ui/button";
import { useTranslate } from "@/hooks";
import { Loading } from "./ui/loading";

export const TranslateCard = ({
  selected,
  onSelected,
  translateItem,
}: {
  selected: boolean;
  onSelected: (item: ITranslateResult) => void;
  translateItem: ITranslateResult;
}) => {
  const { deleteTranslation, isDeleting } = useTranslate();

  return (
    <Card
      onClick={() => {
        onSelected(translateItem);
      }}
      className={cn(
        "flex flex-row items-center justify-between px-4 py-2 space-x-1 border-0",
        "bg-gray-50 hover:bg-blue-200 cursor-pointer",
        selected && "bg-blue-400 hover:bg-blue-500"
      )}
    >
      <div className={cn("flex flex-col text-gray-900")}>
        <div className="flex flex-row text-base font-semibold">
          <p>{translateItem.sourceLang}</p>
          <ArrowRight />
          <p>{translateItem.targetLang}</p>
        </div>

        <p>{translateItem.sourceText}</p>
        <div className="text-gray-400">
          <p>{getDate(parseInt(translateItem.requestId))}</p>
          <p>{getTime(parseInt(translateItem.requestId))}</p>
        </div>
      </div>

      <Button
        className="bg-transparent hover:bg-transparent text-gray-700 hover:text-red-700"
        onClick={async () => {
          deleteTranslation(translateItem);
        }}
      >
        {isDeleting ? <Loading /> : <Trash2 />}
      </Button>
    </Card>
  );
};
