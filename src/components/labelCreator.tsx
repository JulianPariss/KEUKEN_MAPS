import { useEffect, useState } from "react";
import { CrossIcon } from '@repo/icons';

interface IProps {
    suggValues: string;
    defaultValues?: string[];
    setParsedData: (value: string[]) => void;
}

const LabelCreator = ({ setParsedData, defaultValues = [], suggValues }: IProps) => {
    const [value, setValue] = useState<string>("");
    const [labelList, setLabelList] = useState<string[]>(defaultValues ?? []);

    const splitBySpaceAndDash = (text: string): string[] => {
        const tokens = text
            .split(/[\s-]+/)
            .map((t) => t.trim().toLowerCase())
            .filter(Boolean);

        return Array.from(new Set(tokens));
    };

    const existTag = (name: string): boolean => {
        const clean = name.toLowerCase().trim();
        return labelList.includes(clean);
    };

    const removeTag = (name: string) => {
        const clean = name.toLowerCase().trim();
        setLabelList(labelList.filter(lb => lb !== clean));
    };

    const addTag = (name: string) => {
        const clean = name.toLowerCase().trim();
        setLabelList((prev) => [...prev, clean]);
    };

    const addTags = (tags: string[]) => {
        const cleanTagList: string[] = [];
        tags.forEach(tag => {
            const clean = tag.toLowerCase().trim();
            if (clean.trim().length > 0 && !existTag(clean)) {
                cleanTagList.push(clean);
            }
        });
        setLabelList((prev) => [...prev, ...cleanTagList]);
    }


    const commitCurrentValue = () => {
        const clean = value.toLowerCase().trim();
        if (clean.length > 0 && !existTag(clean)) {
            addTag(clean);
        }
        setValue("");
    };

    const handleChangeExtraTags = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;

        if (val.endsWith(" ") || val.endsWith("-")) {
            const clean = val.slice(0, -1).toLowerCase();

            if (clean.trim().length > 0 && !existTag(clean)) {
                addTag(clean);
            }

            setValue("");
            return;
        }

        setValue(val);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            e.preventDefault();
            e.stopPropagation();
            commitCurrentValue();
        }
    };

    useEffect(() => {
        if (suggValues.endsWith(" ") || suggValues.endsWith("-")) {
            addTags(splitBySpaceAndDash(suggValues));
        }
    }, [suggValues])

    useEffect(() => {
        setParsedData(Array.from(new Set([...labelList])));
    }, [labelList]);

    const Label = ({ name }: { name: string }) => (
        <div
            className="
            rounded-full cursor-pointer
            bg-focus-500 hover:bg-error border border-focus-300/40 hover:border-error/50
            text-variant hover:text-white
            h-fit hover:scale-95 duration-150 transition-all
            flex flex-row justify-between items-center px-2.5 py-0.5 shadow-xs group gap-x-1"
            onClick={() => { removeTag(name); }}
            title={`Eliminar etiqueta "${name}"`}
        >
            <p className="text-center text-xs font-medium select-none">{name}</p>
            <CrossIcon className="size-3.5 stroke-variant group-hover:stroke-white transition-colors" />
        </div>
    );

    return (
        <div className="w-full h-fit flex flex-col gap-y-2">
            <input
                className="w-full p-2 bg-primary-500/20 border border-main/15 focus:border-focus-300 rounded-dx text-main placeholder:text-main/40 text-xs outline-none transition-colors shadow-xs"
                value={value}
                onChange={handleChangeExtraTags}
                onKeyDown={handleKeyDown}
                type="text"
                placeholder="Ingrese las etiquetas que quiera crear"
            />
            <div className="flex flex-wrap gap-1.5 mt-2">
                {Array.from(new Set([...labelList])).map((lb, i) => (
                    <Label key={i} name={lb} />
                ))}
            </div>
        </div>
    );
};

export default LabelCreator;

