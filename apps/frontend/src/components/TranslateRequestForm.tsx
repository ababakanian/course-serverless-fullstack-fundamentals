"use client";
import { useTranslate } from "@/hooks";
import { ITranslateRequest } from "@sff/shared-types";
import React, { useEffect } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { useApp } from "./AppProvider";

export const TranslateRequestForm = () => {
  const { translate, isTranslating } = useTranslate();
  const { selectedTranslation } = useApp();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ITranslateRequest>();

  useEffect(() => {
    if (selectedTranslation) {
      setValue("sourceLang", selectedTranslation.sourceLang);
      setValue("sourceText", selectedTranslation.sourceText);
      setValue("targetLang", selectedTranslation.targetLang);
    }
  }, [selectedTranslation]);

  const onSubmit: SubmitHandler<ITranslateRequest> = (data, event) => {
    event && event.preventDefault();
    translate(data);
  };

  return (
    <form className="flex flex-col space-y-4" onSubmit={handleSubmit(onSubmit)}>
      <div>
        <Label htmlFor="sourceText">Input text:</Label>
        <Textarea
          id="sourceText"
          {...register("sourceText", { required: true })}
          rows={3}
        />
        {errors.sourceText && <span>field is required</span>}
      </div>

      <div>
        <Label htmlFor="sourceLang">Input Language:</Label>
        <Input
          id="sourceLang"
          type="text"
          {...register("sourceLang", { required: true })}
        />
        {errors.sourceLang && <span>field is required</span>}
      </div>

      <div>
        <Label htmlFor="targetLang">Output Language:</Label>
        <Input
          id="targetLang"
          type="text"
          {...register("targetLang", { required: true })}
        />
        {errors.targetLang && <span>field is required</span>}
      </div>

      <Button type="submit">
        {isTranslating ? "translating..." : "translate"}
      </Button>

      <div>
        <Label htmlFor="targetText">Translated text:</Label>
        <Textarea
          readOnly
          id="targetText"
          value={selectedTranslation?.targetText}
          rows={3}
        />
      </div>
    </form>
  );
};
