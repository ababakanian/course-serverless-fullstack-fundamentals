import { useUser } from "@/hooks";
import { IRegisterFormData, ISignUpState } from "@/lib";
import React from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Button } from "./ui/button";

export const RegistrationForm = ({
  onStepChange,
}: {
  onStepChange: (step: ISignUpState) => void;
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<IRegisterFormData>();

  const { busy, register: accountRegister } = useUser();

  const onSubmit: SubmitHandler<IRegisterFormData> = async (data, event) => {
    event && event.preventDefault();

    accountRegister(data).then((nextStep) => {
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
        <Input
          disabled={busy}
          id="email"
          {...register("email", { required: true })}
        />
        {errors.email && <span>field is required</span>}
      </div>

      <div>
        <Label htmlFor="password">Password:</Label>
        <Input
          disabled={busy}
          id="password"
          type="password"
          {...register("password", { required: true })}
        />
        {errors.password && <span>field is required</span>}
      </div>

      <div>
        <Label htmlFor="password2">Retype Password:</Label>
        <Input
          disabled={busy}
          id="password2"
          type="password"
          {...register("password2", { required: true })}
        />
        {errors.password2 && <span>field is required</span>}
      </div>

      <Button type="submit">{busy ? "registering..." : "register"}</Button>
    </form>
  );
};
