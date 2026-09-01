"use client";

import { Loader2 } from "lucide-react";
import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";

type Props = React.ComponentProps<typeof Button> & {
  pendingLabel?: string;
};

/**
 * Disables itself while the enclosing form's action is in flight — what stops a
 * double submit creating two documents.
 */
export function SubmitButton({
  children,
  pendingLabel,
  disabled,
  ...props
}: Props) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending || disabled} aria-busy={pending} {...props}>
      {pending ? (
        <>
          <Loader2 className="size-4 animate-spin" />
          {pendingLabel ?? "Working…"}
        </>
      ) : (
        children
      )}
    </Button>
  );
}
