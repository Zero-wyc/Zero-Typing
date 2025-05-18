import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Row, Col, Button, Radio, Modal, Tabs, Input, Tooltip, Popover, Slider, Upload, message } from 'antd';
import {
    SettingOutlined,
    AppstoreOutlined,
    InsertRowBelowOutlined,
    SoundOutlined,
    BellOutlined,
    BarsOutlined,
    CarryOutOutlined,
    PictureOutlined,
    UserOutlined,
    UploadOutlined,
} from '@ant-design/icons';
import { useLocation, useNavigate } from 'react-router-dom';

import './Header.less';
import { storeConnect, MapState, MapDispatch } from '@/store/index';
import WORDS from '@/words';
// import { getPinyin } from '@/utils/pinyin';

import themeList, { changeTheme } from '@/themes';
import storage from '@/utils/storage';

const reg = /^[\u2E80-\u9FFF]+$/;
const defaultWordStr = WORDS.map((item) => item.label).join('|');

const ROUTE_HEADER_CONFIG: Record<string, (1 | 0)[]> = {
    '/': [1, 1, 1],
    '/monkey': [1, 1, 0],
    '/sentence': [1, 0, 0],
    '/training': [1, 0, 0],
    '/test': [1, 0, 0],
    '/about': [1, 0, 0],
};

