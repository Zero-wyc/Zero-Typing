/*
 * @Author: zhaoxuanzi
 * @Date: 2020-12-07 20:12:31
 * @LastEditors: zhaoxuanzi
 * @LastEditTime: 2021-01-28 19:30:16
 */
import React, { useEffect } from 'react';

import './Footer.less';

import { storeConnect, MapState as S, MapDispatch as D } from '@/store';
import { getThemeByName } from '@/themes';
import storage from '@/utils/storage';

const Footer: React.FC<S & D> = (props) => {
    // 处理背景图片URL
    const getImageUrl = (url: string) => {
        if (!url) return '';
        // 如果是完整的URL（以http或https开头），则直接使用
        if (url.startsWith('http://') || url.startsWith('https://')) {
            return url;
        }
        // 否则，添加基础路径
        const base = import.meta.env.BASE_URL || '/';
        return `${base}${url.startsWith('/') ? url.substring(1) : url}`;
    };

    // 添加一个useEffect来处理背景
    useEffect(() => {
        // 处理自定义背景图片
        if (props.$state.root.backImgUrl) {
            // 当有自定义背景时，移除默认背景图片，使用自定义背景
            document.body.style.backgroundImage = 'none';
            document.body.style.backgroundColor = ''; // 重置背景颜色
        } 
        // 只在主题被点击后(THEME_CLICKED为true)应用主题背景
        else if (storage.local.get('THEME_CLICKED') === true) {
            // 已点击过主题，使用对应的纯色背景
            const currentTheme = getThemeByName(props.$state.root.uiTheme || 'default');
            if (currentTheme) {
                document.body.style.backgroundImage = 'none';
                document.body.style.backgroundColor = currentTheme.bgColor;
            }
        }
        // 否则保持甘城2_1背景图，由main.tsx中的ensureDefaultBackground函数处理
        
        return () => {
            // 组件卸载逻辑保持不变
            if (!storage.local.get('THEME_CLICKED') && !props.$state.root.backImgUrl) {
                const style = getComputedStyle(document.documentElement);
                const defaultBgImage = style.getPropertyValue('--body-back-image');
                document.body.style.backgroundImage = defaultBgImage || 'var(--body-back-image)';
                document.body.style.backgroundColor = '';
            }
        };
    }, [props.$state.root.backImgUrl, props.$state.root.uiTheme]);

    return (
        <div className="app-footer">
            {props.$state.root.backImgUrl && (
                <img
                    className="back__img"
                    src={getImageUrl(props.$state.root.backImgUrl)}
                    alt=""
                    style={{
                        filter: `blur(${props.$state.root.backImgBlur}px)`,
                        opacity: props.$state.root.backImgOpacity,
                    }}
                />
            )}
        </div>
    );
};

export default storeConnect(Footer);
