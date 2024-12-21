import { move } from "@dnd-kit/helpers";
import { DragDropProvider } from "@dnd-kit/react";
import { useSortable } from "@dnd-kit/react/sortable";
import { GripVertical, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Multimedia, TemporaryMultimedia } from "@/domain/multimedia";
import { getMultimediaName } from "@/lib/utils";

function MultimediaItem(props: {
  multimedia: Multimedia | TemporaryMultimedia;
  index: number;
  onRemove: (index: number) => void;
}) {
  const { ref } = useSortable({
    id: props.multimedia.id,
    index: props.index,
  });

  function getImageSrc() {
    if ("url" in props.multimedia) {
      return props.multimedia.url;
    }

    return URL.createObjectURL(props.multimedia.file);
  }

  return (
    <li
      ref={ref}
      className="border border-secondary px-3 py-2 flex items-center rounded-lg gap-4 bg-background"
    >
      <img
        alt=""
        className="h-32 object-cover aspect-video rounded-lg"
        src={getImageSrc()}
      />

      <span className="text-foreground flex-1 truncate">
        {getMultimediaName(props.multimedia)}
      </span>

      <Button
        size="icon"
        variant="destructive"
        onClick={() => props.onRemove(props.index)}
      >
        <Trash2 />
      </Button>

      <GripVertical className="text-muted-foreground size-4" />
    </li>
  );
}

export function MultimediaUploadList<
  T extends Multimedia | TemporaryMultimedia,
>(props: { multimedia: T[]; onChange: (multimedia: T[]) => void }) {
  return (
    <DragDropProvider
      onDragEnd={(event) => {
        props.onChange(
          move(
            props.multimedia,
            event.operation.source,
            event.operation.target,
          ),
        );
      }}
    >
      <ul className="flex flex-col gap-2">
        {props.multimedia.map((multimedia, index) => {
          return (
            <MultimediaItem
              key={multimedia.id}
              index={index}
              multimedia={multimedia}
              onRemove={(index) => {
                const updatedMultimedia = [...props.multimedia];
                updatedMultimedia.splice(index, 1);
                props.onChange(updatedMultimedia);
              }}
            />
          );
        })}
      </ul>
    </DragDropProvider>
  );
}
