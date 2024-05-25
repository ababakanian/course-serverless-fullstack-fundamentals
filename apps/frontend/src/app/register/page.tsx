"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ISignInState, ISignUpState } from "@/lib";
import { ConfirmSignUp, RegistrationForm } from "@/components";
import { useUser } from "@/hooks";

function AutoSignIn({
  onStepChange,
}: {
  onStepChange: (step: ISignInState) => void;
}) {
  const { autoLogin } = useUser();

  useEffect(() => {
    autoLogin().then((nextStep) => {
      if (nextStep) {
        console.log(nextStep);
        onStepChange(nextStep);
      }
    });
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
