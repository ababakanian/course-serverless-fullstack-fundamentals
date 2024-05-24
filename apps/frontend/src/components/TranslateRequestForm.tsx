import { useTranslate } from "@/hooks";
import { ITranslateRequest } from "@sff/shared-types";
import React from "react";
import { useForm, SubmitHandler } from "react-hook-form";

export const TranslateRequestForm = () => {
  const { translate, isTranslating } = useTranslate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ITranslateRequest>();

  const onSubmit: SubmitHandler<ITranslateRequest> = (data, event) => {
    event && event.preventDefault();
    translate(data);
  };

  return (
    <form className="flex flex-col space-y-4" onSubmit={handleSubmit(onSubmit)}>
      <div>
        <label htmlFor="sourceText">Input text:</label>
        <textarea
          id="sourceText"
          {...register("sourceText", { required: true })}
          rows={3}
        />
        {errors.sourceText && <span>field is required</span>}
      </div>

      <div>
        <label htmlFor="sourceLang">Input Language:</label>
        <input
          id="sourceLang"
          type="text"
          {...register("sourceLang", { required: true })}
        />
        {errors.sourceLang && <span>field is required</span>}
      </div>

      <div>
        <label htmlFor="targetLang">Output Language:</label>
        <input
          id="targetLang"
          type="text"
          {...register("targetLang", { required: true })}
        />
        {errors.targetLang && <span>field is required</span>}
      </div>

      <button className="btn bg-blue-500" type="submit">
        {isTranslating ? "translating..." : "translate"}
      </button>
    </form>
  );
};
