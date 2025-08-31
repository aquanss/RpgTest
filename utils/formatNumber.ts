export const formatNumber = (num: number): string => {
    if (num < 1000) return num.toString();
    
    const si = [
        { v: 1E3, s: "k" },
        { v: 1E6, s: "M" },
        { v: 1E9, s: "B" },
        { v: 1E12, s: "T" },
    ];

    let i;
    // Iterate backwards to find the correct suffix
    for (i = si.length - 1; i > 0; i--) {
        if (num >= si[i].v) {
            break;
        }
    }

    // Format the number with one decimal place, then remove '.0' if it exists
    const numStr = (num / si[i].v).toFixed(1);
    if (numStr.endsWith('.0')) {
        return numStr.slice(0, -2) + si[i].s;
    }
    
    return numStr + si[i].s;
};
