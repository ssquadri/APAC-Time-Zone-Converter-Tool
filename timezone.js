function formatTime(hour24) {
    const hour = Math.floor(hour24);
    const minute = Math.round((hour24 - hour) * 60);
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    const displayMinute = minute.toString().padStart(2, '0');

    return `${displayHour}:${displayMinute} ${period}`;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { formatTime };
}