import React from 'react';
import type { Notification } from '../../types';
import { timeAgo } from '../../utils/timeAgo';
import { useTranslation } from '../../App';

interface NotificationPanelProps {
    isOpen: boolean;
    notifications: Notification[];
    onClose: () => void;
    onClearAll: () => void;
}

const NotificationPanel: React.FC<NotificationPanelProps> = ({ isOpen, notifications, onClose, onClearAll }) => {
    const { t } = useTranslation();

    if (!isOpen) {
        return null;
    }

    const formatTime = (timestamp: number): string => {
        const timeData = timeAgo(timestamp);
        switch (timeData.unit) {
            case 'now': return t('justNow');
            case 'seconds': return t('secondsAgo', { count: timeData.value });
            case 'minutes': return t('minutesAgo', { count: timeData.value });
            case 'hours': return t('hoursAgo', { count: timeData.value });
            case 'days': return t('daysAgo', { count: timeData.value });
            case 'months': return t('monthsAgo', { count: timeData.value });
            case 'years': return t('yearsAgo', { count: timeData.value });
            default: return '';
        }
    };

    return (
        <div 
            className="absolute top-full right-0 mt-2 w-80 bg-[var(--background-medium)] rounded-lg shadow-2xl border-2 border-[var(--accent-gold)]/50 z-20 text-left flex flex-col"
            onClick={(e) => e.stopPropagation()}
        >
            <div className="p-3 border-b border-[var(--border-color)]">
                <h3 className="font-bold text-lg text-[var(--text-primary)]">{t('notificationsTitle')}</h3>
            </div>
            <div className="flex-1 max-h-96 overflow-y-auto">
                {notifications.length > 0 ? (
                    <ul>
                        {notifications.map(notification => (
                            <li key={notification.id} className="p-3 border-b border-[var(--background-dark)]/50 hover:bg-[var(--border-color)]/50 transition-colors">
                                <div className="flex items-start gap-3">
                                    {notification.icon && (
                                        <div className="w-8 h-8 bg-[var(--background-dark)] text-[var(--text-primary)] rounded-md flex items-center justify-center flex-shrink-0">
                                            {notification.icon.startsWith('fa-') ? (
                                                <i className={`${notification.icon} text-lg w-6 text-center`}></i>
                                            ) : (
                                                <img src={notification.icon} alt="" className="w-6 h-6 object-contain" loading="lazy" decoding="async" />
                                            )}
                                        </div>
                                    )}
                                    <div className="flex-1">
                                        <p className="text-sm text-[var(--text-primary)] leading-tight">{notification.message}</p>
                                        <p className="text-xs text-[var(--text-secondary)] mt-1">{formatTime(notification.timestamp)}</p>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="p-6 text-center text-sm text-[var(--text-secondary)]">{t('noNewNotifications')}</p>
                )}
            </div>
             {notifications.length > 0 && (
                <div className="p-2 border-t border-[var(--border-color)]">
                    <button
                        onClick={onClearAll}
                        className="w-full text-center text-sm font-semibold text-[var(--text-secondary)] hover:text-white py-1 rounded-md hover:bg-[var(--border-color)] transition-colors"
                    >
                        {t('clearAll')}
                    </button>
                </div>
            )}
        </div>
    );
};

export default NotificationPanel;