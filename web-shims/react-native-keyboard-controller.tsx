import React from "react";
import { ScrollView } from "react-native";

export function KeyboardProvider({ children }: { children?: React.ReactNode }) {
  return <>{children}</>;
}

export function KeyboardAwareScrollView({
  children,
  ...props
}: React.ComponentProps<typeof ScrollView>) {
  return <ScrollView {...props}>{children}</ScrollView>;
}

export type KeyboardAwareScrollViewProps = React.ComponentProps<typeof ScrollView>;
