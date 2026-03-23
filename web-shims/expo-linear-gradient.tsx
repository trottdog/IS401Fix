import React from "react";
import { View } from "react-native";

type Props = {
  colors: string[];
  start?: { x: number; y: number };
  end?: { x: number; y: number };
  style?: any;
  children?: React.ReactNode;
};

export function LinearGradient({ colors, style, children }: Props) {
  const gradient = `linear-gradient(135deg, ${colors.join(", ")})`;
  return <View style={[style, { backgroundImage: gradient } as any]}>{children}</View>;
}
