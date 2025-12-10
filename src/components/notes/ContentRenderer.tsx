import React from 'react';
import { LINK_REGEX } from '../../utils/links';

interface ContentRendererProps {
    content: string;
    onLinkClick?: (title: string) => void;
}

const ContentRenderer: React.FC<ContentRendererProps> = ({ content, onLinkClick }) => {
    const parts = content.split(LINK_REGEX);

    // If no links, return content as is
    if (parts.length === 1) return <p className="text-gray-600 text-sm line-clamp-3 mb-4 h-[60px] whitespace-pre-wrap">{content}</p>;

    return (
        <p className="text-gray-600 text-sm line-clamp-3 mb-4 h-[60px] whitespace-pre-wrap">
            {parts.map((part, index) => {
                // Every odd index was a match in the split regex (captured group)
                if (index % 2 === 1) {
                    return (
                        <span
                            key={index}
                            onClick={(e) => {
                                e.stopPropagation();
                                onLinkClick?.(part);
                            }}
                            className="text-cyan-600 font-medium hover:underline cursor-pointer hover:text-cyan-500 transition-colors"
                        >
                            {part}
                        </span>
                    );
                }
                return part;
            })}
        </p>
    );
};

export default ContentRenderer;
