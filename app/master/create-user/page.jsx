"use client";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useState } from "react";
import CreateUserForm from "@/components/CreateUserForm";

export default function CreateUserPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [error, setError] = useState("");

  const handleCreateUser = async (userData) => {
    try {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create user");
      }

      router.push("/master");
    } catch (err) {
      setError(err.message);
    }
  };

  // Redirect if not master
  if (session?.user.role !== "MASTER") {
    router.push("/auth/login");
    return null;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Create New User</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <CreateUserForm onSubmit={handleCreateUser} />
    </div>
  );
}
