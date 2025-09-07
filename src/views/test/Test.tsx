import { Input } from 'antd';
import React, { useState, useRef, useEffect } from 'react';

import './Test.less';
import TwoLineClamp from '@/components/TwoLineClamp/TwoLineClamp';
import beepMp3 from './beep.mp3';

const Test: React.FC = () => {
    const [key, setKey] = useState('');
    const [keyDesc, setKeyDesc] = useState('');
    const audioRef = useRef(null);

    const mainInputKeyDown = (evt: React.KeyboardEvent) => {
        setKey(evt.key);
        if (audioRef.current) {
            (audioRef.current as any).currentTime = 0;
            (audioRef.current as any).pause();
            setTimeout(() => {
                (audioRef.current as any).play();
            }, 50);
        }
        evt.preventDefault();
        evt.stopPropagation();
    };

    useEffect(() => {
        if (key === '') {
            setKeyDesc('点击后输入');
        } else if (key === ' ') {
            setKeyDesc('Space');
        } else if (key.length === 1) {
            setKeyDesc(key.toLocaleUpperCase());
        } else {
            setKeyDesc(key);
        }
    }, [key]);

    return (
        <div className="Test">
            <Input className="home-input Test__input" onKeyDown={mainInputKeyDown}></Input>
            <div className="Test__desc">
                <TwoLineClamp text={keyDesc} />
            </div>
            <audio src={beepMp3} ref={audioRef} preload="auto"></audio>
        </div>
    );
};

export default Test;
