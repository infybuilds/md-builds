import { AlertCircle } from "lucide-react";

import { Alert, AlertDescription } from "@/components/ui/alert";

export function FieldError({ messages }: { messages?: string[] }) {
  if (!messages || messages.length === 0) return null;

  return (
    <p className="text-destructive text-xs" role="alert">
      {messages.join(" ")}
    </p>
  );
}

/** Form-level failure, e.g. a rejected sign-in or a database error. */
export function FormMessage({ message }: { message?: string }) {
  if (!message) return null;

  return (
    <Alert variant="destructive" role="alert">
      <AlertCircle />
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );
}
