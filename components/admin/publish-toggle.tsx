import { SubmitButton } from "@/components/ui/submit-button";

type Props = {
  action: (formData: FormData) => Promise<void>;
  id: string;
  published: boolean;
};

/**
 * One-click publish/unpublish. A server component — only the submit button is
 * interactive, so no per-row client bundle.
 */
export function PublishToggle({ action, id, published }: Props) {
  return (
    <form action={action}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="published" value={published ? "false" : "true"} />
      <SubmitButton
        variant="ghost"
        size="sm"
        pendingLabel={published ? "Unpublishing…" : "Publishing…"}
      >
        {published ? "Unpublish" : "Publish"}
      </SubmitButton>
    </form>
  );
}
