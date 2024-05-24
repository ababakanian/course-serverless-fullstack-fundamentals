"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { emptyPromise, translateApi } from "@/lib";
import { AuthUser, getCurrentUser } from "aws-amplify/auth";
import { useEffect, useState } from "react";
import { ITranslatePrimaryKey, ITranslateRequest } from "@sff/shared-types";

export const useTranslate = () => {
  const [user, setUser] = useState<AuthUser | null | undefined>(undefined);
  const queryClient = useQueryClient();
  const queryKey = ["translate", user ? user.userId : ""];

  useEffect(() => {
    async function fetchUser() {
      try {
        const currUser = await getCurrentUser();
        setUser(currUser);
      } catch (e) {
        setUser(null);
      }
    }

    fetchUser();
  }, []);

  const translateQuery = useQuery({
    queryKey,
    queryFn: () => {
      console.log("translate query fn");
      if (!user) {
        return [];
      }
      return translateApi.getUsersTranslations();
    },
  });

  const translateMutation = useMutation({
    mutationFn: (request: ITranslateRequest) => {
      if (user) {
        return translateApi.translateUsersText(request);
      } else {
        return translateApi.translatePublicText(request);
      }
    },
    onSuccess: (result) => {
      console.log(result);
      if (translateQuery.data) {
        queryClient.setQueryData(
          queryKey,
          translateQuery.data.concat([result])
        );
      }
      //   return queryClient.invalidateQueries({
      //     queryKey,
      //   });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (key: ITranslatePrimaryKey) => {
      if (!user) {
        throw new Error("user not logged in");
      }

      return translateApi.deleteUserTranslation(key);
    },
    onSuccess: (result) => {
      if (!translateQuery.data) {
        return;
      }

      const index = translateQuery.data.findIndex(
        (tItem) => tItem.requestId === result.requestId
      );
      const copyData = [...translateQuery.data];
      copyData.splice(index, 1);
      queryClient.setQueryData(queryKey, copyData);
    },
  });

  return {
    translations: !translateQuery.data ? [] : translateQuery.data,
    isLoading: translateQuery.status === "pending",
    translate: translateMutation.mutate,
    isTranslating: translateMutation.status == "pending",
    deleteTranslation: deleteMutation.mutate,
    isDeleting: deleteMutation.status == "pending",
  };
};
