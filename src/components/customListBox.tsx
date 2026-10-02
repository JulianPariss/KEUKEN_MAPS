import { ListBox, ListBoxItem } from "react-aria-components";
import type { IListBoxItem } from "../utils/types/general.types";
import { useEffect, useRef } from "react";
import { CheckIcon } from '@repo/icons';

interface IProps {
  options: IListBoxItem[];
  handleChange: (value: any[] | any) => void;
  multiple?: boolean;
  defaultKey?: string | 'all';
  disabled?: boolean;
}


const CustomListBox = (props: IProps) => {
  const { options, handleChange, defaultKey = '', disabled = false } = props;

  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!defaultKey || !listRef.current) return;

    const timeout = setTimeout(() => {
      const el = listRef.current?.querySelector(`[data-key="${defaultKey}"]`);
      if (el) {
        el.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
    }, 0);

    return () => clearTimeout(timeout);
  }, [defaultKey, options]);

  useEffect(() => {
    if (disabled) {
      handleChange([]);
    }
  }, [disabled]);

  return (
    <ListBox
      ref={listRef}
      aria-label="lista de carteras"
      className="text-main h-full w-full outline-none"
      disabledKeys={defaultKey ? [defaultKey] : undefined}
      items={options}
      selectionMode="single"
      defaultSelectedKeys={defaultKey ? [defaultKey] : undefined}
      onSelectionChange={(e) => !disabled && handleChange(e)}
    >
      {(item) => (
        <ListBoxItem
          id={item.key.toString()}
          key={item.key.toString()}
          className={`
            my-1 py-1 px-2 bg-primary-500/10 text-main
            rounded-dx cursor-pointer transition-colors outline-none
            data-[selected]:bg-focus-500 data-[selected]:text-variant data-[selected]:font-medium
            data-[hovered]:bg-primary-500/30
            flex justify-between items-center
            data-[disabled]:cursor-not-allowed
            data-[disabled]:opacity-40
            ${disabled ? "opacity-50 pointer-events-none" : ""}
          `}
        >
          {({ isSelected }) => (
            <>
              <span>{item.label}</span>
              {isSelected && <CheckIcon className="w-4 h-4 stroke-variant opacity-90" />}
            </>
          )}
        </ListBoxItem>
      )}
    </ListBox>
  );
};

export default CustomListBox;
