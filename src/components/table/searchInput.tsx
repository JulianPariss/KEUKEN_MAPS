import { useEffect, useState } from "react";
import { SearchIcon } from '@repo/icons';

const SearchInput = ({
    value,
    onChange,
    placeholder,
}: {
    value: string,
    onChange: (val: string) => void,
    placeholder: string,
}) => {
    const [localValue, setLocalValue] = useState(value);

    useEffect(() => {
        setLocalValue(value);
    }, [value]);

    return (
        <div className="flex items-center gap-2 group w-full">
            <SearchIcon className="stroke-white/40 size-3.5 group-focus-within:stroke-primary-light transition-colors duration-300" />
            <input
                type="text"
                value={localValue}
                onChange={(e) => {
                    setLocalValue(e.target.value);
                    onChange(e.target.value);
                }}
                onKeyDown={(e) => e.stopPropagation()}
                placeholder={placeholder}
                className="w-full bg-transparent border-b border-white/10 focus:border-primary-light pb-1 text-xs font-normal text-white focus:outline-none transition-all duration-300 ease-in-out placeholder:text-white/20"
            />
        </div>
    );
};

export default SearchInput;
