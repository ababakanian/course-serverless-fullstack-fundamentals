"use client";
import { useEffect, useState } from "react";
import {
  signUp,
  confirmSignUp,
  autoSignIn,
  SignUpOutput,
  SignInOutput,
} from "aws-amplify/auth";
import Link from "next/link";
import { useRouter } from "next/navigation";

type ISignUpState = SignUpOutput["nextStep"];
type ISignInState = SignInOutput["nextStep"];

function RegistrationForm({
  onStepChange,
}: {
  onStepChange: (step: ISignUpState) => void;
}) {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [password2, setPassword2] = useState<string>("");

  return (
    <form
      className="flex flex-col space-y-4"
      onSubmit={async (event) => {
        event.preventDefault();

        try {
          if (password !== password2) {
            throw new Error("password don't match");
          }

          const { nextStep } = await signUp({
            username: email,
            password: password,
            options: {
              userAttributes: {
                email,
              },
              autoSignIn: true,
            },
          });

          console.log(nextStep.signUpStep);
          onStepChange(nextStep);
        } catch (e) {}
      }}
    >
      <div>
        <label htmlFor="email">E-mail:</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      <div>
        <label htmlFor="password">Password:</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>

      <div>
        <label htmlFor="password2">Retype Password:</label>
        <input
          id="password2"
          type="password"
          value={password2}
          onChange={(e) => setPassword2(e.target.value)}
        />
      </div>

      <button className="btn bg-blue-500" type="submit">
        Register
      </button>
      <Link className="hover:underline" href="/user">
        Login
      </Link>
    </form>
  );
}

function ConfirmSignUp({
  onStepChange,
}: {
  onStepChange: (step: ISignUpState) => void;
}) {
  const [verificationCode, setVerificationCode] = useState<string>("");
  const [email, setEmail] = useState<string>("");

  return (
    <form
      className="flex flex-col space-y-4"
      onSubmit={async (event) => {
        event.preventDefault();

        try {
          const { nextStep } = await confirmSignUp({
            confirmationCode: verificationCode,
            username: email,
          });

          console.log(nextStep.signUpStep);
          onStepChange(nextStep);
        } catch (e) {}
      }}
    >
      <div>
        <label htmlFor="email">E-mail:</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      <div>
        <label htmlFor="verificationCode">VerificationCode:</label>
        <input
          id="verificationCode"
          type="text"
          value={verificationCode}
          onChange={(e) => setVerificationCode(e.target.value)}
        />
      </div>

      <button className="btn bg-blue-500" type="submit">
        Confirm
      </button>
    </form>
  );
}

function AutoSignIn({
  onStepChange,
}: {
  onStepChange: (step: ISignInState) => void;
}) {
  useEffect(() => {
    const asyncSignIn = async () => {
      const { nextStep } = await autoSignIn();
      console.log(nextStep);
      onStepChange(nextStep);
    };

    asyncSignIn();
  }, []);

  return <div>signing in...</div>;
}

export default function Register() {
  const router = useRouter();
  const [step, setStep] = useState<ISignInState | ISignUpState | null>(null);

  useEffect(() => {
    if (!step) {
      return;
    }
    if ((step as ISignInState).signInStep === "DONE") {
      router.push("/");
    }
  }, [step]);

  if (step) {
    if ((step as ISignUpState).signUpStep === "CONFIRM_SIGN_UP") {
      return <ConfirmSignUp onStepChange={setStep} />;
    }
    if ((step as ISignUpState).signUpStep === "COMPLETE_AUTO_SIGN_IN") {
      return <AutoSignIn onStepChange={setStep} />;
    }
  }

  return <RegistrationForm onStepChange={setStep} />;
}
