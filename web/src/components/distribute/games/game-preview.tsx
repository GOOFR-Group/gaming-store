import { Game } from "@/components/game";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function GamePreview(props: {
  title: string;
  publisherName: string;
  price: number;
  previewMultimediaUrl: string;
}) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="p-0 h-fit" variant="link">
          Open preview
        </Button>
      </DialogTrigger>
      <DialogContent className="w-fit">
        <DialogHeader>
          <DialogTitle>Preview</DialogTitle>
          <DialogDescription>
            This is how the game will be displayed in the store.
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center justify-center">
          <div className="w-fit border border-muted border-dashed p-4 rounded-md">
            <Game
              image={props.previewMultimediaUrl}
              price={props.price}
              publisher={props.publisherName}
              title={props.title}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
