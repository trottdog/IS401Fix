import React, { useEffect } from "react";
import { Navigate, Outlet, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { Pressable, StyleSheet, Text, View, type ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/lib/theme/colors";
import { setRouterNavigate } from "@/web-shims/expo-router";
import { useResponsiveLayout } from "@/lib/ui/responsive";
import DiscoverScreen from "@/app/(tabs)/(home)/index";
import ClubsScreen from "@/app/(tabs)/(clubs)/index";
import ProfileScreen from "@/app/(tabs)/(profile)/index";
import NotificationsScreen from "@/app/(tabs)/(profile)/notifications";
import SearchScreen from "@/app/(tabs)/(home)/search";
import CreateEventScreen from "@/app/(tabs)/(home)/create-event";
import EventDetailScreen from "@/app/(tabs)/(home)/event/[id]";
import ClubProfileScreen from "@/app/(tabs)/(home)/club/[id]";
import LoginScreen from "@/app/(auth)/login";
import RegisterScreen from "@/app/(auth)/register";

function NavigationBridge() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    setRouterNavigate(navigate);
  }, [navigate]);

  useEffect(() => {
    window.dispatchEvent(new Event("codex-route-change"));
  }, [location]);

  return null;
}

function TabBar() {
  const location = useLocation();
  const layout = useResponsiveLayout();
  const tabBarWidth = layout.isPhoneWeb ? layout.width : layout.isWeb ? Math.min(layout.width - 24, 540) : layout.width;
  const isFloating = layout.isWeb && layout.width >= 768;
  const isPinnedPhoneBar = layout.isPhoneWeb;
  const phoneWrapStyle: ViewStyle | undefined = isPinnedPhoneBar
    ? ({ position: "fixed", zIndex: 1000 } as unknown as ViewStyle)
    : undefined;
  const tabs = [
    { label: "Discover", path: "/discover", active: location.pathname.startsWith("/discover") || location.pathname.startsWith("/event/") || location.pathname.startsWith("/club/") || location.pathname.startsWith("/search") || location.pathname.startsWith("/create-event"), icon: location.pathname.startsWith("/discover") ? "map" : "map-outline" },
    { label: "My Clubs", path: "/clubs", active: location.pathname.startsWith("/clubs"), icon: location.pathname.startsWith("/clubs") ? "people" : "people-outline" },
    { label: "Profile", path: "/profile", active: location.pathname.startsWith("/profile"), icon: location.pathname.startsWith("/profile") ? "person-circle" : "person-circle-outline" },
  ] as const;

  return (
    <View pointerEvents="box-none" style={StyleSheet.absoluteFill}>
      <View
        style={[
          styles.tabBarWrap,
          phoneWrapStyle,
          {
            height: layout.tabBarHeight + (isFloating ? 20 : 0),
            paddingBottom: isFloating ? 0 : 0,
          },
        ]}
      >
        <View
          style={[
            styles.tabBar,
            isPinnedPhoneBar && styles.tabBarPhone,
            {
              width: tabBarWidth,
              maxWidth: isFloating ? 540 : undefined,
              marginBottom: isFloating ? 18 : 0,
              borderRadius: isFloating ? 26 : 0,
            },
          ]}
        >
          {tabs.map((tab) => (
            <Pressable
              key={tab.path}
              onPress={() => setRouterNavigate()(tab.path)}
              style={styles.tabItem}
            >
              <Ionicons
                name={tab.icon}
                size={24}
                color={tab.active ? Colors.light.tint : Colors.light.tabIconDefault}
              />
              <Text style={[styles.tabLabel, tab.active && styles.tabLabelActive]}>{tab.label}</Text>
            </Pressable>
          ))}
        </View>
      </View>
    </View>
  );
}

function TabLayout() {
  return (
    <>
      <Outlet />
      <TabBar />
    </>
  );
}

export function App() {
  return (
    <>
      <NavigationBridge />
      <Routes>
        <Route path="/" element={<Navigate to="/discover" replace />} />
        <Route path="/login" element={<LoginScreen />} />
        <Route path="/register" element={<RegisterScreen />} />
        <Route element={<TabLayout />}>
          <Route path="/discover" element={<DiscoverScreen />} />
          <Route path="/clubs" element={<ClubsScreen />} />
          <Route path="/profile" element={<ProfileScreen />} />
          <Route path="/profile/notifications" element={<NotificationsScreen />} />
          <Route path="/search" element={<SearchScreen />} />
          <Route path="/create-event" element={<CreateEventScreen />} />
          <Route path="/event/:id" element={<EventDetailScreen />} />
          <Route path="/club/:id" element={<ClubProfileScreen />} />
        </Route>
        <Route path="*" element={<Navigate to="/discover" replace />} />
      </Routes>
    </>
  );
}

const styles = StyleSheet.create({
  tabBarWrap: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "flex-end",
    pointerEvents: "box-none" as const,
  },
  tabBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    width: "100%",
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 10,
    backgroundColor: "rgba(255,255,255,0.94)",
    borderWidth: 1,
    borderColor: Colors.light.border,
    shadowColor: "#0B1F33",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.12,
    shadowRadius: 28,
  },
  tabBarPhone: {
    width: "100%",
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
    borderLeftWidth: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    minWidth: 0,
  },
  tabLabel: {
    fontSize: 11,
    color: Colors.light.tabIconDefault,
    fontFamily: "Inter_500Medium",
  },
  tabLabelActive: {
    color: Colors.light.tint,
  },
});
