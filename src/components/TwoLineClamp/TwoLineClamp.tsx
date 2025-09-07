import React, { useEffect, useRef, useState } from 'react';
import './TwoLineClamp.less';

interface Props {
    text: string;
    lines?: number;
    className?: string;
}

const TwoLineClamp: React.FC<Props> = ({ text, lines = 2, className = '' }) => {
    const ref = useRef<HTMLDivElement | null>(null);
    const [displayText, setDisplayText] = useState(text);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        // reset and set full text to measure
        el.textContent = text;
        el.style.whiteSpace = 'normal';
        el.style.overflow = 'hidden';

        const style = window.getComputedStyle(el);
        const lineHeightStr = style.lineHeight;
        // parse line-height (fallback to font-size * 1.2)
        let lineHeight = parseFloat(lineHeightStr);
        if (isNaN(lineHeight)) {
            const fontSize = parseFloat(style.fontSize || '16');
            lineHeight = fontSize * 1.2;
        }
        const maxHeight = lineHeight * lines;

        // if it fits, show full text
        if (el.scrollHeight <= maxHeight) {
            setDisplayText(text);
            return;
        }

        // binary search for maximal substring that fits
        let low = 0;
        let high = text.length;
        let best = 0;

        while (low <= high) {
            const mid = Math.floor((low + high) / 2);
            el.textContent = text.slice(0, mid) + '…';
            if (el.scrollHeight <= maxHeight) {
                best = mid;
                low = mid + 1;
            } else {
                high = mid - 1;
            }
        }

        const finalText = text.slice(0, best) + (best < text.length ? '…' : '');
        setDisplayText(finalText);
    }, [text, lines]);

    return (
        <div ref={ref} className={`TwoLineClamp ${className}`} title={text} aria-label={text}>
            {displayText}
        </div>
    );
};

export default TwoLineClamp;
