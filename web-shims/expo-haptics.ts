export enum ImpactFeedbackStyle {
  Light = "light",
  Medium = "medium",
  Heavy = "heavy",
}

export enum NotificationFeedbackType {
  Success = "success",
  Warning = "warning",
  Error = "error",
}

export async function impactAsync(_style?: ImpactFeedbackStyle) {
  return;
}

export async function notificationAsync(_type?: NotificationFeedbackType) {
  return;
}

export async function selectionAsync() {
  return;
}
