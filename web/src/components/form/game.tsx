import { useForm } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "@tanstack/react-router";
import { CalendarIcon, ChevronsUpDown } from "lucide-react";
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
import { cn } from "@/lib/utils";

const genres = [
  { label: "Action", value: "action" },
  { label: "Adventure", value: "adventure" },
  { label: "RPG", value: "rpg" },
  { label: "Strategy", value: "strategy" },
  { label: "Simulation", value: "simulation" },
  { label: "Sport", value: "sport" },
  { label: "Puzzle", value: "puzzle" },
  { label: "Shooter", value: "shooter" },
  { label: "Racing", value: "racing" },
];

const languages = [
  { label: "English", value: "en" },
  { label: "Spanish", value: "es" },
  { label: "French", value: "fr" },
  { label: "German", value: "de" },
  { label: "Italian", value: "it" },
  { label: "Japanese", value: "ja" },
  { label: "Korean", value: "ko" },
  { label: "Chinese (Simplified)", value: "zh-CN" },
  { label: "Russian", value: "ru" },
  { label: "Portuguese", value: "pt" },
];

const formSchema = z.object({
  title: z.string().min(2, {
    message: "Title must be at least 2 characters",
  }),
  genres: z.array(z.string()).min(1, {
    message: "At least one genre must be selected",
  }),
  releaseDate: z.date({
    required_error: "A release date is required",
  }),
  about: z.string().min(10, {
    message: "About must be at least 10 characters",
  }),
  features: z.string().min(10, {
    message: "Features must be at least 10 characters",
  }),
  languages: z.array(z.string()).min(1, {
    message: "At least one language must be selected",
  }),
  systemRequirements: z.object({
    minimum: z.string().min(10, {
      message: "Minimum requirements must be at least 10 characters",
    }),
    recommended: z.string().min(10, {
      message: "Recommended requirements must be at least 10 characters",
    }),
  }),
  screenshots: z.array(z.instanceof(File)).min(1, {
    message: "At least one screenshot must be uploaded",
  }),
  ageRating: z.number().min(0, {
    message: "An age rating is required",
  }),
  price: z.number().min(0, {
    message: "Price must be a positive number",
  }),
  isActive: z.boolean(),
});

export function GameForm({
  mode,
  defaultValues,
  onSave,
}: {
  mode: "add" | "edit";
  defaultValues?: z.infer<typeof formSchema>;
  onSave: () => void;
}) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultValues ?? {
      title: "",
      genres: [],
      releaseDate: new Date(),
      about: "",
      features: "",
      languages: [],
      systemRequirements: {
        minimum: "",
        recommended: "",
      },
      screenshots: [],
      ageRating: 3,
      price: 0,
      isActive: false,
    },
  });
  const navigate = useNavigate();

  function onSubmit() {
    onSave();
  }

  return (
    <Form {...form}>
      <form className="space-y-8" onSubmit={form.handleSubmit(onSubmit)}>
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
                    min={0}
                    placeholder="Enter price"
                    step={0.01}
                    type="number"
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value))}
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
                <FormLabel>Release Date</FormLabel>
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
                          field.value.toLocaleDateString()
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
                      disabled={(date) => date < new Date()}
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
                  defaultValue={`${field.value}`}
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
            name="genres"
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
                            {genres.map((genre) => (
                              <CommandItem
                                key={genre.value}
                                value={genre.label}
                                onSelect={() => {
                                  const newValue = field.value.includes(
                                    genre.value,
                                  )
                                    ? field.value.filter(
                                        (item) => item !== genre.value,
                                      )
                                    : [...field.value, genre.value];
                                  form.setValue("genres", newValue);
                                }}
                              >
                                <Checkbox
                                  checked={field.value.includes(genre.value)}
                                />
                                {genre.label}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </FormControl>
                <FormDescription>
                  {field.value.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {field.value.map((genre) => (
                        <Badge key={genre} variant="secondary">
                          {genres.find((g) => g.value === genre)?.label}
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
                            {languages.map((language) => (
                              <CommandItem
                                key={language.value}
                                value={language.label}
                                onSelect={() => {
                                  const newValue = field.value.includes(
                                    language.value,
                                  )
                                    ? field.value.filter(
                                        (item) => item !== language.value,
                                      )
                                    : [...field.value, language.value];
                                  form.setValue("languages", newValue);
                                }}
                              >
                                <Checkbox
                                  checked={field.value.includes(language.value)}
                                />
                                {language.label}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </FormControl>
                <FormDescription>
                  {field.value.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {field.value.map((lang) => (
                        <Badge key={lang} variant="secondary">
                          {languages.find((l) => l.value === lang)?.label}
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
            name="screenshots"
            render={() => (
              <FormItem>
                <FormLabel>Screenshots</FormLabel>
                <FormControl>
                  <Input
                    multiple
                    accept="image/*"
                    type="file"
                    onChange={(e) => {
                      const files = Array.from(e.target.files || []);
                      form.setValue("screenshots", files);
                    }}
                  />
                </FormControl>
                <FormDescription>
                  Upload at least one screenshot of the game
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
          name="about"
          render={({ field }) => (
            <FormItem>
              <FormLabel>About the Game</FormLabel>
              <FormControl>
                <Textarea
                  className="resize-none"
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
                  className="resize-none"
                  placeholder="Enter key features of the game"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Separator />

        <h1>System Requirements</h1>

        <FormField
          control={form.control}
          name="systemRequirements.minimum"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Minimum</FormLabel>
              <FormControl>
                <Textarea
                  className="resize-none"
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
          name="systemRequirements.recommended"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Recommended</FormLabel>
              <FormControl>
                <Textarea
                  className="resize-none"
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
            variant="ghost"
            onClick={() =>
              navigate({
                to:
                  mode === "add"
                    ? "/distribute/games"
                    : "/distribute/games/$gameId",
              })
            }
          >
            Cancel
          </Button>
          <Button type="submit">
            {mode === "add" ? "Add Game" : "Edit Game"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
