import {
  forwardRef,
  InputHTMLAttributes,
  ReactElement,
  ReactNode,
  Ref,
} from "react";

import { Upload } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type FileInputProps<T> = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "value" | "children"
> & {
  children: ReactNode | ((value: NonNullable<T>) => ReactNode);
  value: T;
  action?: ReactNode | ((value: NonNullable<T>) => ReactNode);
};

function FileInputRoot<T>(
  { children, value, action, className, ...props }: FileInputProps<T>,
  ref: Ref<HTMLInputElement>,
) {
  return (
    <Button
      asChild
      variant="ghost"
      className={cn(
        "flex justify-start truncate cursor-pointer border",
        className,
      )}
    >
      <label
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            // Prevents scrolling behavior when the space bar is pressed.
            if (e.key === " ") {
              e.preventDefault();
            }

            const label = e.currentTarget as HTMLLabelElement;

            // Check that the keyboard event was triggered by the label and not
            // by any child elements.
            if (label === e.target) {
              const input = label.firstElementChild as HTMLInputElement;
              input.click();
            }
          }
        }}
      >
        <Input {...props} ref={ref} className="hidden" type="file" />

        {!value || (Array.isArray(value) && !value.length) ? (
          <div className="w-full flex justify-center items-center gap-2 text-muted-foreground">
            <Upload />
            Click to upload
          </div>
        ) : (
          <>
            <span className="w-full truncate mr-1">
              {typeof children === "function" ? children(value) : children}
            </span>
            {action && (
              <div className="ml-auto w-fit">
                {typeof action === "function" ? action(value) : action}
              </div>
            )}
          </>
        )}
      </label>
    </Button>
  );
}

export const FileInput = forwardRef(FileInputRoot) as <T>(
  props: FileInputProps<T> & { ref?: Ref<HTMLInputElement> },
) => ReactElement;
