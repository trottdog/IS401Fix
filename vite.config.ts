import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

const root = path.resolve(__dirname);

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [
      { find: "@", replacement: root },
      { find: "@shared", replacement: path.resolve(root, "shared") },
      { find: /^react-native$/, replacement: "react-native-web" },
      { find: "expo-router", replacement: path.resolve(root, "web-shims/expo-router.tsx") },
      { find: "expo-router/unstable-native-tabs", replacement: path.resolve(root, "web-shims/expo-router-unstable-native-tabs.tsx") },
      { find: "expo-haptics", replacement: path.resolve(root, "web-shims/expo-haptics.ts") },
      { find: "expo-linear-gradient", replacement: path.resolve(root, "web-shims/expo-linear-gradient.tsx") },
      { find: "expo-blur", replacement: path.resolve(root, "web-shims/expo-blur.tsx") },
      { find: "expo-glass-effect", replacement: path.resolve(root, "web-shims/expo-glass-effect.ts") },
      { find: "expo-splash-screen", replacement: path.resolve(root, "web-shims/expo-splash-screen.ts") },
      { find: "expo-status-bar", replacement: path.resolve(root, "web-shims/expo-status-bar.tsx") },
      { find: "expo-image-picker", replacement: path.resolve(root, "web-shims/expo-image-picker.ts") },
      { find: "react-native-safe-area-context", replacement: path.resolve(root, "web-shims/react-native-safe-area-context.tsx") },
      { find: "react-native-keyboard-controller", replacement: path.resolve(root, "web-shims/react-native-keyboard-controller.tsx") },
      { find: "react-native-gesture-handler", replacement: path.resolve(root, "web-shims/react-native-gesture-handler.tsx") },
      { find: "@expo-google-fonts/inter", replacement: path.resolve(root, "web-shims/inter-fonts.ts") },
      { find: "@expo/vector-icons", replacement: path.resolve(root, "web-shims/vector-icons.tsx") },
    ],
    extensions: [".web.tsx", ".web.ts", ".tsx", ".ts", ".jsx", ".js", ".json"],
  },
  define: {
    "process.env": {},
  },
  build: {
    outDir: "static-build",
    emptyOutDir: true,
  },
});
