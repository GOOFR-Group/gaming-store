import { move } from "@dnd-kit/helpers";
import { DragDropProvider } from "@dnd-kit/react";
import { useSortable } from "@dnd-kit/react/sortable";
import { GripVertical } from "lucide-react";

import { Multimedia, TemporaryMultimedia } from "@/domain/multimedia";

function MultimediaItem(props: {
  multimedia: Multimedia | TemporaryMultimedia;
  index: number;
}) {
  const { ref } = useSortable({
    id: props.multimedia.id,
    index: props.index,
  });

  function getName() {
    if ("url" in props.multimedia) {
      const url = props.multimedia.url.split("/");
      return url[url.length - 1];
    }

    return props.multimedia.file.name;
  }

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

      <span className="text-foreground flex-1 truncate">{getName()}</span>

      <GripVertical className="ml-auto text-muted-foreground size-4" />
    </li>
  );
}

export function MultimediaUploadList<
  T extends Multimedia | TemporaryMultimedia,
>(props: { multimedia: T[]; onOrderChange: (multimedia: T[]) => void }) {
  return (
    <DragDropProvider
      onDragEnd={(event) => {
        props.onOrderChange(
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
            />
          );
        })}
      </ul>
    </DragDropProvider>
  );
}
