import { AppNotification } from '../models/communication.model';
import { ApiNotification } from '../api/api-notifications.service';
export function notificationItem(n: ApiNotification): AppNotification {
  const allowed: AppNotification['category'][] = ['Booking','Payment','Trip','Document','System'];
  return { id: n.id, category: allowed.includes(n.category as AppNotification['category']) ? n.category as AppNotification['category'] : 'System',
    title: n.title, message: n.message, timestamp: n.created_at || '', read: !!n.read_at, data: n.data, actionUrl: n.action_url };
}
