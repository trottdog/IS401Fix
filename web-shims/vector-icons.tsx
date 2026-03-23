import React from "react";
import type { IconBaseProps } from "react-icons";
import {
  IoAdd,
  IoAlertCircle,
  IoAlertCircleOutline,
  IoArrowBack,
  IoArrowForward,
  IoBookmark,
  IoBookmarkOutline,
  IoBriefcaseOutline,
  IoBusinessOutline,
  IoCalendarOutline,
  IoCameraOutline,
  IoCheckmark,
  IoCheckmarkCircle,
  IoChevronBack,
  IoChevronForward,
  IoCloseCircle,
  IoCompassOutline,
  IoCreateOutline,
  IoGlobeOutline,
  IoImageOutline,
  IoLocation,
  IoLocationOutline,
  IoLogOutOutline,
  IoMailOutline,
  IoMap,
  IoMapOutline,
  IoNotificationsOffOutline,
  IoNotificationsOutline,
  IoPencil,
  IoPeople,
  IoPeopleOutline,
  IoPersonCircle,
  IoPersonCircleOutline,
  IoSearch,
  IoSearchOutline,
  IoShareOutline,
  IoShieldCheckmark,
  IoShieldOutline,
  IoTimeOutline,
  IoLogoInstagram,
} from "react-icons/io5";
import {
  MdComputer,
  MdFitnessCenter,
  MdMusicNote,
  MdPalette,
  MdPeople,
  MdPublic,
  MdRestaurant,
  MdSchool,
  MdTerrain,
  MdVolunteerActivism,
  MdWork,
} from "react-icons/md";
import { FiAlertCircle, FiX } from "react-icons/fi";

type ExpoIconProps = {
  name: string;
  size?: number;
  color?: string;
};

const ionicons: Record<string, React.ComponentType<IconBaseProps>> = {
  add: IoAdd,
  "alert-circle": IoAlertCircle,
  "alert-circle-outline": IoAlertCircleOutline,
  "arrow-back": IoArrowBack,
  "arrow-forward": IoArrowForward,
  bookmark: IoBookmark,
  "bookmark-outline": IoBookmarkOutline,
  "business-outline": IoBusinessOutline,
  "calendar-outline": IoCalendarOutline,
  "camera-outline": IoCameraOutline,
  checkmark: IoCheckmark,
  "checkmark-circle": IoCheckmarkCircle,
  "chevron-back": IoChevronBack,
  "chevron-forward": IoChevronForward,
  "close-circle": IoCloseCircle,
  "create-outline": IoCreateOutline,
  "globe-outline": IoGlobeOutline,
  "image-outline": IoImageOutline,
  location: IoLocation,
  "location-outline": IoLocationOutline,
  "log-out-outline": IoLogOutOutline,
  "logo-instagram": IoLogoInstagram,
  "mail-outline": IoMailOutline,
  map: IoMap,
  "map-outline": IoMapOutline,
  "navigate-outline": IoCompassOutline,
  pencil: IoPencil,
  people: IoPeople,
  "people-outline": IoPeopleOutline,
  "person-circle": IoPersonCircle,
  "person-circle-outline": IoPersonCircleOutline,
  search: IoSearch,
  "search-outline": IoSearchOutline,
  "share-outline": IoShareOutline,
  "shield-checkmark": IoShieldCheckmark,
  "shield-outline": IoShieldOutline,
  "time-outline": IoTimeOutline,
  "notifications-outline": IoNotificationsOutline,
  "notifications-off-outline": IoNotificationsOffOutline,
};

const materialIcons: Record<string, React.ComponentType<IconBaseProps>> = {
  restaurant: MdRestaurant,
  school: MdSchool,
  people: MdPeople,
  "fitness-center": MdFitnessCenter,
  palette: MdPalette,
  "volunteer-activism": MdVolunteerActivism,
  work: MdWork,
  computer: MdComputer,
  "music-note": MdMusicNote,
  terrain: MdTerrain,
  public: MdPublic,
};

const featherIcons: Record<string, React.ComponentType<IconBaseProps>> = {
  "alert-circle": FiAlertCircle,
  x: FiX,
};

function renderIcon(
  registry: Record<string, React.ComponentType<IconBaseProps>>,
  { name, size = 16, color = "currentColor" }: ExpoIconProps,
) {
  const Icon = registry[name];
  if (!Icon) return null;
  return <Icon size={size} color={color} />;
}

export function Ionicons(props: ExpoIconProps) {
  return renderIcon(ionicons, props);
}

export function MaterialIcons(props: ExpoIconProps) {
  return renderIcon(materialIcons, props);
}

export function Feather(props: ExpoIconProps) {
  return renderIcon(featherIcons, props);
}
