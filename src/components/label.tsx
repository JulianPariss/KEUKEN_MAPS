import type { ReactNode } from "react";
import type { ITag } from "../utils/types/tags.types";

interface IProps {
  tag: string;
  groupKey: string;
  children: ReactNode;
  tagsFiltered: ITag[];
  setTagsFiltered: (value: ITag[]) => void;
}

const Label = ({ tag, groupKey, tagsFiltered, setTagsFiltered, children }: IProps) => {
  const group = tagsFiltered.find(tg => tg.key === groupKey);
  const isActive = group?.labels.includes(tag) ?? false;

  const handleClick = () => {
    let newTags = [...tagsFiltered];

    if (isActive) {
      const updatedValues = group!.labels.filter(v => v !== tag);
      if (updatedValues.length === 0) {
        newTags = newTags.filter(tg => tg.key !== groupKey);
      } else {
        newTags = newTags.map(tg =>
          tg.key === groupKey ? { ...tg, labels: updatedValues } : tg
        );
      }
    } else {
      const existingGroup = newTags.find(tg => tg.key === groupKey);
      if (existingGroup) {
        newTags = newTags.map(tg =>
          tg.key === groupKey
            ? { ...tg, labels: [...tg.labels, tag] }
            : tg
        );
      } else {
        newTags.push({ key: groupKey, labels: [tag] });
      }
    }

    setTagsFiltered(newTags);
  };

  return (
    <div
      onClick={handleClick}
      className={`px-3 py-1 rounded-dx cursor-pointer transition-all shadow-xs flex items-center justify-center border ${
        isActive
          ? "bg-focus-500 border-focus-300/50 shadow-focus-500/20"
          : "bg-primary-500/20 hover:bg-primary-500/35 border-main/10"
      }`}
    >
      <p
        className={`text-center text-xs transition-colors ${
          isActive ? "text-variant font-semibold" : "text-main"
        }`}
      >
        {children}
      </p>
    </div>
  );
};

export default Label;
