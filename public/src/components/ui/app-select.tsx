import * as React from 'react';
import { Select } from '@base-ui/react/select';
import { Check, ChevronDown } from 'lucide-react';

import { cn } from '../../lib/utils';

type SelectOptionInput =
  | string
  | {
      label: string;
      value: string;
      disabled?: boolean;
    };

interface AppSelectProps {
  id?: string;
  value: string;
  options: readonly SelectOptionInput[];
  onValueChange: (value: string) => void;
  className?: string;
  popupClassName?: string;
  itemClassName?: string;
  placeholder?: string;
  sideOffset?: number;
}

function normalizeOption(option: SelectOptionInput) {
  if (typeof option === 'string') {
    return {
      label: option,
      value: option,
      disabled: false,
    };
  }

  return {
    label: option.label,
    value: option.value,
    disabled: option.disabled ?? false,
  };
}

export function AppSelect({
  id,
  value,
  options,
  onValueChange,
  className,
  popupClassName,
  itemClassName,
  placeholder,
  sideOffset = 8,
}: AppSelectProps) {
  const normalizedOptions = React.useMemo(
    () => options.map(normalizeOption),
    [options]
  );

  const items = React.useMemo(
    () =>
      normalizedOptions.map((option) => ({
        label: option.label,
        value: option.value,
      })),
    [normalizedOptions]
  );

  return (
    <Select.Root
      items={items}
      modal={false}
      value={value}
      onValueChange={(nextValue) => {
        if (nextValue !== null) {
          onValueChange(nextValue);
        }
      }}
    >
      <Select.Trigger
        id={id}
        type="button"
        className={cn(
          'flex w-full items-center justify-between gap-3 text-left outline-none transition',
          className
        )}
      >
        <Select.Value
          placeholder={placeholder}
          className="min-w-0 flex-1 truncate"
        />
        <ChevronDown className="h-4 w-4 shrink-0 text-current/70" />
      </Select.Trigger>

      <Select.Portal>
        <Select.Positioner
          align="start"
          alignItemWithTrigger={false}
          side="bottom"
          sideOffset={sideOffset}
          className="z-50"
        >
          <Select.Popup
            className={cn(
              'overflow-hidden rounded-xl border border-emerald-200 bg-white shadow-[0_18px_40px_-18px_rgba(5,36,16,0.35)]',
              popupClassName
            )}
            style={{ width: 'var(--anchor-width)' }}
          >
            <Select.List
              className="dropdown-scrollbar overflow-y-auto p-1"
              style={{ maxHeight: 'min(18rem, var(--available-height))' }}
            >
              {normalizedOptions.map((option) => (
                <Select.Item
                  key={option.value}
                  value={option.value}
                  disabled={option.disabled}
                  className={({ disabled, highlighted, selected }) =>
                    cn(
                      'flex cursor-default items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm text-slate-700 outline-none transition-colors',
                      highlighted && 'bg-emerald-50 text-emerald-950',
                      selected && 'bg-emerald-100 font-medium text-emerald-950',
                      disabled && 'cursor-not-allowed opacity-50',
                      itemClassName
                    )
                  }
                >
                  <span className="truncate">{option.label}</span>
                  <Select.ItemIndicator className="shrink-0 text-emerald-700">
                    <Check className="h-4 w-4" />
                  </Select.ItemIndicator>
                </Select.Item>
              ))}
            </Select.List>
          </Select.Popup>
        </Select.Positioner>
      </Select.Portal>
    </Select.Root>
  );
}
