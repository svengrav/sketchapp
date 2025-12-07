import { Listbox, ListboxButton, ListboxOptions, ListboxOption } from "@headlessui/react";
import { ChevronUpDownIcon } from "@heroicons/react/24/solid";
import clsx from "clsx";

type SelectOption<T> = {
  value: T;
  label: string;
};

type SelectDropdownProps<T> = {
  value: T;
  onChange: (value: T) => void;
  options: SelectOption<T>[];
  label?: string;
};

/**
 * Wiederverwendbare Dropdown-Komponente mit Headless UI
 */
export function SelectDropdown<T>({
  value,
  onChange,
  options,
  label,
}: SelectDropdownProps<T>) {
  const selectedOption = options.find(opt => opt.value === value);

  return (
    <div>
      {label && (
        <label className="text-white/60 text-sm mb-2 block">{label}</label>
      )}
      <Listbox value={value} onChange={onChange}>
        <div className="relative">
          <ListboxButton className="w-full py-2.5 px-4 text-sm rounded-lg bg-zinc-800 text-white text-left flex items-center justify-between cursor-pointer hover:bg-zinc-700 transition-colors">
            <span>{selectedOption?.label ?? "Select..."}</span>
            <ChevronUpDownIcon className="w-5 h-5 text-white/60" />
          </ListboxButton>
          <ListboxOptions
            anchor="bottom start"
            className={clsx(
              "z-50 w-[var(--button-width)] bg-zinc-800 rounded-lg shadow-lg overflow-hidden max-h-60 overflow-y-auto",
              "transition duration-100 ease-in data-leave:data-closed:opacity-0"
            )}
          >
            {options.map((option, index) => (
              <ListboxOption
                key={index}
                value={option.value}
                className="py-2.5 px-4 text-sm text-white cursor-pointer hover:bg-indigo-600 data-selected:bg-indigo-600 transition-colors"
              >
                {option.label}
              </ListboxOption>
            ))}
          </ListboxOptions>
        </div>
      </Listbox>
    </div>
  );
}
