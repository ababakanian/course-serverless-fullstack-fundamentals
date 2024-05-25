import { useUser } from "@/hooks";
import { IRegisterConfirmation, ISignUpState } from "@/lib";
import React from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Button } from "./ui/button";

export const ConfirmSignUp = ({
  onStepChange,
}: {
  onStepChange: (step: ISignUpState) => void;
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<IRegisterConfirmation>();

  const { busy, confirmRegister } = useUser();

  const onSubmit: SubmitHandler<IRegisterConfirmation> = async (
    data,
    event
  ) => {
    event && event.preventDefault();
    confirmRegister(data).then((nextStep) => {
      if (nextStep) {
        console.log(nextStep.signUpStep);
        onStepChange(nextStep);
      }
    });
  };

  return (
    <form className="flex flex-col space-y-4" onSubmit={handleSubmit(onSubmit)}>
      <div>
        <Label htmlFor="email">Email:</Label>
        <Input id="email" {...register("email", { required: true })} />
        {errors.email && <span>field is required</span>}
      </div>

      <div>
        <Label htmlFor="verificationCode">Verification Code:</Label>
        <Input
          id="verificationCode"
          type="string"
          {...register("verificationCode", { required: true })}
        />
        {errors.verificationCode && <span>field is required</span>}
      </div>

      <Button type="submit">{busy ? "confirming..." : "confirm"}</Button>
    </form>
  );
};
