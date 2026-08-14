import * as React from "react";
import { cn } from "@/lib/utils";
import { buttonVariants, type ButtonProps } from "./button";

const LinkButton = React.forwardRef<HTMLAnchorElement, ButtonProps & React.AnchorHTMLAttributes<HTMLAnchorElement>>(
  ({ className, variant, ...props }, ref) => {
    return (
      <a
        className={cn(buttonVariants({ variant, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
LinkButton.displayName = "LinkButton";

export { LinkButton };
