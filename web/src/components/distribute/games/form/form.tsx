import { useForm } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { format } from "date-fns";
import {
  CalendarIcon,
  ChevronsUpDown,
  Download,
  LoaderCircle,
} from "lucide-react";
import * as z from "zod";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { FileInput } from "@/components/ui/file-input";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { EditableGame, NewGame } from "@/domain/game";
import { Multimedia, TemporaryMultimedia } from "@/domain/multimedia";
import { usePublisher } from "@/hooks/use-publisher";
import { useTags } from "@/hooks/use-tags";
import { useToast } from "@/hooks/use-toast";
import {
  createGame,
  createGameMultimedia,
  createGameTag,
  deleteGameMultimedia,
  deleteGameTag,
  updateGame,
  uploadMultimedia,
} from "@/lib/api";
import { decodeTokenPayload, getToken } from "@/lib/auth";
import {
  LANGUAGES,
  MISSING_VALUE_SYMBOL,
  TOAST_MESSAGES,
} from "@/lib/constants";
import { Conflict, ContentTooLarge } from "@/lib/errors";
import { withAuthErrors } from "@/lib/middleware";
import { cn, getMultimediaName } from "@/lib/utils";

import { GamePreview } from "../game-preview";
import { MultimediaUploadList } from "./multimedia-uploader";

const multimediaSchema = z.object(
  {
    id: z.string(),
    checksum: z.number(),
    mediaType: z.string(),
    url: z.string(),
    createdAt: z.string(),
  },
  {
    message: "Image preview is required",
  },
);

const formSchema = z
  .object({
    title: z.string().min(1, {
      message: "Title is required",
    }),
    tags: z
      .array(
        z.object({
          id: z.string(),
          name: z.string(),
          description: z.string(),
          createdAt: z.string(),
          modifiedAt: z.string(),
        }),
      )
      .min(1, {
        message: "At least one genre must be selected",
      }),
    releaseDate: z.date().optional(),
    description: z
      .string()
      .min(1, {
        message: "About the game is required",
      })
      .max(500, {
        message: "About the game must be shorter than 500 characters",
      }),
    features: z
      .string()
      .min(1, {
        message: "Game features are required",
      })
      .max(200, {
        message: "Game features must be shorter than 200 characters",
      }),
    languages: z
      .array(z.string())
      .min(1, {
        message: "At least one language must be selected",
      })
      .max(20, {
        message: "Languages exceed the maximum value of 20 languages",
      }),
    requirements: z.object({
      minimum: z
        .string()
        .min(1, {
          message: "Minimum requirements are required",
        })
        .max(200, {
          message: "Minimum requirements must be shorter than 200 characters",
        }),
      recommended: z
        .string()
        .min(1, {
          message: "Recommended requirements are required",
        })
        .max(200, {
          message:
            "Recommended requirements must be shorter than 200 characters",
        }),
    }),
    previewMultimedia: z.union([multimediaSchema, z.instanceof(File)]),
    downloadMultimedia: z.union(
      [multimediaSchema, z.instanceof(File).optional()],
      {
        message: "Game files are required",
      },
    ),
    multimedia: z
      .array(
        z.union([
          multimediaSchema,
          z.object({ id: z.string(), file: z.instanceof(File) }),
        ]),
      )
      .min(1, {
        message: "At least one screenshot must be uploaded",
      })
      .max(20, {
        message: "The game can only have a maximum of 20 screenshots",
      }),
    ageRating: z.string({
      message: "Age rating is required",
    }),
    price: z.preprocess(
      (price) => (String(price).length ? Number(String(price)) : Number.NaN),
      z
        .number({ message: "Price is required" })
        .min(0, { message: "Price must be a non negative number" })
        .multipleOf(0.01, {
          message: "Price should have a maximum of 2 decimal cases",
        }),
    ),
    isActive: z.boolean(),
  })
  .superRefine((data, ctx) => {
    if (data.releaseDate && !data.downloadMultimedia) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["downloadMultimedia"],
        message: "Game files are required when a release date is set",
      });

      return z.NEVER;
    }
  });

type GameFormSchemaType = z.infer<typeof formSchema>;

interface AddGameFormProps {
  mode: "add";
  onSave: () => void;
}

interface EditGameFormProps {
  mode: "edit";
  gameId: string;
  defaultValues: GameFormSchemaType;
  onSave: () => void;
}

type GameProps = AddGameFormProps | EditGameFormProps;

