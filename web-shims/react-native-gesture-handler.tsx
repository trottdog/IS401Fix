import React from "react";
import { View, Pressable, ScrollView } from "react-native";

export function GestureHandlerRootView({
  children,
  style,
}: {
  children?: React.ReactNode;
  style?: any;
}) {
  return <View style={style}>{children}</View>;
}

export { Pressable, ScrollView };
