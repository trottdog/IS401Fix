import React, { useEffect } from "react";
import {
  Link as ReactRouterLink,
  type NavigateFunction,
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";

type HrefObject = {
  pathname: string;
  params?: Record<string, string | number | undefined>;
};

type Href = string | HrefObject;

let navigateRef: NavigateFunction | null = null;

const PATH_REWRITES: Array<[RegExp, string]> = [
  [/^\(auth\)\/login$/, "/login"],
  [/^\(auth\)\/register$/, "/register"],
  [/^\(tabs\)\/\(home\)$/, "/discover"],
  [/^\(tabs\)\/\(clubs\)$/, "/clubs"],
  [/^\(tabs\)\/\(profile\)$/, "/profile"],
  [/^\(tabs\)\/\(profile\)\/notifications$/, "/profile/notifications"],
  [/^\(tabs\)\/\(home\)\/search$/, "/search"],
  [/^\(tabs\)\/\(home\)\/create-event$/, "/create-event"],
  [/^\(tabs\)\/\(home\)\/event\/\[id\]$/, "/event/:id"],
  [/^\(tabs\)\/\(home\)\/club\/\[id\]$/, "/club/:id"],
];

function normalizePath(href: Href): string {
  if (typeof href !== "string") {
    let pathname = normalizePath(href.pathname);
    for (const [key, value] of Object.entries(href.params || {})) {
      pathname = pathname.replace(`:${key}`, encodeURIComponent(String(value ?? "")));
      pathname = pathname.replace(`[${key}]`, encodeURIComponent(String(value ?? "")));
    }
    return pathname;
  }

  let path = href.trim();
  if (!path) return "/";
  path = path.replace(/^\//, "");

  for (const [pattern, replacement] of PATH_REWRITES) {
    if (pattern.test(path)) {
      return replacement;
    }
  }

  if (!path.startsWith("/")) {
    path = `/${path}`;
  }

  return path;
}

export function setRouterNavigate(navigate?: NavigateFunction | null) {
  if (navigate) {
    navigateRef = navigate;
  }

  return (to: Href, options?: { replace?: boolean }) => {
    const nextPath = normalizePath(to);
    if (navigateRef) {
      navigateRef(nextPath, { replace: options?.replace });
      return;
    }

    if (options?.replace) {
      window.history.replaceState({}, "", nextPath);
      window.dispatchEvent(new PopStateEvent("popstate"));
      return;
    }

    window.history.pushState({}, "", nextPath);
    window.dispatchEvent(new PopStateEvent("popstate"));
  };
}

export const router = {
  push(href: Href) {
    setRouterNavigate()(href);
  },
  replace(href: Href) {
    setRouterNavigate()(href, { replace: true });
  },
  back() {
    window.history.back();
  },
  canGoBack() {
    return window.history.length > 1;
  },
  dismissAll() {
    setRouterNavigate()("/discover", { replace: true });
  },
};

export function useLocalSearchParams<T extends Record<string, string | string[] | undefined>>() {
  const params = useParams();
  const [searchParams] = useSearchParams();
  const query = Object.fromEntries(searchParams.entries());
  return { ...query, ...params } as T;
}

export function useFocusEffect(effect: () => void | (() => void)) {
  const location = useLocation();

  useEffect(() => {
    return effect();
  }, [effect, location.key, location.pathname]);
}

export function Link({
  href,
  children,
  ...props
}: {
  href: Href;
  children?: React.ReactNode;
  asChild?: boolean;
  [key: string]: unknown;
}) {
  const { asChild: _asChild, to: _to, ...rest } = props as Record<string, unknown>;
  return (
    <ReactRouterLink to={normalizePath(href)} {...(rest as Record<string, unknown>)}>
      {children}
    </ReactRouterLink>
  );
}

type LayoutProps = { children?: React.ReactNode };
type ScreenProps = Record<string, unknown>;

function createLayoutComponent() {
  const Component = ({ children, ..._props }: LayoutProps & Record<string, unknown>) => <>{children}</>;
  (Component as any).Screen = (_props: ScreenProps) => null;
  return Component as any;
}

export const Stack: any = createLayoutComponent();
export const Tabs: any = createLayoutComponent();
