export interface Notification {
  id: string;
  type: 'synergy' | 'wave' | 'levelup' | 'achievement' | 'milestone';
  title: string;
  message?: string;
  color?: string;
  icon?: string;
  duration: number;
  timestamp: number;
}

let notifications: Notification[] = [];
let notificationId = 0;

export function createNotification(type: Notification['type'], title: string, message?: string, options: { color?: string; icon?: string; duration?: number } = {}): Notification {
  const notification: Notification = {
    id: `notif-${notificationId++}`,
    type,
    title,
    message,
    color: options.color || getDefaultColor(type),
    icon: options.icon || getDefaultIcon(type),
    duration: options.duration || 3000,
    timestamp: Date.now()
  };
  notifications.push(notification);
  return notification;
}

export function removeNotification(id: string) {
  notifications = notifications.filter(n => n.id !== id);
}

export function getNotifications(): Notification[] {
  return notifications;
}

export function clearNotifications() {
  notifications = [];
}

function getDefaultColor(type: Notification['type']): string {
  switch (type) {
    case 'synergy': return 'rgba(255, 215, 0, 0.8)';
    case 'wave': return 'rgba(0, 255, 100, 0.8)';
    case 'levelup': return 'rgba(80, 140, 255, 0.8)';
    case 'achievement': return 'rgba(255, 100, 100, 0.8)';
    case 'milestone': return 'rgba(255, 170, 30, 0.8)';
    default: return 'rgba(255, 255, 255, 0.8)';
  }
}

function getDefaultIcon(type: Notification['type']): string {
  switch (type) {
    case 'synergy': return '⚡';
    case 'wave': return '🌊';
    case 'levelup': return '📈';
    case 'achievement': return '🏆';
    case 'milestone': return '⭐';
    default: return '✦';
  }
}
