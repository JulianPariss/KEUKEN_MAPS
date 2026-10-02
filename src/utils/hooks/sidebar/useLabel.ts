import { useEffect, useState } from "react";
import type { ITag, ITagGroup } from "../../types/tags.types";
import { useAppSelector } from "../../../store/hooks";

export interface IUseLabel {
    setTagsFiltered: (value: ITag[]) => void;
    resetFilters: () => void;
    addTags: (tags: ITag[]) => void;
    removeTags: (tags: ITag[]) => void;
    removeGroup: (group: string) => void;
    matchesFilters: (target: {
        tags: ITag[];
    }) => boolean;
    isFiltering: boolean;
    setIsFiltering: (value: boolean) => void;
    viewFilters: boolean;
    setViewFilters: (value: boolean) => void;
    initGroupTag: (tagList: ITagGroup[]) => void;
    tagsFiltered: ITag[];
    getValuesToRender: (gr: ITagGroup | ITag, onlySelecteds: boolean) => string[];
    canCreateFilter: () => boolean;
    setActiveFilter: (value: number | null) => void;
    activeFilter: number | null;
}

const useLabel = (): IUseLabel => {
    const { enterprise_id } = useAppSelector((state) => state.user.enterprise);
    const [tagsFiltered, setTagsFiltered] = useState<ITag[]>([])
    const [isFiltering, setIsFiltering] = useState<boolean>(false);
    const [viewFilters, setViewFilters] = useState<boolean>(false);
    const [activeFilter, setActiveFilter] = useState<number | null>(null);

    const [groupTag, setGroupTag] = useState<string | null>(null);

    const resetFilters = () => {
        setTagsFiltered([]);
    }

    const addTags = (tagsToAdd: ITag[]) => {
        setTagsFiltered(prevTagsFiltered => {
            let newTagsFiltered = [...prevTagsFiltered];

            tagsToAdd.forEach(tagToAdd => {
                const existingTagIndex = newTagsFiltered.findIndex(
                    (tf) => tf.key === tagToAdd.key
                );

                if (existingTagIndex !== -1) {
                    const existingTag = newTagsFiltered[existingTagIndex];
                    const updatedLabels = Array.from(new Set([...existingTag.labels, ...tagToAdd.labels]));
                    newTagsFiltered[existingTagIndex] = { ...existingTag, labels: updatedLabels };
                } else {
                    newTagsFiltered.push(tagToAdd);
                }
            });
            return newTagsFiltered;
        });
        
    }

    const removeTags = (tagsToRemove: ITag[]) => {
        setTagsFiltered(prevTagsFiltered => {
            let newTagsFiltered = [...prevTagsFiltered];

            tagsToRemove.forEach(tagToRemove => {
                const existingTagIndex = newTagsFiltered.findIndex(
                    (tf) => tf.key === tagToRemove.key
                );

                if (existingTagIndex !== -1) {
                    const existingTag = newTagsFiltered[existingTagIndex];
                    const updatedLabels = existingTag.labels.filter(
                        (label) => !tagToRemove.labels.includes(label)
                    );

                    if (updatedLabels.length > 0) {
                        newTagsFiltered[existingTagIndex] = { ...existingTag, labels: updatedLabels };
                    } else {
                        newTagsFiltered = newTagsFiltered.filter((_, index) => index !== existingTagIndex);
                    }
                }
            });
            return newTagsFiltered;
        });
    }

    const removeGroup = (groupToRemove: string) => {
        setTagsFiltered(prevTagsFiltered => {
            return prevTagsFiltered.filter(
                (tag) => tag.key !== groupToRemove
            );
        });
    }


    const canCreateFilter = (): boolean => {
        const totalLabels = tagsFiltered.reduce((acc, tag) => acc + tag.labels.length, 0);
        return totalLabels > 0;
    };


    const matchesFilters = (target: { tags: ITag[] }) => {
        if (!tagsFiltered.length) return true;

        return tagsFiltered.every(filterGroup => {
            const targetGroup = target.tags.find(t => t.key === filterGroup.key);
            if (!targetGroup) return false;
            if (!filterGroup.labels.length) return true;
            return filterGroup.labels.some(value => targetGroup.labels.includes(value));
        });
    };

    const initGroupTag = (tagList: ITagGroup[]) => {
        if (!tagList.length || groupTag) return

        setGroupTag(tagList[0].key)
    }

    const getValuesToRender = (gr: ITagGroup | ITag, onlySelecteds: boolean) => {
        return onlySelecteds
            ? gr?.labels ?? []
            : gr.labels;
    };

    useEffect(() => {
        resetFilters();
    }, [enterprise_id])

    return {
        setTagsFiltered,
        resetFilters,
        addTags,
        removeTags,
        removeGroup,
        matchesFilters,
        isFiltering,
        setIsFiltering,
        viewFilters,
        setViewFilters,
        initGroupTag,
        tagsFiltered,
        getValuesToRender,
        canCreateFilter,
        activeFilter,
        setActiveFilter,
    };
}


export default useLabel;