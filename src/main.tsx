import React from 'react';
import ReactDOM from 'react-dom';
import 'antd/dist/antd.css';
import './styles/forcedColors.css';

import App from './App';
import './index.less';
import storage from './utils/storage';
import { getThemeByName } from './themes';
import { setupCustomCursors } from './utils/cursor';

console.log('APP_VERSION:', __APP_VERSION__);

// 设置自定义光标
setupCustomCursors();

// 确保默认背景图片在打包后正确加载
function ensureDefaultBackground() {
  // 检查是否有设置背景图片
  setTimeout(() => {
    const body = document.body;
    const bodyStyle = window.getComputedStyle(body);
    const uiTheme = storage.local.get<string>('UI_THEME') || 'default';
    // 检查是否有自定义背景图片
    const hasCustomBg = storage.local.get<string>('BACK_IMG_URL');
    // 检查是否点击过default主题
    const defaultThemeClicked = storage.local.get<boolean>('DEFAULT_THEME_CLICKED');
    
    if (hasCustomBg) {
      // 有自定义背景图片，什么都不做，让Footer组件处理
      return;
    } else if (uiTheme === 'default') {
      if (defaultThemeClicked) {
        // 用户之前点击过default主题，使用纯色背景
        const currentTheme = getThemeByName(uiTheme);
        if (currentTheme) {
          body.style.backgroundImage = 'none';
          body.style.backgroundColor = currentTheme.bgColor;
        }
      } else {
        // 默认主题且从未点击过，确保设置background背景图
        // 清除任何已设置的背景颜色
        body.style.backgroundColor = '';
        
        if (!bodyStyle.backgroundImage || bodyStyle.backgroundImage === 'none' || bodyStyle.backgroundImage === 'initial') {
          // 尝试直接设置默认背景图片
          const base = import.meta.env.BASE_URL || '/';
          // 修改路径引用方式，确保在base不同的情况下都能正确加载
          const imgPath = new URL(`${base}images/background.png`, window.location.origin).pathname;
          body.style.backgroundImage = `url("${imgPath}")`;
        }
      }
    } else {
      // 非默认主题下，设置纯色背景
      const currentTheme = getThemeByName(uiTheme);
      if (currentTheme) {
        body.style.backgroundImage = 'none';
        body.style.backgroundColor = currentTheme.bgColor;
      }
    }
  }, 100);
}

// 初始化背景
ensureDefaultBackground();

ReactDOM.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
    document.getElementById('root')
);
