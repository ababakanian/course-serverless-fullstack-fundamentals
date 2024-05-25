"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useEffect } from "react";

export type IComboboxOption<T> = {
  label: string;
  value: string;
  data: T;
};

export type ICombobox<T> = {
  placeholder: string;
  options: Array<IComboboxOption<T>>;
  onSelect: (a: IComboboxOption<T>) => void;
  selected: IComboboxOption<T> | null | undefined;
};

export function Combobox<T>({
  placeholder,
  options,
  selected,
  onSelect,
}: ICombobox<T>) {
  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState("");

  useEffect(() => {
    if (selected) {
      setValue(selected?.value);
    }
  }, [selected]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[200px] justify-between"
        >
          {value
            ? options.find((framework) => framework.value === value)?.label
            : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder={placeholder} />
          <CommandEmpty>No framework found.</CommandEmpty>
          <CommandList>
            {options.map((framework) => (
              <CommandItem
                key={framework.value}
                value={framework.value}
                onSelect={(currentValue) => {
                  const selectedOption = options.find(
                    (opt) => opt.value == currentValue
                  );
                  setValue(currentValue === value ? "" : currentValue);
                  setOpen(false);
                  if (selectedOption) {
                    onSelect(selectedOption);
                  }
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    value === framework.value ? "opacity-100" : "opacity-0"
                  )}
                />
                {framework.label}
              </CommandItem>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