export function GameForm(props: GameProps) {
  const form = useForm<GameFormSchemaType>({
    resolver: zodResolver(formSchema),
    defaultValues:
      props.mode === "edit"
        ? props.defaultValues
        : {
            title: "",
            tags: [],
            releaseDate: undefined,
            description: "",
            features: "",
            languages: [],
            requirements: {
              minimum: "",
              recommended: "",
            },
            downloadMultimedia: undefined,
            previewMultimedia: undefined,
            multimedia: [],
            ageRating: undefined,
            price: undefined,
            isActive: false,
          },
  });
  const { toast } = useToast();
  const navigate = useNavigate();
  const publisherQuery = usePublisher();

  const mutation = useMutation({
    async mutationFn(data: GameFormSchemaType) {
      const token = getToken();
      const payload = decodeTokenPayload(token);
      const publisherId = payload.sub;

      let previewMultimedia: Multimedia;
      if (data.previewMultimedia instanceof File) {
        previewMultimedia = await uploadMultimedia(data.previewMultimedia);
      } else {
        previewMultimedia = data.previewMultimedia;
      }

      let downloadMultimedia: Multimedia | undefined;
      if (data.downloadMultimedia instanceof File) {
        downloadMultimedia = await uploadMultimedia(data.downloadMultimedia);
      } else {
        downloadMultimedia = data.downloadMultimedia;
      }

      if (props.mode === "add") {
        const newGame: NewGame = {
          title: data.title,
          price: data.price,
          isActive: data.isActive,
          description: data.description,
          ageRating: data.ageRating,
          features: data.features,
          languages: data.languages,
          requirements: data.requirements,
          previewMultimediaId: previewMultimedia.id,
        };

        if (data.releaseDate) {
          newGame.releaseDate = format(data.releaseDate, "yyyy-MM-dd");
        }

        if (downloadMultimedia) {
          newGame.downloadMultimediaId = downloadMultimedia.id;
        }

        const createdGame = await createGame(publisherId, newGame);

        // Upload multimedia files.
        const multimediaResults = await Promise.all(
          data.multimedia.map((multimedia) =>
            uploadMultimedia((multimedia as TemporaryMultimedia).file),
          ),
        );

        // Retrieve uploaded multimedia.
        const uploadedMultimedia: Multimedia[] = [];
        multimediaResults.forEach((result) => {
          uploadedMultimedia.push(result);
        });

        // Create game multimedia association.
        await Promise.all(
          uploadedMultimedia.map((multimedia, idx) =>
            createGameMultimedia(publisherId, createdGame.id, multimedia.id, {
              position: idx,
            }),
          ),
        );

        // Create game tag association.
        await Promise.all(
          data.tags.map((tag) =>
            createGameTag(publisherId, createdGame.id, tag.id),
          ),
        );

        return;
      }

      const editableGame: EditableGame = {
        title: data.title,
        price: data.price,
        isActive: data.isActive,
        description: data.description,
        ageRating: data.ageRating,
        features: data.features,
        languages: data.languages,
        requirements: data.requirements,
        previewMultimediaId: previewMultimedia.id,
      };

      if (data.releaseDate) {
        editableGame.releaseDate = format(data.releaseDate, "yyyy-MM-dd");
      }

      if (downloadMultimedia) {
        editableGame.downloadMultimediaId = downloadMultimedia.id;
      }

      const updatedGame = await updateGame(
        publisherId,
        props.gameId,
        editableGame,
      );

      const files: {
        index: number;
        data: TemporaryMultimedia;
      }[] = [];
      data.multimedia.forEach((multimedia, index) => {
        if ("file" in multimedia) {
          files.push({ index, data: multimedia });
        }
      });

      // Upload multimedia files.
      const multimediaResults = await Promise.all(
        files.map((file) => {
          return new Promise<{ index: number; multimedia: Multimedia }>(
            (resolve, reject) => {
              uploadMultimedia(file.data.file)
                .then((multimedia) =>
                  resolve({
                    index: file.index,
                    multimedia,
                  }),
                )
                .catch(reject);
            },
          );
        }),
      );

      // Retrieve existing multimedia.
      const updatedMultimedia = data.multimedia.filter(
        (multimedia) => "url" in multimedia,
      );
      multimediaResults.forEach((result) => {
        // Insert uploaded multimedia in the correct position.
        updatedMultimedia.splice(result.index, 0, result.multimedia);
      });

      // Delete previous game multimedia association.
      await Promise.all(
        updatedGame.multimedia.map((multimedia) =>
          deleteGameMultimedia(publisherId, updatedGame.id, multimedia.id),
        ),
      );

      // Delete previous game tag association.
      await Promise.all(
        updatedGame.tags.map((tag) =>
          deleteGameTag(publisherId, updatedGame.id, tag.id),
        ),
      );

      // Create game multimedia association.
      await Promise.all(
        updatedMultimedia.map((multimedia, idx) =>
          createGameMultimedia(publisherId, updatedGame.id, multimedia.id, {
            position: idx,
          }),
        ),
      );

      // Create game tag association.
      await Promise.all(
        data.tags.map((tag) =>
          createGameTag(publisherId, updatedGame.id, tag.id),
        ),
      );
    },
    onSuccess() {
      toast({
        title:
          props.mode === "add"
            ? "Game added successfully"
            : "Game updated successfully",
      });
      props.onSave();
    },
    onError: withAuthErrors((error) => {
      if (error instanceof ContentTooLarge) {
        toast({
          variant: "destructive",
          title: "File sizes must be smaller than 20 MB",
        });
        return;
      }

      if (error instanceof Conflict) {
        toast({
          variant: "destructive",
          title: "Each screenshot must be unique",
        });
        return;
      }

      toast(TOAST_MESSAGES.unexpectedError);
    }),
  });

  const tagsQuery = useTags();
  const tags = tagsQuery.data ?? [];

  /**
   * Handles form submission.
   * @param data Form data.
   */
  function onSubmit(data: GameFormSchemaType) {
    mutation.mutate(data);
  }

  return (
    <Form {...form}>
      <form
        noValidate
        className="space-y-8"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input placeholder="Enter game title" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Price</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    min={0}
                    placeholder="Enter price"
                    step={0.01}
                    type="number"
                    value={field.value ?? ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="releaseDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel optional>Release Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground",
                        )}
                      >
                        {field.value ? (
                          format(field.value, "dd/MM/yyyy")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent align="start" className="w-auto p-0">
                    <Calendar
                      initialFocus
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="ageRating"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Age Rating</FormLabel>
                <Select
                  defaultValue={field.value}
                  onValueChange={field.onChange}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select an age rating" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="3">3+</SelectItem>
                    <SelectItem value="7">7+</SelectItem>
                    <SelectItem value="12">12+</SelectItem>
                    <SelectItem value="16">16+</SelectItem>
                    <SelectItem value="18">18+</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="tags"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Genres</FormLabel>
                <FormControl>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          role="combobox"
                          variant="outline"
                          className={cn(
                            "w-full justify-between",
                            !field.value.length && "text-muted-foreground",
                          )}
                        >
                          {field.value.length > 0
                            ? `${field.value.length} selected`
                            : "Select genres"}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
                      <Command>
                        <CommandInput placeholder="Search" />
                        <CommandList>
                          <CommandEmpty>No genre found.</CommandEmpty>
                          <CommandGroup>
                            {tags.map((tag) => {
                              const isChecked = field.value.some(
                                (v) => v.id === tag.id,
                              );

                              return (
                                <CommandItem
                                  key={tag.id}
                                  value={tag.name}
                                  onSelect={() => {
                                    const newValue = isChecked
                                      ? field.value.filter(
                                          (item) => item.id !== tag.id,
                                        )
                                      : [...field.value, tag];
                                    form.setValue("tags", newValue);
                                  }}
                                >
                                  <Checkbox checked={isChecked} />
                                  {tag.name}
                                </CommandItem>
                              );
                            })}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </FormControl>
                <FormDescription asChild>
                  {field.value.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {field.value.map((tag) => (
                        <Badge key={tag.id} variant="secondary">
                          {tag.name}
                        </Badge>
                      ))}
                    </div>
                  )}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="languages"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Languages Supported</FormLabel>
                <FormControl>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          role="combobox"
                          variant="outline"
                          className={cn(
                            "w-full justify-between",
                            !field.value.length && "text-muted-foreground",
                          )}
                        >
                          {field.value.length > 0
                            ? `${field.value.length} selected`
                            : "Select languages"}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
                      <Command>
                        <CommandInput placeholder="Search" />
                        <CommandList>
                          <CommandEmpty>No language found.</CommandEmpty>
                          <CommandGroup>
                            {LANGUAGES.map((language) => {
                              const isChecked = field.value.includes(
                                language.code,
                              );

                              return (
                                <CommandItem
                                  key={language.code}
                                  value={language.name}
                                  onSelect={() => {
                                    const newValue = isChecked
                                      ? field.value.filter(
                                          (item) => item !== language.code,
                                        )
                                      : [...field.value, language.code];
                                    form.setValue("languages", newValue);
                                  }}
                                >
                                  <Checkbox checked={isChecked} />
                                  {language.name}
                                </CommandItem>
                              );
                            })}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </FormControl>
                <FormDescription asChild>
                  {field.value.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {field.value.map((lang) => (
                        <Badge key={lang} variant="secondary">
                          {
                            LANGUAGES.find((l) => l.code === lang.toUpperCase())
                              ?.name
                          }
                        </Badge>
                      ))}
                    </div>
                  )}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="isActive"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Active</FormLabel>
                <div className="flex items-center h-10">
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </div>
                <FormDescription>
                  Indicates whether the game is displayed in the store
                </FormDescription>
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>About the Game</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter a description of the game"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="features"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Game Features</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter key features of the game"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="previewMultimedia"
            render={({ field: { ref, name, onBlur, disabled, value } }) => {
              const formValues = form.watch();

              return (
                <FormItem>
                  <FormLabel>Image Preview</FormLabel>
                  <FormControl>
                    <FileInput
                      ref={ref}
                      accept="image/*"
                      className="w-full"
                      disabled={disabled}
                      name={name}
                      value={value}
                      action={(multimedia) => (
                        <GamePreview
                          price={formValues.price}
                          title={formValues.title}
                          previewMultimediaUrl={
                            "url" in multimedia
                              ? multimedia.url
                              : URL.createObjectURL(multimedia)
                          }
                          publisherName={
                            publisherQuery.data?.name ?? MISSING_VALUE_SYMBOL
                          }
                        />
                      )}
                      onBlur={onBlur}
                      onChange={(e) => {
                        const selectedFile = e.target.files?.item(0);
                        if (selectedFile) {
                          form.setValue("previewMultimedia", selectedFile);
                        }
                      }}
                    >
                      {(multimedia) => {
                        return getMultimediaName(multimedia);
                      }}
                    </FileInput>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              );
            }}
          />

          <FormField
            control={form.control}
            name="downloadMultimedia"
            render={({ field: { ref, name, onBlur, disabled, value } }) => (
              <FormItem>
                <FormLabel optional={!form.getValues().releaseDate}>
                  Game Files
                </FormLabel>
                <FormControl>
                  <FileInput
                    ref={ref}
                    accept="application/zip"
                    disabled={disabled}
                    name={name}
                    type="file"
                    value={value}
                    action={(gameFiles) => (
                      <Button
                        asChild
                        className="relative size-8 flex items-center left-2 text-muted-foreground hover:bg-primary/30"
                        size="icon"
                        variant="ghost"
                      >
                        <a
                          download={getMultimediaName(gameFiles)}
                          href={
                            "url" in gameFiles
                              ? gameFiles.url
                              : URL.createObjectURL(gameFiles)
                          }
                        >
                          <Download />
                        </a>
                      </Button>
                    )}
                    onBlur={onBlur}
                    onChange={(e) => {
                      const selectedFile = e.target.files?.item(0);
                      if (selectedFile) {
                        form.setValue("downloadMultimedia", selectedFile);
                      }
                    }}
                  >
                    {(gameFiles) => {
                      return getMultimediaName(gameFiles);
                    }}
                  </FileInput>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="multimedia"
          render={({ field: { ref, name, onBlur, disabled, value } }) => (
            <FormItem>
              <FormLabel>Screenshots</FormLabel>
              <FormControl>
                <FileInput
                  ref={ref}
                  multiple
                  accept="image/*"
                  disabled={disabled}
                  name={name}
                  value={value}
                  onBlur={onBlur}
                  onChange={(e) => {
                    const files = Array.from(e.target.files ?? []);
                    const updatedMultimedia = [...form.getValues("multimedia")];

                    for (let i = 0; i < files.length; i++) {
                      const file = files[i];
                      updatedMultimedia.push({
                        id: `${updatedMultimedia.length + i}`,
                        file,
                      });
                    }

                    form.setValue("multimedia", updatedMultimedia);

                    // Clear file input value to allow uploads of the same files.
                    e.currentTarget.value = "";
                  }}
                >
                  {(screenshots) => {
                    return `${screenshots.length} selected`;
                  }}
                </FileInput>
              </FormControl>
              <FormMessage />
              <MultimediaUploadList
                multimedia={form.getValues("multimedia")}
                onChange={(multimedia) =>
                  form.setValue("multimedia", multimedia)
                }
              />
            </FormItem>
          )}
        />

        <Separator />

        <h1>System Requirements</h1>

        <FormField
          control={form.control}
          name="requirements.minimum"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Minimum</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter minimum system requirements"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="requirements.recommended"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Recommended</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter recommended system requirements"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="w-full flex justify-end gap-2">
          <Button
            type="reset"
            variant="ghost"
            onClick={() =>
              navigate({
                to:
                  props.mode === "add"
                    ? "/distribute/games"
                    : "/distribute/games/$gameId",
              })
            }
          >
            Cancel
          </Button>
          <Button disabled={mutation.isPending} type="submit">
            {mutation.isPending && <LoaderCircle className="animate-spin" />}
            {props.mode === "add" ? "Add Game" : "Edit Game"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
