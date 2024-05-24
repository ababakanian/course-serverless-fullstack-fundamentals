import { ILoginFormData } from "@/lib";
import { signIn, signUp } from "aws-amplify/auth";
import React from "react";
import { useForm, SubmitHandler } from "react-hook-form";

export const LoginForm = ({ onSignedIn }: { onSignedIn: () => void }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ILoginFormData>();

  const onSubmit: SubmitHandler<ILoginFormData> = async (
    { email, password },
    event
  ) => {
    event && event.preventDefault();

    try {
      await signIn({
        username: email,
        password,
        options: {
          userAttributes: {
            email,
          },
        },
      });
      onSignedIn();
    } catch (e) {
      console.error(e);
    }
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

      <button className="btn bg-blue-500" type="submit">
        {"login"}
      </button>
    </form>
  );
};
