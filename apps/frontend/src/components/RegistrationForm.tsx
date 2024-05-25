import { useUser } from "@/hooks";
import { IRegisterFormData, ISignUpState } from "@/lib";
import React from "react";
import { useForm, SubmitHandler } from "react-hook-form";

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

  const { register: accountRegister } = useUser();

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
        <label htmlFor="email">Email:</label>
        <input id="email" {...register("email", { required: true })} />
        {errors.email && <span>field is required</span>}
      </div>

      <div>
        <label htmlFor="password">Password:</label>
        <input
          id="password"
          type="password"
          {...register("password", { required: true })}
        />
        {errors.password && <span>field is required</span>}
      </div>

      <div>
        <label htmlFor="password2">Retype Password:</label>
        <input
          id="password2"
          type="password"
          {...register("password2", { required: true })}
        />
        {errors.password2 && <span>field is required</span>}
      </div>

      <button className="btn bg-blue-500" type="submit">
        {"register"}
      </button>
    </form>
  );
};
