
export const timeAgo = (timestamp: number): { value: number, unit: 'years' | 'months' | 'days' | 'hours' | 'minutes' | 'seconds' | 'now' } => {
    const now = Date.now();
    const seconds = Math.floor((now - timestamp) / 1000);

    if (seconds < 10) return { value: 0, unit: "now" };

    let interval = seconds / 31536000;
    if (interval > 1) return { value: Math.floor(interval), unit: "years" };
    
    interval = seconds / 2592000;
    if (interval > 1) return { value: Math.floor(interval), unit: "months" };
    
    interval = seconds / 86400;
    if (interval > 1) return { value: Math.floor(interval), unit: "days" };
    
    interval = seconds / 3600;
    if (interval > 1) return { value: Math.floor(interval), unit: "hours" };
    
    interval = seconds / 60;
    if (interval > 1) return { value: Math.floor(interval), unit: "minutes" };
    
    return { value: Math.floor(seconds), unit: "seconds" };
};
