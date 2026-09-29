// How many days a complaint can sit in 'pending' before it's flagged as
// escalated. Adjust this single constant to change the threshold app-wide.
export const ESCALATION_DAYS = 3;

/**
 * Returns the timestamp a complaint most recently entered its CURRENT
 * status — i.e. the date of the latest 'status_change' audit entry whose
 * toStatus matches the complaint's current status, falling back to the
 * complaint's creation date if it's never had a status change logged.
 */
export const getStatusSince = (complaint) => {
    const changeNotes = (complaint.notes || [])
        .filter((n) => n.type === 'status_change' && n.toStatus === complaint.status)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return changeNotes.length > 0 ? new Date(changeNotes[0].createdAt) : new Date(complaint.createdAt);
};

export const getDaysSince = (date) => {
    const diffMs = Date.now() - new Date(date).getTime();
    return Math.floor(diffMs / (1000 * 60 * 60 * 24));
};

/**
 * A complaint is "escalated" if it's been sitting in `pending` for more
 * than ESCALATION_DAYS days without being closed.
 */
export const isEscalated = (complaint) => {
    if (complaint.status !== 'pending') return false;
    return getDaysSince(getStatusSince(complaint)) >= ESCALATION_DAYS;
};
