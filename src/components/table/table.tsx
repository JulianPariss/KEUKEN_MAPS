import React, { type ReactNode, useMemo, useState, useEffect, useCallback } from 'react';
import {
    Disclosure,
    Heading,
    Button,
} from 'react-aria-components';
import { TableVirtuoso } from 'react-virtuoso';
import { ArrowIcon, FilterIcon } from '@repo/icons';
import SearchInput from './searchInput';
import VirtuosoComponents from './virtuosoComponents';
import type { ISelectOption } from '../../utils/types/general.types';
import CheckboxInput from './checkboxInput';

export interface ColumnType<T> {
    key?: string;
    title: ReactNode;
    dataIndex?: keyof T | string;
    render?: (value: any, record: T, index: number) => ReactNode;
    hint?: (value: any, record: T, index: number) => string | undefined;
    className?: string;
    width?: string | number;
    groupable?: boolean;
    groupRender?: (value: any, records: T[]) => ReactNode;
    groupValue?: (record: T) => any;
    alignment?: 'left' | 'center' | 'right';
    visible?: boolean;
    searchable?: boolean;
    selectbox?: boolean;
    options?: ISelectOption[];
    onSearch?: (value: any, searchText: string, record: T) => boolean;
}

export interface TableProps<T> {
    columns: ColumnType<T>[];
    dataSource: T[];
    rowKey?: string | ((record: T) => string);
    className?: string;
    emptyText?: ReactNode;
    groupBy?: keyof T | string;
    collapsible?: boolean;
    accordion?: boolean;
    defaultExpandedGroups?: 'all' | 'none' | string[];
    allowDynamicGrouping?: boolean;
    height?: string | number;
}



