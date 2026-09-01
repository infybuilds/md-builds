"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { SubmitButton } from "@/components/ui/submit-button";

type Props = {
  action: (formData: FormData) => Promise<void>;
  id: string;
  /** What is being deleted, e.g. 'Git Status'. */
  name: string;
  /** Consequence spelled out, e.g. what happens to child rows. */
  description?: string;
  label?: string;
};

/**
 * Two-step delete. The confirmation is a real second submit carrying
 * `confirm=delete`, which the server action verifies — a dialog alone is only a
 * speed bump, since anyone can POST the form directly.
 */
export function ConfirmDelete({
  action,
  id,
  name,
  description,
  label = "Delete",
}: Props) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-destructive">
          {label}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete “{name}”?</AlertDialogTitle>
          <AlertDialogDescription>
            {description ?? "This cannot be undone."}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          {/* Portaled out of any surrounding form, so this never nests forms. */}
          <form action={action}>
            <input type="hidden" name="id" value={id} />
            <input type="hidden" name="confirm" value="delete" />
            <AlertDialogAction asChild>
              <SubmitButton variant="destructive" pendingLabel="Deleting…">
                Delete
              </SubmitButton>
            </AlertDialogAction>
          </form>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
