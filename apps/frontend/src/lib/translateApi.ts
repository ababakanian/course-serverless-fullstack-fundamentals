import {
  ITranslateResult,
  ITranslateRequest,
  ITranslateResponse,
  ITranslatePrimaryKey,
  ITranslateResultList,
} from "@sff/shared-types";
import { fetchAuthSession } from "aws-amplify/auth";

const URL = "https://api.redrobotexample.com";

export const translatePublicText = async (request: ITranslateRequest) => {
  try {
    const result = await fetch(`${URL}/public`, {
      method: "POST",
      body: JSON.stringify(request),
    });

    const rtnValue = (await result.json()) as ITranslateResult | string;

    if (!result.ok) {
      throw new Error(rtnValue as string);
    }

    return rtnValue as ITranslateResult;
  } catch (e: any) {
    console.error(e);
    throw e;
  }
};

export const translateUsersText = async (request: ITranslateRequest) => {
  try {
    const authToken = (await fetchAuthSession()).tokens?.idToken?.toString();
    const result = await fetch(`${URL}/user`, {
      method: "POST",
      body: JSON.stringify(request),
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    const rtnValue = (await result.json()) as ITranslateResult | string;
    if (!result.ok) {
      throw new Error(rtnValue as string);
    }

    return rtnValue as ITranslateResult;
  } catch (e: any) {
    console.error(e);
    throw e;
  }
};

export const getUsersTranslations = async () => {
  try {
    const authToken = (await fetchAuthSession()).tokens?.idToken?.toString();
    const result = await fetch(`${URL}/user`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    const rtnValue = (await result.json()) as ITranslateResultList;
    return rtnValue;
  } catch (e: any) {
    console.error(e);
    throw e;
  }
};

export const deleteUserTranslation = async (item: ITranslatePrimaryKey) => {
  try {
    const authToken = (await fetchAuthSession()).tokens?.idToken?.toString();
    const result = await fetch(`${URL}/user`, {
      method: "DELETE",
      body: JSON.stringify(item),
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    const rtnValue = (await result.json()) as ITranslatePrimaryKey;
    return rtnValue;
  } catch (e: any) {
    console.error(e);
    throw e;
  }
};
