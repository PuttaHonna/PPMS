import * as chrono from 'chrono-node';

export interface ParsedTask {
    title: string;
    dueDate: Date | null;
    isRecurring: boolean;
}

export const parseTaskInput = (text: string): ParsedTask => {
    const results = chrono.parse(text);

    if (results.length === 0) {
        return {
            title: text,
            dueDate: null,
            isRecurring: false,
        };
    }

    // Get the first date found
    const result = results[0];
    const date = result.start.date();

    // Remove the date text from the title
    const title = text.replace(result.text, '').trim();

    // Simple heuristic for recurrence (can be expanded)
    const isRecurring = text.toLowerCase().includes('every') || text.toLowerCase().includes('daily') || text.toLowerCase().includes('weekly');

    return {
        title: title || text, // Fallback to original text if replacement leaves empty
        dueDate: date,
        isRecurring,
    };
};

export const estimateTime = (text: string): number => {
    const lowerText = text.toLowerCase();
    if (lowerText.includes('report') || lowerText.includes('essay') || lowerText.includes('blog')) return 60;
    if (lowerText.includes('email') || lowerText.includes('call') || lowerText.includes('message')) return 15;
    if (lowerText.includes('meeting') || lowerText.includes('sync')) return 30;
    if (lowerText.includes('fix') || lowerText.includes('debug')) return 45;
    if (lowerText.includes('project') || lowerText.includes('app')) return 120;
    return 30; // Default
};

export const generateSubTasks = (text: string): string[] => {
    const lowerText = text.toLowerCase();
    if (lowerText.includes('report') || lowerText.includes('essay')) {
        return ["Research topic", "Outline structure", "Draft content", "Review and edit"];
    }
    if (lowerText.includes('project') || lowerText.includes('app')) {
        return ["Plan scope", "Set up environment", "Implement core features", "Test and verify"];
    }
    if (lowerText.includes('meeting')) {
        return ["Prepare agenda", "Send invites", "Prepare slides"];
    }
    return [];
};
