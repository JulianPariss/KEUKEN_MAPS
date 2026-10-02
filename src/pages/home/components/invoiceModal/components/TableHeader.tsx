import { tableHeaders } from './constants';

export const TableHeader = () => (
  <tr className="sticky top-0 backdrop-blur-xl shadow-xs z-10 rounded-dx">
    {tableHeaders.map((header) => (
      <th
        key={header.id}
        className="text-main text-xs font-bold uppercase text-left p-2.5 bg-primary-950/95 border-y border-main/15 first:border-l first:rounded-l-dx last:border-r last:rounded-r-dx whitespace-nowrap"
        style={{ width: `${header.width}%` }}
      >
        {header.title}
      </th>
    ))}
  </tr>
);

export default TableHeader;
