import { Control, Controller, FieldValues, Path } from "react-hook-form";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";

import {
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type InputType = "text" | "email" | "password" | "tel" | "number";

interface FormFieldProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  label: string;
  placeholder?: string;
  type?: InputType;
  disabled?: boolean;
}

const FormField = <T extends FieldValues>({
  control,
  name,
  label,
  placeholder,
  type = "text",
  disabled = false,
}: FormFieldProps<T>) => {
  // Password visibility state
  const [showPassword, setShowPassword] = useState(false);
  const isPasswordField = type === "password";

  // Toggle password visibility
  const togglePassword = () => setShowPassword(!showPassword);

  // Get actual input type (toggle password to text when visible)
  const inputType = isPasswordField && showPassword ? "text" : type;

  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <FormItem>
          <FormLabel className="label">{label}</FormLabel>
          <FormControl>
            <div className="relative">
              <Input
                {...field}
                type={inputType}
                placeholder={placeholder}
                disabled={disabled}
                className={`input ${isPasswordField ? "pr-12" : ""}`}
              />

              {/* Password toggle button */}
              {isPasswordField && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={togglePassword}
                  disabled={disabled}
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0 hover:bg-gray-100"
                >
                  {showPassword ? (
                    <Eye className="h-4 w-4 text-gray-500" />
                  ) : (
                    <EyeOff className="h-4 w-4 text-gray-500" />
                  )}
                </Button>
              )}
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default FormField;
