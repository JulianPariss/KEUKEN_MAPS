import { useEffect, useRef, useState, type RefObject } from "react";
import { SearchIcon, TrashcanIcon } from '@repo/icons';

interface IProps {
    setSearchValue: (value: string) => void;
    sidebarRef: RefObject<HTMLDivElement | null>;
}

const SearchBar = (props: IProps) => {
    const [localValue, setLocalValue] = useState<string>('');
    const inputRef = useRef<HTMLInputElement>(null);
    const { setSearchValue, sidebarRef } = props;

    useEffect(() => {
        if (!localValue.length) setSearchValue('');
    }, [localValue])

    const handleClick = () => {
        setSearchValue(localValue);
        if (sidebarRef.current) {
            sidebarRef.current.scrollTop = 0;
        }
    }
    const handleClean = () => {
        setSearchValue('');
        setLocalValue('');
        inputRef.current!.value = '';
    }

    return (
        <form onSubmit={(e) => {
            e.preventDefault();
            handleClick();
        }}>
            <div className="bg-primary-950/30 backdrop-blur-xl border border-main/10 rounded-dx w-full sticky top-0 p-2 flex justify-between items-center shadow-inner shadow-black/15">
                <input
                    ref={inputRef}
                    onChange={(e) => setLocalValue(e.target.value)}
                    className="bg-primary-500/25 border border-main/10 focus:border-focus-300/60 p-1.5 rounded-dx w-full mr-1.5 outline-none px-3 text-xs text-main placeholder:text-main/40 caret-focus-300 transition-colors"
                    type="text"
                    placeholder="Nombre/Código"
                />
                <button
                    className="bg-focus-500 hover:bg-focus-300 active:bg-focus-500/70 text-variant rounded-dx py-1.5 px-3.5 cursor-pointer transition-all shadow-xs flex items-center justify-center"
                    type="submit"
                >
                    <SearchIcon className="size-4 stroke-variant" />
                </button>
                <button
                    className={`${localValue ? 'bg-focus-500 hover:bg-focus-300 cursor-pointer' : 'bg-focus-500/30 opacity-40 cursor-not-allowed'} text-variant rounded-dx py-1.5 px-2.5 ml-1 active:bg-focus-500/70 transition-all shadow-xs flex items-center justify-center`}
                    onClick={localValue ? handleClean : undefined}
                    type="button"
                >
                    <TrashcanIcon className="size-4 stroke-variant" />
                </button>
            </div>
        </form>
    );
};

export default SearchBar;
