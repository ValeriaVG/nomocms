import preventDefault from "dashboard/utils/preventDefault";
import * as Preact from "preact";
import "./tabs.scss";
export default function Tabs<
  T extends Record<string, string | Preact.JSX.Element>
>({
  active,
  labels,
  onChangeTab,
  ...props
}: {
  active?: keyof T;
  labels: T;
  onChangeTab?: (item: keyof T) => any;
} & Preact.JSX.HTMLAttributes<HTMLDivElement>) {
  return (
    <nav {...props}>
      <ul class="tabs">
        {Object.keys(labels).map((key, i, arr) => {
          const isActive = key === active;
          return (
            <li
              key={key}
              class={isActive && "active"}
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
