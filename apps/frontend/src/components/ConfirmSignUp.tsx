import { useUser } from "@/hooks";
import { IRegisterConfirmation, ISignUpState } from "@/lib";
import React from "react";
import { useForm, SubmitHandler } from "react-hook-form";

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

  const { confirmRegister } = useUser();

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
        <label htmlFor="email">Email:</label>
        <input id="email" {...register("email", { required: true })} />
        {errors.email && <span>field is required</span>}
      </div>

      <div>
        <label htmlFor="verificationCode">Verification Code:</label>
        <input
          id="verificationCode"
          type="string"
          {...register("verificationCode", { required: true })}
        />
        {errors.verificationCode && <span>field is required</span>}
      </div>

      <button className="btn bg-blue-500" type="submit">
        {"confirm"}
      </button>
    </form>
  );
};
