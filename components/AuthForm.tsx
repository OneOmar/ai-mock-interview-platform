"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import FormField from "@/components/FormField";

// Schema validation - conditionally includes name field for sign-up
const createAuthSchema = (isSignUp: boolean) =>
  z.object({
    name: isSignUp
      ? z
          .string()
          .min(2, "Name must be at least 2 characters")
          .max(50, "Name must be less than 50 characters")
          .regex(/^[a-zA-Z\s]+$/, "Name can only contain letters and spaces")
      : z.string().optional(),
    email: z
      .string()
      .email("Please enter a valid email address")
      .max(100, "Email must be less than 100 characters"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Password must contain at least one uppercase letter, one lowercase letter, and one number",
      ),
  });

type FormType = "sign-in" | "sign-up";

interface AuthFormProps {
  type: FormType;
}

const AuthForm = ({ type }: AuthFormProps) => {
  const router = useRouter();
  const isSignUp = type === "sign-up";
  const schema = createAuthSchema(isSignUp);

  // Initialize form with validation schema
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  // Handle form submission
  const onSubmit = async (values: z.infer<typeof schema>) => {
    try {
      // TODO: Replace with actual API calls
      if (isSignUp) {
        // await signUp(values);
        console.log("Creating account:", { ...values, password: "[HIDDEN]" });
        toast.success("Account created successfully. Please sign in.");
        router.push("/sign-in");
      } else {
        // await signIn(values);
        console.log("Signing in:", {
          email: values.email,
          password: "[HIDDEN]",
        });
        toast.success("Signed in successfully.");
        router.push("/"); // More specific redirect
      }
    } catch (error) {
      console.error("Auth error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Authentication failed";
      toast.error(errorMessage);
    }
  };

  const isSubmitting = form.formState.isSubmitting;

  return (
    <div className="card-border lg:min-w-[566px]">
      <div className="flex flex-col gap-6 card py-14 px-10">
        {/* Logo and brand */}
        <header className="flex flex-row gap-2 justify-center">
          <Image
            src="/logo.svg"
            alt="PrepWise logo"
            height={32}
            width={38}
            priority
          />
          <h2 className="text-primary-100">PrepWise</h2>
        </header>

        <p className="text-2xl font-semibold text-center text-gray-600">
          Practice job interviews with AI
        </p>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="w-full space-y-6 mt-4 form"
          >
            {/* Name field - only shown for sign-up */}
            {isSignUp && (
              <FormField
                control={form.control}
                name="name"
                label="Full Name"
                placeholder="Enter your full name"
                type="text"
                disabled={isSubmitting}
              />
            )}

            {/* Email field */}
            <FormField
              control={form.control}
              name="email"
              label="Email Address"
              placeholder="Enter your email address"
              type="email"
              disabled={isSubmitting}
            />

            {/* Password field */}
            <FormField
              control={form.control}
              name="password"
              label="Password"
              placeholder={
                isSignUp ? "Create a strong password" : "Enter your password"
              }
              type="password"
              disabled={isSubmitting}
            />

            {/* Submit button */}
            <Button type="submit" className="btn" disabled={isSubmitting}>
              {isSubmitting
                ? isSignUp
                  ? "Creating Account..."
                  : "Signing In..."
                : isSignUp
                  ? "Create Account"
                  : "Sign In"}
            </Button>
          </form>

          {/* Toggle between sign-in/sign-up */}
          <p className="text-center text-gray-600">
            {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
            <Link
              href={isSignUp ? "/sign-in" : "/sign-up"}
              className="font-semibold text-blue-600 hover:text-blue-800 transition-colors ml-1"
            >
              {isSignUp ? "Sign In" : "Sign Up"}
            </Link>
          </p>
        </Form>
      </div>
    </div>
  );
};

export default AuthForm;
