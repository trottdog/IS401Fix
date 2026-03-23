import React from "react";

const zeroInsets = { top: 0, right: 0, bottom: 0, left: 0 };

export function SafeAreaProvider({ children }: { children?: React.ReactNode }) {
  return <>{children}</>;
}

export function useSafeAreaInsets() {
  return zeroInsets;
}
