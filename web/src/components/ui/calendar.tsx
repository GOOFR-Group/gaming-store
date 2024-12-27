import * as React from "react";
import { DayPicker } from "react-day-picker";

import { ChevronLeft, ChevronRight } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select";

const months: Record<number, string> = {
  1: "January",
  2: "February",
  3: "March",
  4: "April",
  5: "May",
  6: "June",
  7: "July",
  8: "August",
  9: "September",
  10: "October",
  11: "November",
  12: "December",
};

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({
  className,
  classNames,
  onMonthChange,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  const [date, setDate] = React.useState<Date>(
    props.defaultMonth ?? new Date(),
  );

  const currentDate = new Date().getFullYear();
  const yearOptions = Array.from(
    { length: currentDate },
    (_, i) => currentDate - i,
  );
  const selectedYear =
    yearOptions.find((year) => year === date.getFullYear()) ?? yearOptions[0];

  return (
    <>
      <div className="flex p-1 space-x-2">
        <Select
          value={(new Date(date).getMonth() + 1).toString()}
          onValueChange={(value) => {
            setDate(new Date(date.setMonth(parseInt(value) - 1)));
          }}
        >
          <SelectTrigger className="flex-1 border-none">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {[...(new Array(12) as number[])].map((_, index) => {
              return (
                <SelectItem key={index + 1} value={(index + 1).toString()}>
                  {months[index + 1]}
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
        <Select
          value={String(selectedYear)}
          onValueChange={(value) => {
            setDate(new Date(date.setFullYear(parseInt(value))));
          }}
        >
          <SelectTrigger className="flex-1 border-none">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {yearOptions
              .map((_, index) => {
                return (
                  <SelectItem key={index + 1} value={(index + 1).toString()}>
                    {(index + 1).toString()}
                  </SelectItem>
                );
              })
              .slice(1900, new Date().getFullYear() + 1)
              .reverse()}
          </SelectContent>
        </Select>
      </div>

      <DayPicker
        className={cn("p-3", className)}
        month={date}
        showOutsideDays={showOutsideDays}
        classNames={{
          months:
            "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
          month: "space-y-4",
          caption: "flex justify-center pt-1 relative items-center",
          caption_label: "text-sm font-medium",
          nav: "space-x-1 flex items-center",
          nav_button: cn(
            buttonVariants({ variant: "outline" }),
            "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
          ),
          nav_button_previous: "absolute left-1",
          nav_button_next: "absolute right-1",
          table: "w-full border-collapse space-y-1",
          head_row: "flex",
          head_cell:
            "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
          row: "flex w-full mt-2",
          cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
          day: cn(
            buttonVariants({ variant: "ghost" }),
            "h-9 w-9 p-0 font-normal aria-selected:opacity-100",
          ),
          day_range_end: "day-range-end",
          day_selected:
            "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
          day_today: "bg-accent text-accent-foreground",
          day_outside:
            "day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
          day_disabled: "text-muted-foreground opacity-50",
          day_range_middle:
            "aria-selected:bg-accent aria-selected:text-accent-foreground",
          day_hidden: "invisible",
          ...classNames,
        }}
        components={{
          IconLeft: () => <ChevronLeft className="h-4 w-4" />,
          IconRight: () => <ChevronRight className="h-4 w-4" />,
        }}
        onMonthChange={(month) => {
          setDate(month);
          onMonthChange?.(month);
        }}
        {...props}
      />
    </>
  );
}
Calendar.displayName = "Calendar";

export { Calendar };
