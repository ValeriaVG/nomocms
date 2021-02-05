import { faCircleNotch } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { HTMLProps } from "react";
import "./table.scss";

export type TableColumns<T> = {
  [key: string]: {
    label?: string | React.ReactElement;
    field?: keyof T;
    render?: (data: T) => string | React.ReactElement;
  };
};

export default function Table<T>({
  columns,
  items,
  keyField,
  isLoading,
  ...props
}: HTMLProps<HTMLTableElement> & {
  isLoading?: boolean;
  items: T[];
  columns: TableColumns<T>;
  keyField: string;
}) {
  const [head, body] = Object.keys(columns).reduce(
    (a, key) => {
      const { field, label, render } = columns[key];
      a[0].push({ key, label });
      a[1].push({ key, field, render });
      return a;
    },
    [[], []]
  );
  return (
    <table className="table" {...props}>
      <thead>
        <tr>
          {head.map(({ key, label }) => (
            <th key={key}>{label ?? ""}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {items?.map(
          (item) =>
            item && (
              <tr key={item[keyField]}>
                {body.map(({ key, field, render }) => {
                  return (
                    <td key={key}>
                      {render
                        ? render(item)
                        : field
                        ? item[field]
                        : item[key] ?? ""}
                    </td>
                  );
                })}
              </tr>
            )
        )}
        {!isLoading && !items?.length && (
          <tr>
            <td colSpan={head.length}>No items yet</td>
          </tr>
        )}
        {isLoading && (
          <tr>
            <td colSpan={head.length}>
              <FontAwesomeIcon icon={faCircleNotch} spin />
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
}
