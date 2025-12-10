export const LINK_REGEX = /\[\[(.*?)\]\]/g;

export const extractLinks = (text: string): string[] => {
    const matches = text.match(LINK_REGEX);
    if (!matches) return [];
    return matches.map((match) => match.slice(2, -2));
};

export const createLink = (title: string): string => {
    return `[[${title}]]`;
};
