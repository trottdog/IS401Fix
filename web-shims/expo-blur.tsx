import React from "react";
import { View } from "react-native";

export function BlurView({
  style,
  children,
}: {
  style?: any;
  children?: React.ReactNode;
  intensity?: number;
  tint?: string;
}) {
  return (
    <View
      style={[
        style,
        {
          backdropFilter: "blur(18px)",
          WebkitBackdropFilter: "blur(18px)",
          backgroundColor: "rgba(255,255,255,0.78)",
        } as any,
      ]}
    >
      {children}
    </View>
  );
}
