/**
 * 设置自定义鼠标样式
 */
export function setupCustomCursors(): void {
  // 获取当前 base URL
  const baseUrl = import.meta.env.BASE_URL || '/';
  
  // 创建样式元素
  const style = document.createElement('style');
  style.innerHTML = `
    /* 默认鼠标样式 */
    body {
      cursor: url("${baseUrl}cursors/Normal.cur"), auto;
    }
    
    /* 控件鼠标样式 */
    button,
    a,
    [role="button"],
    input[type="button"],
    input[type="submit"],
    input[type="reset"],
    select,
    label[for],
    [tabindex="0"],
    .clickable {
      cursor: url("${baseUrl}cursors/Link.cur"), pointer !important;
    }
    
    /* 文本输入区域保持文本选择样式 */
    input[type="text"], 
    input[type="password"], 
    input[type="email"], 
    input[type="number"], 
    input[type="search"], 
    input[type="tel"], 
    input[type="url"], 
    textarea, 
    [contenteditable="true"] {
      cursor: text !important;
    }
  `;
  
  // 将样式添加到文档头部
  document.head.appendChild(style);
}

export default { setupCustomCursors }; 