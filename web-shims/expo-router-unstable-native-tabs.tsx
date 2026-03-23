import React from "react";

export function NativeTabs({ children, ..._props }: { children?: React.ReactNode } & Record<string, unknown>) {
  return <>{children}</>;
}

NativeTabs.Trigger = function NativeTabsTrigger({
  children,
  ..._props
}: { children?: React.ReactNode } & Record<string, unknown>) {
  return <>{children}</>;
};

export function Icon(_props: Record<string, unknown>) {
  return null;
}

export function Label({ children, ..._props }: { children?: React.ReactNode } & Record<string, unknown>) {
  return <>{children}</>;
}
