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

const Footer: React.FC<S & D> = (props) => {
    // 处理背景图片URL
    const getImageUrl = (url: string) => {
        if (!url) return '';
        // 如果是 base64 数据 URL（以 data: 开头），则直接使用
        if (url.startsWith('data:')) {
            return url;
        }
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
        if (props.$state.root.backImgUrl) {
            // 当使用自定义背景时，我们不再直接设置 body 的背景图片
            // 而是在 Footer 组件的 img 标签中显示背景
            // 清除 body 上可能存在的背景图片
            document.body.style.backgroundImage = 'none';
            document.body.style.backgroundColor = ''; // 重置背景颜色
        } else if (props.$state.root.uiTheme && props.$state.root.uiTheme !== 'default') {
            // 非默认主题且没有自定义背景图片时，使用主题的纯色背景
            const currentTheme = getThemeByName(props.$state.root.uiTheme);
            if (currentTheme) {
                document.body.style.backgroundImage = 'none';
                document.body.style.backgroundColor = currentTheme.bgColor;
            }
        } else {
            // 默认主题且没有自定义背景图片时，使用默认背景图片
            const style = getComputedStyle(document.documentElement);
            const defaultBgImage = style.getPropertyValue('--body-back-image');
            // 检查是否为页面初始加载
            if (!document.body.getAttribute('data-theme-initialized')) {
                // 页面初始加载，使用background背景图
                document.body.style.backgroundImage = defaultBgImage || 'var(--body-back-image)';
                document.body.style.backgroundColor = ''; // 重置背景颜色，让CSS变量控制
                document.body.style.backgroundPosition = 'center center'; // 默认居中
                document.body.setAttribute('data-theme-initialized', 'true');
            }
            // 如果已经初始化，则保持当前背景状态，不做任何改变
        }
        return () => {
            // 组件卸载时的清理逻辑，一般不需要特别处理
        };
    }, [props.$state.root.backImgUrl, props.$state.root.uiTheme]);
    
    // 我们不再需要在 body 上设置背景位置等属性，因为现在使用 img 标签显示背景
    // 所有样式效果通过 img 标签的内联样式直接应用

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
                        objectPosition: `${props.$state.root.backImgPositionX || 50}% ${props.$state.root.backImgPositionY || 50}%`,
                        transform: `scale(${(props.$state.root.backImgScale || 100) / 100}) rotate(${props.$state.root.backImgRotation || 0}deg)`
                    }}
                />
            )}
        </div>
    );
};

export default storeConnect(Footer);
