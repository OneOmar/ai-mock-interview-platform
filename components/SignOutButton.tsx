"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { signOut } from "@/lib/actions/auth.action";

export default function SignOutButton() {
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      const result = await signOut();

      if (result.success) {
        toast.success("Signed out successfully");
        router.push("/sign-in");
      } else {
        toast.error("Failed to sign out");
      }
    } catch (error) {
      console.error("Sign out error:", error);
      toast.error("An error occurred during sign out");
    }
  };

  return (
    <Button
      onClick={handleSignOut}
      variant="ghost"
      size="sm"
      className="flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-800"
    >
      <LogOut className="size-4" />
      <span className="max-sm:hidden">Sign Out</span>
    </Button>
  );
}
