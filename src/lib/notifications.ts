import { db } from '@/db';
import { notifications } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';

export type NotificationType = 'info' | 'success' | 'warning' | 'error';

export async function createNotification(
    userId: number,
    title: string,
    message: string,
    type: NotificationType = 'info',
    link?: string
) {
    try {
        await db.insert(notifications).values({
            userId,
            title,
            message,
            type,
            link,
            isRead: false,
            createdAt: new Date().toISOString(),
        });
        return true;
    } catch (error) {
        console.error('Error creating notification:', error);
        return false;
    }
}

export async function getUserNotifications(userId: number, limit = 10) {
    try {
        return await db.select()
            .from(notifications)
            .where(eq(notifications.userId, userId))
            .orderBy(desc(notifications.createdAt))
            .limit(limit);
    } catch (error) {
        console.error('Error fetching notifications:', error);
        return [];
    }
}

export async function markNotificationAsRead(notificationId: number) {
    try {
        await db.update(notifications)
            .set({ isRead: true })
            .where(eq(notifications.id, notificationId));
        return true;
    } catch (error) {
        console.error('Error marking notification as read:', error);
        return false;
    }
}

export async function markAllNotificationsAsRead(userId: number) {
    try {
        await db.update(notifications)
            .set({ isRead: true })
            .where(eq(notifications.userId, userId));
        return true;
    } catch (error) {
        console.error('Error marking all notifications as read:', error);
        return false;
    }
}
