import preventDefault from "dashboard/utils/preventDefault";
import { HTMLProps } from "react";
import "./tabs.scss";
export default function Tabs<
  T extends Record<string, string | React.ReactElement>
>({
  active,
  labels,
  onChangeTab,
  ...props
}: {
  active?: keyof T;
  labels: T;
  onChangeTab?: (item: keyof T) => any;
} & HTMLProps<HTMLDivElement>) {
  return (
    <nav {...props}>
      <ul className="tabs">
        {Object.keys(labels).map((key, i, arr) => {
          const isActive = key === active;
          return (
            <li
              key={key}
              className={isActive && "active"}
              style={{ zIndex: isActive ? arr.length + 1 : arr.length - i }}
            >
              <button
                onClick={preventDefault(() => onChangeTab && onChangeTab(key))}
                aria-label={key}
              >
                {labels[key]}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
