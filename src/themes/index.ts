/*
 * @Author: zhaoxuanzi
 * @Date: 2020-12-07 20:12:31
 * @LastEditors: zhaoxuanzi
 * @LastEditTime: 2021-02-18 10:48:01
 */
import site from '@/utils/siteIcon';
import storage from '@/utils/storage';
import store from '@/store';

import list from './config';

export default list;

// 通过主题名称获取主题对象
export const getThemeByName = (themeName: string) => {
    return list.find(theme => theme.name === themeName);
};

export const changeTheme = (theme: typeof list[0]) => {
    // 切换主题时处理背景设置
    if (theme.name === 'default') {
        // 检查是否是第一次加载还是用户点击
        const isUserClick = document.readyState === 'complete';
        
        if (isUserClick) {
            // 用户点击default主题 - 清除背景图片，使用纯色背景
            storage.local.remove('BACK_IMG_URL');
            storage.local.remove('BACK_IMG_BLUR');
            storage.local.remove('BACK_IMG_OPACITY');
            
            // 清除Redux状态中的背景图片设置
            store.dispatch({ type: 'setBackImgUrl', payload: '' });
            store.dispatch({ type: 'setBackImgBlur', payload: 0 });
            store.dispatch({ type: 'setBackImgOpacity', payload: 1 });
            
            // 设置标记，表示用户已点击过default主题
            storage.local.set('DEFAULT_THEME_CLICKED', true);
            
            // 设置纯色背景
            document.body.style.backgroundImage = 'none';
            document.body.style.backgroundColor = theme.bgColor;
        } else {
            // 初始加载 - 检查是否之前点击过default主题
            const defaultThemeClicked = storage.local.get('DEFAULT_THEME_CLICKED');
            
            if (defaultThemeClicked) {
                // 之前点击过default主题，使用纯色背景
                document.body.style.backgroundImage = 'none';
                document.body.style.backgroundColor = theme.bgColor;
            } else {
                // 从未点击过default主题，使用background背景图
                const style = getComputedStyle(document.documentElement);
                const defaultBgImage = style.getPropertyValue('--body-back-image');
                document.body.style.backgroundImage = defaultBgImage || 'var(--body-back-image)';
                document.body.style.backgroundColor = '';
            }
        }
    } else {
        // 非default主题 - 清除背景图片设置
        storage.local.remove('BACK_IMG_URL');
        storage.local.remove('BACK_IMG_BLUR');
        storage.local.remove('BACK_IMG_OPACITY');
        
        // 清除Redux状态中的背景图片设置
        store.dispatch({ type: 'setBackImgUrl', payload: '' });
        store.dispatch({ type: 'setBackImgBlur', payload: 0 });
        store.dispatch({ type: 'setBackImgOpacity', payload: 1 });
        
        // 设置纯色背景，使用主题的bgColor
        document.body.style.backgroundImage = 'none';
        document.body.style.backgroundColor = theme.bgColor;
    }

    site.setSiteIcon(theme.bgColor, theme.textColor);
    
    const themeLinkEl = document.querySelector('#current-theme');
    if (!themeLinkEl) return;
    
    // 获取当前基础URL路径
    const baseEl = document.querySelector('#default-theme');
    if (baseEl) {
        const basePath = baseEl.getAttribute('href') || '';
        const baseDir = basePath.substring(0, basePath.lastIndexOf('/') + 1);
        
        // 生成主题名称（替换空格为连字符）
        const themeName = theme.name.replace(/ /g, '-');
        
        // 设置新主题路径
        themeLinkEl.setAttribute('href', `${baseDir}${themeName}.css`);
    }
};
