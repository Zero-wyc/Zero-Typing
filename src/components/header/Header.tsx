import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Row, Col, Button, Radio, Modal, Tabs, Input, Tooltip, Popover, Slider } from 'antd';
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
    const [settingModalVisible, setSettingModalVisible] = useState(false);
    const [themeModalVisible, setThemeModalVisible] = useState(false);
    const [bgModalVisible, setBgModalVisible] = useState(false);
    const [aboutModalVisible, setAboutModalVisible] = useState(false);
    const [bgImageUrl, setBgImageUrl] = useState('');
    const [previewUrl, setPreviewUrl] = useState('');
    const [blurValue, setBlurValue] = useState(0);
    const [opacityValue, setOpacityValue] = useState(100);
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
    
    // 更新ref值
    useEffect(() => {
        blurValueRef.current = blurValue;
    }, [blurValue]);
    
    useEffect(() => {
        opacityValueRef.current = opacityValue;
    }, [opacityValue]);
    
    // 防抖定时器
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    
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
        
        // 设置一个标记表示主题已被点击过
        storage.local.set('THEME_CLICKED', true);
        
        // 保存主题到Redux状态
        props.$dispatch('setUiTheme', theme.name);
        
        // 关闭主题模态框
        setThemeModalVisible(false);
        
        // 直接调用changeTheme函数以确保主题立即应用
        const themeObj = themeList.find((th) => th.name === theme.name);
        if (themeObj) {
            changeTheme(themeObj);
        }
    };

    const go = (route: string) => {
        navigate(route);
    };

    const handleBgModalOk = () => {
        if (bgImageUrl.trim()) {
            // 同时设置背景URL、模糊度和透明度
            props.$dispatch('setBackImgUrl', bgImageUrl);
            props.$dispatch('setBackImgBlur', blurValue);
            props.$dispatch('setBackImgOpacity', opacityValue / 100);
            
            setBgModalVisible(false);
            setPreviewUrl('');
        }
    };

    const clearBgImage = () => {
        // 从Redux状态中清除
        props.$dispatch('setBackImgUrl', '');
        props.$dispatch('setBackImgBlur', 0);
        props.$dispatch('setBackImgOpacity', 1);
        
        // 从localStorage中彻底删除
        storage.local.remove('BACK_IMG_URL');
        storage.local.remove('BACK_IMG_BLUR');
        storage.local.remove('BACK_IMG_OPACITY');
        
        // 更新组件状态
        setBgModalVisible(false);
        setBgImageUrl('');
        setPreviewUrl('');
        setBlurValue(0);
        setOpacityValue(100);
    };

    const openBgModal = () => {
        if (props.$state.root.backImgUrl) {
            setBgImageUrl(props.$state.root.backImgUrl);
        } else {
            setBgImageUrl('');
        }
        setBlurValue(props.$state.root.backImgBlur || 0);
        setOpacityValue((props.$state.root.backImgOpacity || 1) * 100);
        setBgModalVisible(true);
    };

    useEffect(() => {
        if (search) {
            const themeObj = themeList.find((th) => th.name === search.slice(1).replace('-', ' '));
            if (themeObj) {
                // 从URL参数加载主题时也设置已点击标记
                storage.local.set('THEME_CLICKED', true);
                changeTheme(themeObj);
            }
        } else if (props.$state.root.uiTheme) {
            const themeObj = themeList.find((th) => th.name === props.$state.root.uiTheme);
            if (themeObj) {
                // 如果是从localStorage加载的主题，则可能已经点击过
                // 检查是否需要设置点击标记（如果是首次加载且是默认主题则不设置）
                if (props.$state.root.uiTheme !== 'default' || storage.local.get('THEME_CLICKED')) {
                    storage.local.set('THEME_CLICKED', true);
                }
                changeTheme(themeObj);
            }
        }
    }, [search, props.$state.root.uiTheme]);

    // 实时预览背景
    useEffect(() => {
        if (bgModalVisible && bgImageUrl.trim()) {
            setPreviewUrl(bgImageUrl);
        }
    }, [bgModalVisible, bgImageUrl]);
    
    // 移除导致无限循环的useEffect
    // useEffect(() => {
    //     if (bgModalVisible && bgImageUrl.trim() && previewUrl) {
    //         props.$dispatch('setBackImgBlur', blurValue);
    //         props.$dispatch('setBackImgOpacity', opacityValue / 100);
    //     }
    // }, [blurValue, opacityValue, bgModalVisible, bgImageUrl, previewUrl, props]);

    return (
        <div className="app-header">
            <Row>
                <Col flex="auto">
                    <Button
                        tabIndex={-1}
                        type="link"
                        icon={<InsertRowBelowOutlined />}
                        onClick={() => go('')}
                    >
                        模式1(限时)
                    </Button>
                    <Button
                        tabIndex={-1}
                        type="link"
                        icon={<BellOutlined />}
                        onClick={() => go('monkey')}
                    >
                        模式2(计时)
                    </Button>
                    <Button
                        tabIndex={-1}
                        type="link"
                        icon={<BarsOutlined />}
                        onClick={() => go('sentence')}
                    >
                        模式3(句子)
                    </Button>
                    <Button
                        tabIndex={-1}
                        type="link"
                        icon={<CarryOutOutlined />}
                        onClick={() => go('training')}
                    >
                        指法练习
                    </Button>
                    <Button
                        tabIndex={-1}
                        type="link"
                        icon={<SoundOutlined />}
                        onClick={() => go('test')}
                    >
                        按键声音反馈
                    </Button>
                    <Button
                        tabIndex={-1}
                        type="link"
                        icon={<AppstoreOutlined />}
                        onClick={() => setThemeModalVisible(true)}
                    >
                        主题
                    </Button>
                    <Button
                        tabIndex={-1}
                        type="link"
                        icon={<PictureOutlined />}
                        onClick={openBgModal}
                    >
                        背景自定义
                    </Button>
                    <Button
                        tabIndex={-1}
                        type="link"
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
                        tabIndex={-1}
                        type="link"
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
                onCancel={() => {
                    // 恢复原始设置
                    setBlurValue(props.$state.root.backImgBlur || 0);
                    setOpacityValue((props.$state.root.backImgOpacity || 1) * 100);
                    setBgModalVisible(false);
                    setPreviewUrl('');
                }}
                footer={[
                    <Button key="clear" onClick={clearBgImage}>
                        清除背景
                    </Button>,
                    <Button key="cancel" onClick={() => {
                        // 恢复原始设置
                        setBlurValue(props.$state.root.backImgBlur || 0);
                        setOpacityValue((props.$state.root.backImgOpacity || 1) * 100);
                        setBgModalVisible(false);
                        setPreviewUrl('');
                    }}>
                        取消
                    </Button>,
                    <Button 
                        key="submit" 
                        type="primary" 
                        onClick={handleBgModalOk}
                        disabled={!bgImageUrl.trim()}
                    >
                        确定
                    </Button>,
                ]}
            >
                <p>请输入图片URL链接：</p>
                <Input 
                    placeholder="https://example.com/image.jpg" 
                    value={bgImageUrl} 
                    onChange={(e) => {
                        setBgImageUrl(e.target.value);
                    }}
                />
                <p style={{ marginTop: '10px', fontSize: '12px', color: '#999' }}>
                    可以输入任意图片链接，图片将作为网站背景
                </p>
                
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
                
                {previewUrl && (
                    <div style={{ marginTop: '15px' }}>
                        <p>图片预览：</p>
                        <div style={{ maxHeight: '200px', overflow: 'hidden' }}>
                            <img 
                                src={previewUrl} 
                                alt="背景预览" 
                                style={{ 
                                    width: '100%', 
                                    objectFit: 'cover', 
                                    border: '1px solid #ddd',
                                    filter: `blur(${blurValue}px)`,
                                    opacity: opacityValue / 100
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
                    <p>有兴趣来<a href="https://Zero251.xyz" target="_blank" rel="noopener noreferrer">个人主页</a>看看嘛QAQ</p>
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
