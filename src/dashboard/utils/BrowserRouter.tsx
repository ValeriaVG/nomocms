import * as Preact from "preact";
import {
  useState,
  useMemo,
  useRef,
  useContext,
  useEffect,
  useLayoutEffect,
} from "preact/hooks";
import { createNestedRoutes, createRoutes } from "utils/router";
import preventDefault from "./preventDefault";

export type RouterState = {
  path: string;
  basename: string;
  params: Record<string, string>;
};

export interface BrowserRoute {
  path: string;
  component: () => Preact.JSX.Element;
  exact?: boolean;
}

export interface HistoryActions {
  push: (path: string) => void;
  goBack: () => void;
}

export const BrowserRouterContext = Preact.createContext<
  RouterState &
    HistoryActions & { setParams: (params: Record<string, string>) => void }
>({
  path: "/",
  basename: "",
  push: () => {},
  goBack: () => {},
  params: {},
  setParams: () => {},
});

export const trimBasename = (path: string, basename: string) => {
  if (path.startsWith(basename)) return path.slice(basename.length);
  return path;
};

export const BrowserRouter = ({
  basename,
  children,
}: {
  basename: string;
  children: Preact.ComponentChildren;
}) => {
  const [path, setPath] = useState<string>(document.location.pathname);
  const [params, setParams] = useState<Record<string, string>>({});
  const history = useRef<string[]>([]);

  const actions: HistoryActions = {
    push: (path) => {
      history.current.push(path);
      window.history.pushState({}, "", path);
      setPath(path);
    },
    goBack: () => {
      const prev = history.current.pop();
      if (prev) setPath(prev);
    },
  };

  return (
    <BrowserRouterContext.Provider
      value={{
        path,
        basename,
        params,
        setParams,
        ...actions,
      }}
      children={children}
    />
  );
};

export const Switch = ({
  children,
}: {
  children: Preact.ComponentChildren;
}) => {
  const childrenArray: Preact.ComponentChild[] = Array.isArray(children)
    ? children
    : [children];

  const routes = childrenArray.reduce((a, c) => {
    // FIXME: filter out everything but Route
    if (typeof c === "object" && "props" in c) {
      const { path, component, exact } = c.props;
      a[path] = { exact, route: component };
    }
    return a;
  }, {}) as Record<
    string,
    { exact?: boolean; route: () => Preact.JSX.Element }
  >;

  const matchRoute = useMemo(() => createNestedRoutes(routes), [children]);
  const { path, setParams } = useContext(BrowserRouterContext);
  const [CurrentRoute, params] = matchRoute(path);
  useLayoutEffect(() => {
    // TODO: this is not perfect
    params && setParams(params);
  }, [path]);

  if (!CurrentRoute) return null;
  return <CurrentRoute {...params} />;
};

export class Route extends Preact.Component<BrowserRoute> {
  render() {
    return null;
  }
}

export const useHistory = () => {
  const { push, goBack } = useContext(BrowserRouterContext);
  return { push, goBack };
};

export const useRouteMatch = <T extends Record<string, string>>(): {
  path: string;
  params: T;
} => {
  const { params, path } = useContext(BrowserRouterContext);
  return { params, path } as any;
};

export const Link = ({
  to,
  ...props
}: { to: string } & Omit<
  Preact.JSX.HTMLAttributes<HTMLAnchorElement>,
  "href"
>) => {
  const { basename, push } = useContext(BrowserRouterContext);
  const href = to.startsWith(basename) ? to : basename + to;
  const onClick = preventDefault(() => {
    push(to);
  });
  return <a onClick={onClick} {...props} href={href} />;
};

export const NavLink = ({
  to,
  exact,
  ...props
}: { to: string; exact?: boolean } & Omit<
  Preact.JSX.HTMLAttributes<HTMLAnchorElement>,
  "href"
>) => {
  const { path } = useContext(BrowserRouterContext);
  const isActive = exact ? to === path : to.startsWith(path);
  const classes = [props.class, props.className, isActive && "active"].filter(
    Boolean
  );
  return <Link to={to} {...props} className={classes.join(" ")} />;
};