export function Table<T = any>({
    columns: originalColumns,
    dataSource,
    rowKey,
    className = '',
    emptyText = 'No hay datos disponibles',
    groupBy,
    collapsible = false,
    accordion = false,
    defaultExpandedGroups = 'all',
    allowDynamicGrouping = false,
    height = '100%',
}: TableProps<T>) {
    const columns = useMemo(() => {
        return originalColumns.filter(col => col.visible !== false);
    }, [originalColumns]);

    const [currentGroupBy, setCurrentGroupBy] = useState<string | undefined>(groupBy as string);
    const [filters, setFilters] = useState<{ [key: string]: any }>({});

    useEffect(() => {
        setCurrentGroupBy(groupBy as string);
    }, [groupBy]);

    const handleFilterChange = useCallback((dataIndex: string, value: any) => {
        setFilters(prev => ({
            ...prev,
            [dataIndex]: value
        }));
    }, []);

    const getValue = (record: T, dataIndex?: keyof T | string) => {
        if (!dataIndex) return undefined;

        if (typeof dataIndex === 'string' && dataIndex.includes('.')) {
            return dataIndex.split('.').reduce((acc: any, part) => acc && acc[part], record);
        }

        return (record as any)[dataIndex];
    };

    const getRowKey = useCallback((record: T, index: number) => {
        if (typeof rowKey === 'function') {
            return rowKey(record);
        }
        if (typeof rowKey === 'string' && record && typeof record === 'object' && rowKey in record) {
            return String((record as any)[rowKey]);
        }
        if (record && typeof record === 'object' && 'id' in record) {
            return String((record as any).id);
        }
        return String(index);
    }, [rowKey]);

    const filteredDataSource = useMemo(() => {
        if (Object.keys(filters).length === 0) return dataSource;

        return dataSource.filter(record => {
            return Object.entries(filters).every(([key, filterValue]) => {
                if (!filterValue || (Array.isArray(filterValue) && filterValue.length === 0)) return true;

                const column = originalColumns.find(c => String(c.dataIndex) === key || c.key === key);
                const value = getValue(record, key);

                if (column?.onSearch) {
                    return column.onSearch(value, filterValue, record);
                }

                const searchValue = column?.groupValue ? column.groupValue(record) : value;

                if (searchValue === undefined || searchValue === null) return false;

                // Si el filtro es un array (viniendo de CheckboxInput) - Coincidencia estricta (debe tener todos)
                if (Array.isArray(filterValue)) {
                    if (Array.isArray(searchValue)) {
                        return filterValue.every(fv =>
                            searchValue.some(sv => String(sv).toLowerCase().includes(String(fv).toLowerCase()))
                        );
                    }
                    return filterValue.every(fv =>
                        String(searchValue).toLowerCase().includes(String(fv).toLowerCase())
                    );
                }

                return String(searchValue).toLowerCase().includes(String(filterValue).toLowerCase());
            });
        });
    }, [dataSource, filters, originalColumns]);


    const groupedData = useMemo(() => {
        if (!currentGroupBy) return null;

        const groupingCol = columns.find(c => String(c.dataIndex) === currentGroupBy || c.key === currentGroupBy);

        const groups = new Map<string, T[]>();
        filteredDataSource.forEach(record => {
            let val;
            if (groupingCol?.groupValue) {
                val = groupingCol.groupValue(record);
            } else {
                val = getValue(record, currentGroupBy);
            }

            const groupKey = val !== undefined && val !== null && val !== '' ? String(val) : 'Sin asignar';

            if (!groups.has(groupKey)) {
                groups.set(groupKey, []);
            }
            groups.get(groupKey)!.push(record);
        });

        return Array.from(groups.entries());
    }, [filteredDataSource, currentGroupBy, columns]);

    const [expandedKeys, setExpandedKeys] = useState<Set<string>>(new Set());

    useEffect(() => {
        if (defaultExpandedGroups === 'all' && groupedData) {
            setExpandedKeys(new Set(groupedData.map(([name]) => `group-${name}`)));
        } else if (Array.isArray(defaultExpandedGroups)) {
            setExpandedKeys(new Set(defaultExpandedGroups.map(k => `group-${k}`)));
        } else {
            setExpandedKeys(new Set());
        }
    }, [defaultExpandedGroups, groupedData]);

    const toggleGroup = (groupId: string) => {
        setExpandedKeys(prev => {
            const next = new Set(prev);
            if (next.has(groupId)) {
                next.delete(groupId);
            } else {
                if (accordion) {
                    next.clear();
                }
                next.add(groupId);
            }
            return next;
        });
    };

    type TableRow =
        | { type: 'header', id: string, name: string, count: number, items: T[], index: number }
        | { type: 'data', id: string, record: T, OriginalIndex: number, index: number };

    const unifiedRows = useMemo<TableRow[]>(() => {
        let globalIndex = 0;
        if (groupedData) {
            return groupedData.flatMap(([groupName, items]) => {
                const groupId = `group-${groupName}`;
                const groupHeader: TableRow = {
                    type: 'header',
                    id: groupId,
                    name: groupName,
                    count: items.length,
                    items: items,
                    index: globalIndex++
                };

                const isCollapsed = collapsible && !expandedKeys.has(groupId);
                if (isCollapsed) {
                    return [groupHeader];
                }

                const dataRows: TableRow[] = items.map((item) => ({
                    type: 'data',
                    id: getRowKey(item, filteredDataSource.indexOf(item)),
                    record: item,
                    OriginalIndex: filteredDataSource.indexOf(item),
                    index: globalIndex++
                }));
                return [groupHeader, ...dataRows];
            });
        }
        return filteredDataSource.map((item, idx) => ({
            type: 'data',
            id: getRowKey(item, idx),
            record: item,
            OriginalIndex: idx,
            index: globalIndex++
        }));
    }, [filteredDataSource, groupedData, getRowKey, expandedKeys, collapsible]);

    const renderCellContent = useCallback((record: T, col: ColumnType<T>, rowIndex: number) => {
        const val = getValue(record, col.dataIndex);
        return col.render ? col.render(val, record, rowIndex) : (val as ReactNode);
    }, []);

    const handleGroupBy = useCallback((dataIndex: string) => {
        setCurrentGroupBy(prev => prev === dataIndex ? undefined : dataIndex);
    }, []);

    const getAlignmentClass = (alignment?: 'left' | 'center' | 'right') => {
        switch (alignment) {
            case 'center': return 'text-center';
            case 'right': return 'text-right';
            default: return 'text-left';
        }
    };

    const getJustifyClass = (alignment?: 'left' | 'center' | 'right') => {
        switch (alignment) {
            case 'center': return 'justify-center';
            case 'right': return 'justify-end';
            default: return 'justify-start';
        }
    };

    const virtuosoStyle: React.CSSProperties = useMemo(() => ({
        height: height === '100%' ? '100%' : (typeof height === 'number' ? `${height}px` : height),
        width: '100%',
    }), [height]);

    const fixedHeaderContent = useCallback(() => (
        <tr className="shadow-md">
            {columns.map((col, index) => {
                const isGroupable = allowDynamicGrouping || col.groupable;
                const isGroupingByThis = currentGroupBy === col.dataIndex || currentGroupBy === col.key;
                const justifyClass = getJustifyClass(col.alignment);

                return (
                    <th
                        key={col.key || String(col.dataIndex) || index}
                        className={`bg-primary-main border-b border-primary-light/60 px-6 py-4 font-semibold outline-none transition-colors relative h-full align-top ${isGroupingByThis ? 'bg-primary-light/20 text-white' : ''} ${col.className || ''}`}
                        style={{ width: col.width || 'auto' }}
                    >
                        <div className="flex flex-col gap-2 h-full">
                            <div className={`flex items-center gap-2 group/col ${justifyClass}`}>
                                <span className="truncate" title={typeof col.title === 'string' ? col.title : undefined}>{col.title}</span>
                                {isGroupable && (
                                    <Button
                                        onPress={() => handleGroupBy(String(col.dataIndex || col.key))}
                                        className={`
                                            rounded-md transition-all 
                                            hover:bg-white/10 outline-none
                                            h-[16px]
                                            focus:ring-1 focus:ring-white/30
                                            ${isGroupingByThis ? 'opacity-100' : 'opacity-0 group-hover/col:opacity-100'}
                                            ${col.alignment === 'center' || col.alignment === 'right' ? 'absolute right-2' : ''}
                                        `}
                                        aria-label={`Agrupar por ${col.title}`}
                                    >
                                        <FilterIcon className={`size-full ${isGroupingByThis ? 'fill-primary-light' : 'fill-white/60'}`} />
                                    </Button>
                                )}
                            </div>
                            {col.searchable && (
                                <div className="w-full">
                                    <SearchInput
                                        value={filters[String(col.dataIndex || col.key)] || ''}
                                        onChange={(val) => handleFilterChange(String(col.dataIndex || col.key), val)}
                                        placeholder={`Buscar...`}
                                    />
                                </div>
                            )}
                            {col.selectbox && (
                                <div className="w-full">
                                    <CheckboxInput
                                        value={filters[String(col.dataIndex || col.key)] || []}
                                        onChange={(val) => handleFilterChange(String(col.dataIndex || col.key), val)}
                                        placeholder={`Seleccionar`}
                                        options={col.options || []}
                                        variant='input'
                                    />
                                </div>
                            )}
                        </div>
                    </th>
                );
            })}
        </tr>
    ), [columns, allowDynamicGrouping, currentGroupBy, filters, handleGroupBy, handleFilterChange]);

    const itemContent = useCallback((_: number, row: TableRow) => (
        row.type === 'header' ? (
            <td colSpan={columns.length} className="bg-primary-dark opacity-80 px-6 py-2.5 text-sm font-bold text-white uppercase align-middle">
                <div className="flex items-center gap-2">
                    {collapsible && (
                        <Disclosure
                            isExpanded={expandedKeys.has(row.id)}
                            onExpandedChange={() => toggleGroup(row.id)}
                        >
                            <Heading>
                                <Button
                                    slot="trigger"
                                    className="flex items-center justify-center w-6 h-6 rounded-full hover:bg-white/10"
                                >
                                    <ArrowIcon
                                        className={`w-3 h-3 fill-white ${expandedKeys.has(row.id) ? 'rotate-180' : 'rotate-0'}`}
                                    />
                                </Button>
                            </Heading>
                        </Disclosure>
                    )}
                    {(() => {
                        const groupingCol = columns.find(c => String(c.dataIndex) === currentGroupBy || c.key === currentGroupBy);
                        return groupingCol?.groupRender ? groupingCol.groupRender(row.name, row.items) : <span className="truncate" title={row.name}>{row.name}</span>;
                    })()}
                    <span className="text-white/50 font-normal ml-2 shrink-0">({row.count})</span>
                </div>
            </td>
        ) : (
            <>
                {columns.map((col, colIndex) => {
                    const rawValue = getValue(row.record, col.dataIndex);

                    const hintText = col.hint
                        ? col.hint(rawValue, row.record, row.OriginalIndex)
                        : (typeof rawValue === 'string' || typeof rawValue === 'number') ? String(rawValue) : undefined;

                    return (
                        <td
                            key={col.key || String(col.dataIndex) || colIndex}
                            className={`border-b border-primary-light/25 px-6 py-3 text-white align-middle max-w-0 ${getAlignmentClass(col.alignment)} ${col.className || ''}`}
                            title={hintText}
                        >
                            <div className="truncate w-full block">
                                {renderCellContent(row.record, col, row.OriginalIndex)}
                            </div>
                        </td>
                    );
                })}
            </>
        )
    ), [columns, collapsible, expandedKeys, currentGroupBy, renderCellContent]);

    return (
        <div className={`w-full h-full min-h-0 flex flex-col rounded-md border border-white/10 bg-primary-main/50 backdrop-blur-sm shadow-sm ${className}`}>
            {dataSource.length === 0 ? (
                <div className="flex items-center justify-center p-8 text-white/60 font-medium italic grow">
                    {emptyText}
                </div>
            ) : (
                <TableVirtuoso
                    style={virtuosoStyle}
                    data={unifiedRows}
                    increaseViewportBy={800}
                    overscan={500}
                    className="sleek-scrollbar w-full h-full"
                    components={VirtuosoComponents}
                    fixedHeaderContent={fixedHeaderContent}
                    itemContent={itemContent}
                />
            )}

            {dataSource.length > 0 && (
                <div className="bg-primary-dark/30 border-t border-white/5 px-6 py-1.5 flex items-center justify-end shrink-0 select-none">
                    <span className="text-[10px] text-white/30 uppercase font-bold tracking-widest">
                        Elementos: <span className="text-focus">{filteredDataSource.length}</span>
                    </span>
                </div>
            )}
        </div>
    );
}

export default Table;

