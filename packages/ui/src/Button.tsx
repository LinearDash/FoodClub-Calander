import * as React from "react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", ...props }, ref) => {
    let variantStyles = "";
    if (variant === "primary") {
      variantStyles = "bg-primary text-white hover:opacity-90";
    } else if (variant === "secondary") {
      variantStyles = "bg-surface-container-low text-on-surface hover:bg-surface-container";
    } else if (variant === "outline") {
      variantStyles = "border border-outline-variant text-on-surface hover:bg-surface";
    }

    return (
      <button
        ref={ref}
        className={`px-4 py-2 rounded-xl font-medium transition-colors ${variantStyles} ${className || ""}`}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