const Header: React.FC<MapState & MapDispatch> = (props) => {
    // 模态框显示状态
    const [settingModalVisible, setSettingModalVisible] = useState(false);
    const [themeModalVisible, setThemeModalVisible] = useState(false);
    const [bgModalVisible, setBgModalVisible] = useState(false);
    const [aboutModalVisible, setAboutModalVisible] = useState(false);
    
    // 背景设置相关状态
    const [bgImageUrl, setBgImageUrl] = useState('');
    const [previewUrl, setPreviewUrl] = useState('');
    const [blurValue, setBlurValue] = useState(0);
    const [opacityValue, setOpacityValue] = useState(100);
    const [localImageUrl, setLocalImageUrl] = useState('');
    const [fileLoading, setFileLoading] = useState(false);
    const [positionX, setPositionX] = useState(50); // x轴位置，默认50%（居中）
    const [positionY, setPositionY] = useState(50); // y轴位置，默认50%（居中）
    const [scaleValue, setScaleValue] = useState(100); // 缩放比例，默认100%
    const [rotationValue, setRotationValue] = useState(0); // 旋转角度，默认0度
    
    // 词组设置相关状态
    const [wordsMode, setWordsMode] = useState(props.$state.root.wordsMode);
    const defaultWordsRef = useRef(defaultWordStr);
    const [words, setWords] = useState(
        props.$state.root.customerWords && props.$state.root.customerWords.length !== 0
            ? props.$state.root.customerWords.map((item) => item.label).join('|')
            : defaultWordStr
    );
    const [errorWordList, setErrorWordList] = useState<string[]>([]);

    const { search, pathname } = useLocation();
    const navigate = useNavigate();

    // 使用useRef存储最新的值，避免在useEffect中直接引用state导致无限循环
    const blurValueRef = useRef(blurValue);
    const opacityValueRef = useRef(opacityValue);
    const positionXRef = useRef(positionX);
    const positionYRef = useRef(positionY);
    const scaleValueRef = useRef(scaleValue);
    const rotationValueRef = useRef(rotationValue);
    
    // 更新ref值
    useEffect(() => {
        blurValueRef.current = blurValue;
    }, [blurValue]);
    
    useEffect(() => {
        opacityValueRef.current = opacityValue;
    }, [opacityValue]);
    
    useEffect(() => {
        positionXRef.current = positionX;
    }, [positionX]);
    
    useEffect(() => {
        positionYRef.current = positionY;
    }, [positionY]);
    
    useEffect(() => {
        scaleValueRef.current = scaleValue;
    }, [scaleValue]);
    
    useEffect(() => {
        rotationValueRef.current = rotationValue;
    }, [rotationValue]);
    
    // 防抖定时器
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    
    // 通用的模态框重置函数
    const resetBgModalState = () => {
        setBlurValue(props.$state.root.backImgBlur || 0);
        setOpacityValue((props.$state.root.backImgOpacity || 1) * 100);
        setPositionX(props.$state.root.backImgPositionX || 50);
        setPositionY(props.$state.root.backImgPositionY || 50);
        setScaleValue(props.$state.root.backImgScale || 100);
        setRotationValue(props.$state.root.backImgRotation || 0);
        setBgModalVisible(false);
        setPreviewUrl('');
        setLocalImageUrl('');
    };
    
    // 防抖处理背景设置的改变
    const handleBgSettingChange = useCallback(() => {
        if (timerRef.current) {
            clearTimeout(timerRef.current);
        }
        
        timerRef.current = setTimeout(() => {
            if (bgModalVisible && bgImageUrl.trim()) {
                props.$dispatch('setBackImgBlur', blurValueRef.current);
                props.$dispatch('setBackImgOpacity', opacityValueRef.current / 100);
            }
        }, 100);
    }, [bgModalVisible, bgImageUrl, props]);
    
    // 处理模糊度变化
    const handleBlurChange = (value: number) => {
        setBlurValue(value);
        handleBgSettingChange();
        
        // 实时预览效果应用到当前背景
        if (previewUrl) {
            props.$dispatch('setBackImgBlur', value);
        }
    };
    
    // 处理透明度变化
    const handleOpacityChange = (value: number) => {
        setOpacityValue(value);
        handleBgSettingChange();
        
        // 实时预览效果应用到当前背景
        if (previewUrl) {
            props.$dispatch('setBackImgOpacity', value / 100);
        }
    };
    
    // 处理X轴位置变化
    const handlePositionXChange = (value: number) => {
        setPositionX(value);
        
        // 实时预览效果应用
        if (previewUrl || localImageUrl) {
            props.$dispatch('setBackImgPositionX', value);
        }
    };
    
    // 处理Y轴位置变化
    const handlePositionYChange = (value: number) => {
        setPositionY(value);
        
        // 实时预览效果应用
        if (previewUrl || localImageUrl) {
            props.$dispatch('setBackImgPositionY', value);
        }
    };
    
    // 处理缩放比例变化
    const handleScaleChange = (value: number) => {
        setScaleValue(value);
        
        // 实时预览效果应用
        if (previewUrl || localImageUrl) {
            props.$dispatch('setBackImgScale', value);
        }
    };
    
    // 处理旋转角度变化
    const handleRotationChange = (value: number) => {
        setRotationValue(value);
        
        // 实时预览效果应用
        if (previewUrl || localImageUrl) {
            props.$dispatch('setBackImgRotation', value);
        }
    };

    const onUiSizeChange = (evt: any) => {
        props.$dispatch('setUiScale', evt.target.value);
    };
    
    const handleModalOk = async () => {
        if (wordsMode === '1') {
            props.$dispatch('setWordsMode', wordsMode);
            setSettingModalVisible(false);
            return;
        }
        const inputWordList = Array.from(new Set(words.split('|').filter(Boolean)));
        const errorList: string[] = [];
        if (inputWordList.length === 0) errorList.push('请输入字词，并以符号|间隔');
        inputWordList.forEach((word) => {
            if (!reg.test(word)) errorList.push(word);
        });
        setErrorWordList(errorList);
        if (errorList.length === 0) {
            const { getPinyin } = await import('@/utils/pinyin');
            props.$dispatch('setWordsMode', wordsMode);
            setWords(inputWordList.join('|'));
            console.time('getPinyin');
            const actWordList = inputWordList.map((word) => ({
                label: word,
                text: getPinyin(word),
            }));
            console.timeEnd('getPinyin');

            props.$dispatch('saveCustomerWords', actWordList);
            setSettingModalVisible(false);
        }
    };
    
    const onTabsChange = (activeKey: string) => {
        setWordsMode(activeKey);
        setErrorWordList([]);
    };
    
    const onTextInput = (evt: any) => {
        setWords(evt.target.value);
    };
    
    const themeBlockClick = (theme: any) => {
        // 确保在链接包含查询参数的情况下，正确处理URL
        const href = window.location.href;
        if (href.includes('#') && href.includes('?')) {
            window.location.href = href.split('?')[0];
        }
        
        // 保存主题到Redux状态并应用
        props.$dispatch('setUiTheme', theme.name);
        setThemeModalVisible(false);
        
        const themeObj = themeList.find((th) => th.name === theme.name);
        if (themeObj) {
            changeTheme(themeObj);
        }
    };

    const go = (route: string) => {
        navigate(route);
    };

    const handleBgModalOk = () => {
        // 检查是否有远程URL或本地图片
        if (bgImageUrl.trim() || localImageUrl) {
            // 优先使用本地图片，如果有的话
            const finalImageUrl = localImageUrl || bgImageUrl;
            
            // 同时设置背景URL、模糊度、透明度、位置和缩放
            props.$dispatch('setBackImgUrl', finalImageUrl);
            props.$dispatch('setBackImgBlur', blurValue);
            props.$dispatch('setBackImgOpacity', opacityValue / 100);
            props.$dispatch('setBackImgPositionX', positionX);
            props.$dispatch('setBackImgPositionY', positionY);
            props.$dispatch('setBackImgScale', scaleValue);
            props.$dispatch('setBackImgRotation', rotationValue);
            
            setBgModalVisible(false);
            setPreviewUrl('');
        }
    };

    const clearBgImage = () => {
        // 从Redux状态中清除
        props.$dispatch('setBackImgUrl', '');
        props.$dispatch('setBackImgBlur', 0);
        props.$dispatch('setBackImgOpacity', 1);
        props.$dispatch('setBackImgPositionX', 50);
        props.$dispatch('setBackImgPositionY', 50);
        props.$dispatch('setBackImgScale', 100);
        props.$dispatch('setBackImgRotation', 0);
        
        // 从localStorage中彻底删除
        storage.local.remove('BACK_IMG_URL');
        storage.local.remove('BACK_IMG_BLUR');
        storage.local.remove('BACK_IMG_OPACITY');
        storage.local.remove('BACK_IMG_POSITION_X');
        storage.local.remove('BACK_IMG_POSITION_Y');
        storage.local.remove('BACK_IMG_SCALE');
        storage.local.remove('BACK_IMG_ROTATION');
        
        // 清除default主题点击标记
        storage.local.remove('DEFAULT_THEME_CLICKED');
        
        // 获取base路径
        const base = import.meta.env.BASE_URL || '/';
        
        // 直接使用构建的图片路径，而不依赖CSS变量
        const imgPath = new URL(`${base}images/background.png`, window.location.origin).pathname;
        document.body.style.backgroundImage = `url("${imgPath}")`;
        document.body.style.backgroundColor = ''; // 重置背景颜色，让CSS变量控制
        document.body.style.backgroundPosition = 'center center'; // 重置背景位置
        document.body.style.backgroundSize = 'cover'; // 重置背景尺寸
        
        // 更新组件状态
        setBgModalVisible(false);
        setBgImageUrl('');
        setPreviewUrl('');
        setLocalImageUrl('');
        setBlurValue(0);
        setOpacityValue(100);
        setPositionX(50);
        setPositionY(50);
        setScaleValue(100);
        setRotationValue(0);
    };

    const openBgModal = () => {
        setBgImageUrl(props.$state.root.backImgUrl || '');
        setBlurValue(props.$state.root.backImgBlur || 0);
        setOpacityValue((props.$state.root.backImgOpacity || 1) * 100);
        setPositionX(props.$state.root.backImgPositionX || 50);
        setPositionY(props.$state.root.backImgPositionY || 50);
        setScaleValue(props.$state.root.backImgScale || 100);
        setRotationValue(props.$state.root.backImgRotation || 0);
        setLocalImageUrl('');
        setBgModalVisible(true);
    };
    
    // 处理本地图片上传
    const handleImageUpload = (info: any) => {
        if (info.file.status === 'uploading') {
            setFileLoading(true);
            return;
        }
        
        if (info.file.status === 'done') {
            setFileLoading(false);
            
            const file = info.file.originFileObj;
            const fileSize = file.size / 1024 / 1024; // 转换为MB
            
            // 当图片特别大(>30MB)时给出警告
            if (fileSize > 30) {
                Modal.confirm({
                    title: '图片过大，可能导致应用问题',
                    content: `当前图片大小约为 ${fileSize.toFixed(2)}MB，过大的图片可能导致浏览器性能问题。强烈建议压缩后使用。`,
                    okText: '压缩后使用',
                    cancelText: '仍然使用原图',
                    onOk: () => compressAndUseImage(file),
                    onCancel: () => processImageDirectly(file)
                });
            }
            // 如果图片大于5MB，直接压缩处理
            else if (fileSize > 5) {
                compressAndUseImage(file);
                message.info(`图片大于5MB，已自动压缩以提高性能。`);
            } else {
                // 直接处理小图片
                processImageDirectly(file);
            }
        }
    };
    
    // 直接处理图片，根据大小可能会降低分辨率但保持质量
    const processImageDirectly = (file: File) => {
        const fileSize = file.size / 1024 / 1024;
        
        // 如果文件小于15MB，直接转为base64
        if (fileSize < 15) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const dataUrl = e.target?.result as string;
                setLocalImageUrl(dataUrl);
                setBgImageUrl('');
                setPreviewUrl(dataUrl);
            };
            reader.readAsDataURL(file);
            return;
        }
        
        // 对于大文件，先加载图像再降低分辨率
        const img = document.createElement('img');
        const objectUrl = URL.createObjectURL(file);
        
        img.onload = () => {
            // 释放对象URL
            URL.revokeObjectURL(objectUrl);
            
            const canvas = document.createElement('canvas');
            // 计算压缩后的尺寸，保持宽高比
            let width = img.width;
            let height = img.height;
            
            // 根据图片大小决定最大尺寸
            const maxDimension = fileSize > 30 ? 1600 : 
                               fileSize > 20 ? 2400 : 3000;
            
            if (width > height && width > maxDimension) {
                height = Math.round((height * maxDimension) / width);
                width = maxDimension;
            } else if (height > maxDimension) {
                width = Math.round((width * maxDimension) / height);
                height = maxDimension;
            }
            
            canvas.width = width;
            canvas.height = height;
            
            // 绘制调整大小的图片
            const ctx = canvas.getContext('2d');
            ctx?.drawImage(img, 0, 0, width, height);
            
            // 使用较高质量（0.95）的JPEG格式，尽量保留图片质量
            const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
            
            // 设置本地图片URL
            setLocalImageUrl(dataUrl);
            // 清除远程URL输入
            setBgImageUrl('');
            // 设置预览
            setPreviewUrl(dataUrl);
            
            message.info(`图片尺寸已自动调整，以确保最佳性能。`);
        };
        
        img.src = objectUrl;
    };
    
    // 压缩图片后使用
    const compressAndUseImage = (file: File) => {
        // 创建一个图片元素来加载文件
        const img = document.createElement('img');
        const reader = new FileReader();
        
        reader.onload = (e) => {
            img.src = e.target?.result as string;
            
            img.onload = () => {
                // 创建canvas来压缩图片
                const canvas = document.createElement('canvas');
                // 计算压缩后的尺寸，保持宽高比
                let width = img.width;
                let height = img.height;
                
                // 如果宽度或高度大于1920，按比例缩小
                const maxDimension = 1920;
                if (width > height && width > maxDimension) {
                    height = Math.round((height * maxDimension) / width);
                    width = maxDimension;
                } else if (height > maxDimension) {
                    width = Math.round((width * maxDimension) / height);
                    height = maxDimension;
                }
                
                canvas.width = width;
                canvas.height = height;
                
                // 绘制压缩后的图片
                const ctx = canvas.getContext('2d');
                ctx?.drawImage(img, 0, 0, width, height);
                
                // 获取压缩后的dataURL，使用0.85的质量
                const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.85);
                
                // 设置本地图片URL
                setLocalImageUrl(compressedDataUrl);
                // 清除远程URL输入
                setBgImageUrl('');
                // 设置预览
                setPreviewUrl(compressedDataUrl);
                
                // 显示压缩效果
                const originalSize = file.size / 1024 / 1024;
                const compressedSize = (compressedDataUrl.length * 0.75) / 1024 / 1024; // base64转字节的近似计算
                message.success(`图片已压缩，从 ${originalSize.toFixed(2)}MB 减小到 ${compressedSize.toFixed(2)}MB`);
            };
        };
        
        reader.readAsDataURL(file);
    };
    
    // 自定义上传组件，不实际上传到服务器，而是转为base64
    const customUpload = async ({ file, onSuccess }: any) => {
        // 验证文件类型
        const isImage = file.type.startsWith('image/');
        if (!isImage) {
            message.error('只能上传图片文件!');
            return;
        }
        
        // 验证文件大小 (限制为50MB)
        const isLt50M = file.size / 1024 / 1024 < 50;
        if (!isLt50M) {
            message.error('图片必须小于50MB!');
            return;
        }
        
        // 模拟上传成功
        setTimeout(() => {
            if (onSuccess) onSuccess();
        }, 100);
    };

    // 根据URL或Redux状态应用主题
    useEffect(() => {
        const applyTheme = (themeName: string) => {
            const themeObj = themeList.find((th) => th.name === themeName);
            if (themeObj) {
                changeTheme(themeObj);
            }
        };

        if (search) {
            applyTheme(search.slice(1).replace('-', ' '));
        } else if (props.$state.root.uiTheme) {
            applyTheme(props.$state.root.uiTheme);
        }
    }, [search, props.$state.root.uiTheme]);

    // 实时预览背景
    useEffect(() => {
        if (bgModalVisible && bgImageUrl.trim()) {
            setPreviewUrl(bgImageUrl);
        }
    }, [bgModalVisible, bgImageUrl]);

    // 公共的按钮属性
    const commonButtonProps = {
        tabIndex: -1,
        type: "link" as const
    };

    return (
        <div className="app-header">
            <Row>
                <Col flex="auto">
                    <Button
                        {...commonButtonProps}
                        icon={<InsertRowBelowOutlined />}
                        onClick={() => go('')}
                    >
                        模式1(限时)
                    </Button>
                    <Button
                        {...commonButtonProps}
                        icon={<BellOutlined />}
                        onClick={() => go('monkey')}
                    >
                        模式2(计时)
                    </Button>
                    <Button
                        {...commonButtonProps}
                        icon={<BarsOutlined />}
                        onClick={() => go('sentence')}
                    >
                        模式3(句子)
                    </Button>
                    <Button
                        {...commonButtonProps}
                        icon={<CarryOutOutlined />}
                        onClick={() => go('training')}
                    >
                        指法练习
                    </Button>
                    <Button
                        {...commonButtonProps}
                        icon={<SoundOutlined />}
                        onClick={() => go('test')}
                    >
                        按键声音反馈
                    </Button>
                    <Button
                        {...commonButtonProps}
                        icon={<AppstoreOutlined />}
                        onClick={() => setThemeModalVisible(true)}
                    >
                        主题
                    </Button>
                    <Button
                        {...commonButtonProps}
                        icon={<PictureOutlined />}
                        onClick={openBgModal}
                    >
                        背景自定义
                    </Button>
                    <Button
                        {...commonButtonProps}
                        icon={<UserOutlined />}
                        onClick={() => setAboutModalVisible(true)}
                    >
                        关于我
                    </Button>
                </Col>
            </Row>
            <Row style={{ marginTop: '10px' }}>
                <Col flex="auto">
                    <Button
                        {...commonButtonProps}
                        style={{ display: ROUTE_HEADER_CONFIG[pathname]?.[1] ? '' : 'none' }}
                        icon={<SettingOutlined />}
                        onClick={() => setSettingModalVisible(true)}
                    >
                        词组设置
                    </Button>
                    <div
                        style={{
                            display: ROUTE_HEADER_CONFIG[pathname]?.[2] ? 'inline-block' : 'none',
                        }}
                    >
                        <span className="radio-text">
                            &nbsp;&nbsp;&nbsp;&nbsp;UI尺寸:&nbsp;&nbsp;
                        </span>
                        <Radio.Group
                            onChange={onUiSizeChange}
                            defaultValue={props.$state.root.uiScale}
                        >
                            <Radio tabIndex={-1} value="s">
                                正常
                            </Radio>
                            <Radio tabIndex={-1} value="m">
                                大
                            </Radio>
                            <Radio tabIndex={-1} value="l">
                                特大
                            </Radio>
                        </Radio.Group>
                    </div>
                </Col>
            </Row>
            <Modal
                className="header-modal-setting"
                title=""
                open={settingModalVisible}
                closable={false}
                maskClosable={false}
                footer={
                    <Tooltip placement="left" title="将自动去除重复词组">
                        <Button
                            tabIndex={-1}
                            className="header-modal-confirm-btn"
                            type="primary"
                            onClick={handleModalOk}
                        >
                            确定
                        </Button>
                    </Tooltip>
                }
            >
                <Tabs defaultActiveKey={wordsMode} onChange={onTabsChange}>
                    <Tabs.TabPane tab="默认词组" key="1">
                        <Input.TextArea
                            autoSize={{ minRows: 9, maxRows: 16 }}
                            disabled
                            defaultValue={defaultWordsRef.current}
                        />
                    </Tabs.TabPane>
                    <Tabs.TabPane tab="自定义词组" key="2">
                        <Input.TextArea
                            autoSize={{ minRows: 9, maxRows: 16 }}
                            value={words}
                            onChange={onTextInput}
                        />
                    </Tabs.TabPane>
                </Tabs>
                <Row className="header-modal--words-length">
                    <Col span={12}>
                        <Row gutter={6} className="error-word">
                            {errorWordList.map((err, index) => (
                                <Col key={index}>{err}</Col>
                            ))}
                        </Row>
                    </Col>
                    <Col span={12} className="header-modal--total">
                        共(
                        {wordsMode === '1'
                            ? defaultWordsRef.current.split('|').length
                            : words.split('|').filter(Boolean).length}
                        )个词
                    </Col>
                </Row>
            </Modal>
            <Modal
                className="header-modal-theme"
                title=""
                open={themeModalVisible}
                footer=""
                onCancel={() => setThemeModalVisible(false)}
            >
                <Row justify="space-around" className="header-modal-theme--box">
                    {themeList.map((theme, index) => (
                        <Col
                            flex="100px"
                            className="theme-display-block"
                            key={index}
                            style={{
                                backgroundColor: theme.bgColor,
                                color: theme.textColor,
                            }}
                            onClick={() => themeBlockClick(theme)}
                        >
                            {theme.name}
                        </Col>
                    ))}
                    <Col flex="100px"></Col>
                    <Col flex="100px"></Col>
                    <Col flex="100px"></Col>
                    <Col flex="100px"></Col>
                </Row>
            </Modal>
            <Modal
                className="header-modal-bg"
                title="自定义背景图片"
                open={bgModalVisible}
                onOk={handleBgModalOk}
                onCancel={resetBgModalState}
                footer={[
                    <Button key="clear" onClick={clearBgImage}>
                        清除背景
                    </Button>,
                    <Button key="cancel" onClick={resetBgModalState}>
                        取消
                    </Button>,
                    <Button 
                        key="submit" 
                        type="primary" 
                        onClick={handleBgModalOk}
                        disabled={!bgImageUrl.trim() && !localImageUrl}
                    >
                        确定
                    </Button>,
                ]}
            >
                <Tabs defaultActiveKey="url" items={[
                    {
                        key: 'url',
                        label: '网络图片链接',
                        children: (
                            <>
                                <p>请输入图片URL链接：</p>
                                <Input 
                                    placeholder="https://example.com/image.jpg" 
                                    value={bgImageUrl} 
                                    onChange={(e) => {
                                        setBgImageUrl(e.target.value);
                                        if (e.target.value) {
                                            setPreviewUrl(e.target.value);
                                            setLocalImageUrl(''); // 清除本地图片
                                        }
                                    }}
                                />
                                <p style={{ marginTop: '10px', fontSize: '12px', color: '#ffffff' }}>
                                    可以输入任意图片链接，图片将作为网站背景
                                </p>
                            </>
                        )
                    },
                    {
                        key: 'upload',
                        label: '上传本地图片',
                        children: (
                            <>
                                <Upload
                                    name="file"
                                    listType="picture"
                                    className="bg-image-uploader"
                                    showUploadList={false}
                                    customRequest={customUpload}
                                    onChange={handleImageUpload}
                                >
                                    <Button 
                                        icon={<UploadOutlined />} 
                                        loading={fileLoading}
                                        className="upload-local-image-btn"
                                    >
                                        选择本地图片
                                    </Button>
                                </Upload>
                                {localImageUrl && (
                                    <div style={{ marginTop: '10px' }}>
                                        <p>已选择本地图片</p>
                                    </div>
                                )}
                                <p style={{ marginTop: '10px', fontSize: '12px', color: '#ffffff' }}>
                                    支持jpg、png等常见图片格式，大小不超过50MB。大图片会自动调整以确保性能。
                                </p>
                            </>
                        )
                    }
                ]} />
                
                <div style={{ marginTop: '20px' }}>
                    <p>模糊度调整：</p>
                    <Slider 
                        min={0} 
                        max={20} 
                        value={blurValue} 
                        onChange={handleBlurChange} 
                        tipFormatter={(value) => `${value}px`} 
                    />
                </div>
                
                <div style={{ marginTop: '20px' }}>
                    <p>透明度调整：</p>
                    <Slider 
                        min={10} 
                        max={100} 
                        value={opacityValue} 
                        onChange={handleOpacityChange} 
                        tipFormatter={(value) => `${value}%`} 
                    />
                </div>
                
                <div style={{ marginTop: '20px' }}>
                    <p>水平位置调整 (X轴)：</p>
                    <Slider 
                        min={0} 
                        max={300} 
                        value={positionX} 
                        onChange={handlePositionXChange} 
                        tipFormatter={(value) => `${value}%`} 
                    />
                </div>
                
                <div style={{ marginTop: '20px' }}>
                    <p>垂直位置调整 (Y轴)：</p>
                    <Slider 
                        min={-300} 
                        max={300} 
                        value={positionY} 
                        onChange={handlePositionYChange} 
                        tipFormatter={(value) => `${value}%`} 
                    />
                </div>
                
                <div style={{ marginTop: '20px' }}>
                    <p>缩放比例调整：</p>
                    <Slider 
                        min={50} 
                        max={200} 
                        value={scaleValue} 
                        onChange={handleScaleChange} 
                        tipFormatter={(value) => `${value}%`} 
                    />
                </div>
                
                <div style={{ marginTop: '20px' }}>
                    <p>旋转角度调整：</p>
                    <Slider 
                        min={-180} 
                        max={180} 
                        value={rotationValue} 
                        onChange={handleRotationChange} 
                        tipFormatter={(value) => `${value}°`} 
                    />
                </div>
                
                {(previewUrl || localImageUrl) && (
                    <div style={{ marginTop: '15px' }}>
                        <p>图片预览：</p>
                        <div style={{ 
                            maxHeight: '200px', 
                            overflow: 'hidden',
                            position: 'relative' 
                        }}>
                            <img 
                                src={previewUrl || localImageUrl} 
                                alt="背景预览" 
                                style={{ 
                                    width: '100%', 
                                    objectFit: 'cover', 
                                    border: '1px solid #ddd',
                                    filter: `blur(${blurValue}px)`,
                                    opacity: opacityValue / 100,
                                    objectPosition: `${positionX}% ${positionY}%`,
                                    transform: `scale(${scaleValue / 100}) rotate(${rotationValue}deg)`
                                }} 
                            />
                        </div>
                    </div>
                )}
            </Modal>
            <Modal
                className="header-modal-about"
                title="关于我"
                open={aboutModalVisible}
                footer={null}
                onCancel={() => setAboutModalVisible(false)}
            >
                <div className="about-content">
                    <p>来自一个FW的fork并进行一些修改</p>
                    <p>改自 <a href="https://github.com/barneyzhao/typing-cn" target="_blank" rel="noopener noreferrer">Barneyzhao</a></p>
                    <p>
                        <span>有兴趣来个人主页看看嘛QAQ</span>
                    </p>
                    <p>
                        <span>Gitbub</span>：
                        <a href="https://github.com/Zero-wyc/Zero-Typing" target="_blank">https://github.com/Zero-wyc/Zero-Typing</a>
                    </p>
                </div>
            </Modal>
            {/* <div>router examples.(with code split lazy load, check js files in network)</div>
            <ul>
                <li>
                    <Link to="/">/home</Link>
                </li>
                <li>
                    <Link to="/about/urlValue">/about/urlValue</Link>
                </li>
                <li>
                    <Link to="/dashboard">/dashboard</Link>
                </li>
                <li>
                    <Link to="/dashboard/graph/123">/dashboard/graph/123</Link>
                </li>
                <li>
                    <Link to="/dashboard/list">/dashboard/list</Link>
                </li>
            </ul> */}
        </div>
    );
};

export default storeConnect(Header);
