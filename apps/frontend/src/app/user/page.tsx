"use client";
import { useEffect, useState } from "react";
import { getCurrentUser, signOut } from "aws-amplify/auth";
import { LoginForm } from "@/components";

function Logout({ onSignedOut }: { onSignedOut: () => void }) {
  return (
    <div className="flex w-full">
      <button
        className="btn bg-blue-500 w-full"
        onClick={async () => {
          await signOut();
          onSignedOut();
        }}
      >
        Logout
      </button>
    </div>
  );
}

export default function User() {
  const [user, setUser] = useState<object | null | undefined>(undefined);

  useEffect(() => {
    async function fetchUser() {
      try {
        const currUser = await getCurrentUser();
        console.log(currUser);
        setUser(currUser);
      } catch (e) {
        setUser(null);
      }
    }

    fetchUser();
  }, []);

  if (user === undefined) {
    return <p>loading...</p>;
  }

  if (user) {
    return (
      <Logout
        onSignedOut={() => {
          setUser(null);
        }}
      />
    );
  }

  return (
    <LoginForm
      onSignedIn={async () => {
        const currUser = await getCurrentUser();
        setUser(currUser);
      }}
    />
  );
}
