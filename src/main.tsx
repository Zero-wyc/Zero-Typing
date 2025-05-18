import React from 'react';
import ReactDOM from 'react-dom';
import 'antd/dist/antd.css';
import './styles/forcedColors.css';

import App from './App';
import './index.less';
import storage from './utils/storage';
import { getThemeByName } from './themes';

console.log('APP_VERSION:', __APP_VERSION__);

// 确保每次刷新页面时都使用甘城2_1背景图
function ensureDefaultBackground() {
  // 总是设置甘城2_1作为默认背景
  setTimeout(() => {
    const body = document.body;
    
    // 每次刷新页面都重新设置甘城2_1背景图
    const base = import.meta.env.BASE_URL || '/';
    const imgPath = new URL(`${base}images/甘城2_1.png`, window.location.origin).pathname;
    body.style.backgroundImage = `url("${imgPath}")`;
    
    // 重置背景颜色
    body.style.backgroundColor = '';
    
    // 将THEME_CLICKED标记设为false，表示刷新后重新开始
    storage.local.set('THEME_CLICKED', false);
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
