import { ChangeEvent } from "react";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { LoaderCircle, Upload } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { updateUser, uploadMultimedia } from "@/lib/api";
import { TOAST_MESSAGES } from "@/lib/constants";
import { ContentTooLarge } from "@/lib/errors";
import { userQueryKey } from "@/lib/query-keys";
import { getInitials } from "@/lib/utils";

export function UserAvatar(props: {
  id: string;
  displayName: string;
  url?: string;
}) {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    async mutationFn(file: File) {
      const multimedia = await uploadMultimedia(file);

      await updateUser(props.id, { pictureMultimediaId: multimedia.id });
    },
    async onSuccess() {
      await queryClient.invalidateQueries({ queryKey: userQueryKey });
    },
    onError(error) {
      if (error instanceof ContentTooLarge) {
        toast({
          variant: "destructive",
          title: "Picture size must be smaller than 20MB",
        });
        return;
      }

      toast(TOAST_MESSAGES.unexpectedError);
    },
  });

  /**
   * Handles file upload.
   * @param event Input change event.
   */
  function handleFileUpload(event: ChangeEvent<HTMLInputElement>) {
    const files = event.target.files;
    if (!files) {
      return;
    }

    mutation.mutate(files[0]);
  }

  return (
    <Avatar asChild className="relative size-24 group cursor-pointer">
      <label>
        <AvatarImage
          alt="Gamer Avatar"
          className="object-cover"
          src={props.url}
        />
        <AvatarFallback>{getInitials(props.displayName)}</AvatarFallback>
        {mutation.isPending ? (
          <>
            <div className="absolute size-full bg-black opacity-70" />
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 ">
              <LoaderCircle className="animate-spin" />
            </div>
          </>
        ) : (
          <>
            <div className="absolute size-full bg-black opacity-0 group-hover:opacity-70 transition-opacity" />
            <Upload className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity" />
          </>
        )}
        <Input
          accept="image/png, image/jpeg"
          className="hidden"
          type="file"
          onChange={handleFileUpload}
        />
      </label>
    </Avatar>
  );
}
