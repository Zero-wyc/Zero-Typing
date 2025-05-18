export default {
    setSiteIcon(backColor: string, fontColor: string) {
        // 使用甘城.svg作为固定图标，不再动态生成
        const base = import.meta.env.BASE_URL || '/';
        document.getElementById('site-icon')?.setAttribute('href', `${base}images/甘城.svg`);
    },
};
