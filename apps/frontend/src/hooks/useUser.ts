"use client";

import { useApp } from "@/components";
import {
  ILoginFormData,
  IRegisterConfirmation,
  IRegisterFormData,
  ISignInState,
  ISignUpState,
  emptyPromise,
} from "@/lib";
import {
  signIn,
  getCurrentUser,
  signOut,
  signUp,
  confirmSignUp,
  autoSignIn,
} from "aws-amplify/auth";
import { useCallback, useEffect, useState } from "react";

export const useUser = () => {
  const [busy, setBusy] = useState<boolean>(false);
  const { user, setUser, setError, resetError } = useApp();

  useEffect(() => {
    async function fetchUser() {
      setBusy(true);
      await getUser();
      setBusy(false);
    }

    fetchUser();
  }, []);

  const getUser = async () => {
    try {
      const currUser = await getCurrentUser();
      setUser(currUser);
    } catch (e) {
      setUser(null);
    }
  };

  const login = useCallback(async ({ email, password }: ILoginFormData) => {
    try {
      setBusy(true);
      resetError();
      await signIn({
        username: email,
        password,
        options: {
          userAttributes: {
            email,
          },
        },
      });
      await getUser();
    } catch (e: any) {
      setError(e.toString());
    } finally {
      setBusy(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      setBusy(true);
      resetError();
      await signOut();
      setUser(null);
    } catch (e: any) {
      setError(e.toString());
    } finally {
      setBusy(false);
    }
  }, []);

  const register = async ({
    email,
    password,
    password2,
  }: IRegisterFormData): Promise<ISignUpState | null> => {
    let rtnValue = null;
    try {
      setBusy(true);
      resetError();
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
      rtnValue = nextStep as ISignUpState;
    } catch (e: any) {
      setError(e.toString());
    } finally {
      setBusy(false);
      return rtnValue;
    }
  };

  const confirmRegister = async ({
    email,
    verificationCode,
  }: IRegisterConfirmation): Promise<ISignUpState | null> => {
    let rtnValue = null;
    try {
      setBusy(true);
      resetError();
      const { nextStep } = await confirmSignUp({
        confirmationCode: verificationCode,
        username: email,
      });

      rtnValue = nextStep as ISignUpState;
    } catch (e: any) {
      setError(e.toString());
    } finally {
      setBusy(false);
      return rtnValue;
    }
  };

  const autoLogin = useCallback(async (): Promise<ISignInState | null> => {
    let rtnValue = null;
    try {
      setBusy(true);
      resetError();
      const { nextStep } = await autoSignIn();
      rtnValue = nextStep as ISignInState;
      await getUser();
    } catch (e: any) {
      setError(e.toString());
    } finally {
      setBusy(false);
      return rtnValue;
    }
  }, []);

  return {
    busy,
    user,
    login,
    logout,
    register,
    confirmRegister,
    autoLogin,
  };
};
