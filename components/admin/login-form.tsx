"use client";

import { useActionState } from "react";

import { FieldError, FormMessage } from "@/components/ui/field-error";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SubmitButton } from "@/components/ui/submit-button";
import { initialFormState, type FormState } from "@/lib/actions/form-state";

type Props = {
  action: (state: FormState, formData: FormData) => Promise<FormState>;
  next: string;
};

export function LoginForm({ action, next }: Props) {
  const [state, formAction] = useActionState(action, initialFormState);

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="next" value={next} />

      <FormMessage message={state.message} />

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          required
        />
        <FieldError messages={state.fieldErrors?.email} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
        />
        <FieldError messages={state.fieldErrors?.password} />
      </div>

      <SubmitButton className="w-full" pendingLabel="Signing in…">
        Sign in
      </SubmitButton>
    </form>
  );
}
