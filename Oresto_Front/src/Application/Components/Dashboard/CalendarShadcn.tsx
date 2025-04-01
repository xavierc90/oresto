import * as React from "react";
import { DayPicker } from "react-day-picker";
import { fr } from "date-fns/locale";
import { cn } from "../../../Infrastructure/ShadcnUi/Utils";
import { buttonVariants } from "../../../Infrastructure/ShadcnUi/ButtonVariants";

export type CalendarProps = React.ComponentProps<typeof DayPicker> & {
  interfaceType?: "client" | "restaurant";
};

function CalendarShadcn({
  className,
  classNames,
  showOutsideDays = false,
  interfaceType = "client",
  ...props
}: CalendarProps) {
  const selectedClass =
    interfaceType === "client"
      ? "bg-green-800 text-white font-bold"
      : "bg-red-500 text-white font-bold";

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      locale={fr}
      mode="single"
      className={cn("calendar", className)}
      classNames={{
        months: "flex flex-col text-sm",
        month: "space-y-4",
        caption: "relative flex items-center justify-between w-full",
        caption_label:
          "absolute left-1/2 transform -translate-x-1/2 text-center font-medium",
        nav_button_previous:
          "absolute left-0 top-1/2 transform -translate-y-1/2 ml-2",
        nav_button_next:
          "absolute right-0 top-1/2 transform -translate-y-1/2 mr-2",
        selected: selectedClass,
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-5 w-5 bg-transparent p-0 opacity-50 hover:opacity-100",
        ),
        weekdays: "flex justify-around",
        table: "w-full border-collapse space-y-1 dark:bg-dark-800", // Ajouter un fond sombre pour le tableau en mode sombre
        head_row: "flex",
        head_cell:
          "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
        row: "flex w-full mt-2",
        cell: "h-9 w-9 text-center text-sm p-0 relative dark:bg-dark-900", // Couleur de fond pour les cellules en mode sombre
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
      {...props}
    />
  );
}

CalendarShadcn.displayName = "Calendar";

export { CalendarShadcn };
