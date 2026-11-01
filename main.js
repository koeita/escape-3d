/**
 * 密室の謎解き脱出 3D - 『古びた書斎と賢者の鍵』完全移植版
 * Three.js (r128) + PointerLockControls + Web Audio API (se.js)
 */

(() => {
  'use strict';

  // --- サウンドマネージャー初期化 ---
  const soundManager = new SoundManager();

  // --- クラシック細線SVGアイコン定義（脱・絵文字UI） ---
  const UI_ICONS = {
    book: `<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-2px; margin-right:5px;"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>`,
    lockClosed: `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="11" width="14" height="10" rx="2" ry="2"></rect><path d="M8 11V7a4 4 0 0 1 8 0v4"></path><circle cx="12" cy="16" r="1"></circle></svg>`,
    lockOpen: `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="11" width="14" height="10" rx="2" ry="2"></rect><path d="M8 11V7a4 4 0 0 1 7.9-1"></path><circle cx="12" cy="16" r="1"></circle></svg>`,
    bulb: `<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-3px; margin-right:6px;"><path d="M9 18h6"></path><path d="M10 22h4"></path><path d="M12 2a7 7 0 0 0-4 12.7c.6.5 1 1.3 1 2.1V18h6v-1.2c0-.8.4-1.6 1-2.1A7 7 0 0 0 12 2z"></path></svg>`
  };

  // --- アイテム定義 ---
  const ITEMS = {
    screwdriver: {
      id: 'screwdriver',
      name: '精密ドライバー',
      icon: `<svg viewBox="0 0 40 40"><rect x="18" y="4" width="4" height="18" fill="#c0392b" rx="2"/><line x1="20" y1="22" x2="20" y2="34" stroke="#bdc3c7" stroke-width="3" stroke-linecap="round"/><line x1="18" y1="34" x2="22" y2="34" stroke="#7f8c8d" stroke-width="2"/></svg>`,
      desc: '絨毯の隅に隠されていた細身のマイナスドライバー。小さなネジを外すのに使えそうだ。'
    },
    music_box: {
      id: 'music_box',
      name: '真鍮の小箱',
      icon: `<svg viewBox="0 0 40 40"><rect x="8" y="10" width="24" height="20" fill="#caa86a" stroke="#7a5f33" stroke-width="2" rx="3"/><circle cx="20" cy="20" r="4" fill="#7a5f33"/><circle cx="12" cy="14" r="1.5" fill="#333"/><circle cx="28" cy="14" r="1.5" fill="#333"/><circle cx="12" cy="26" r="1.5" fill="#333"/><circle cx="28" cy="26" r="1.5" fill="#333"/></svg>`,
      desc: 'ソファの隙間に挟まっていた頑丈な金属小箱。裏蓋が4隅のネジで留められている。【調べる】で工具を使って開けられそうだ。'
    },
    silver_key: {
      id: 'silver_key',
      name: '小さな銀の鍵',
      icon: `<svg viewBox="0 0 40 40"><circle cx="15" cy="15" r="7" fill="none" stroke="#bdc3c7" stroke-width="3"/><line x1="20" y1="20" x2="30" y2="30" stroke="#bdc3c7" stroke-width="4" stroke-linecap="round"/><line x1="26" y1="26" x2="29" y2="23" stroke="#bdc3c7" stroke-width="3"/></svg>`,
      desc: '小箱の中から出てきた銀色の鍵。どこかの小さな鍵穴に適合しそうだ。'
    },
    star_disc: {
      id: 'star_disc',
      name: '星座の円盤',
      icon: `<svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="13" fill="#1b2631" stroke="#f1c40f" stroke-width="2.5"/><polygon points="20,11 22,17 28,17 23,21 25,27 20,23 15,27 17,21 12,17 18,17" fill="#f1c40f"/><circle cx="20" cy="20" r="2.5" fill="#1b2631"/></svg>`,
      desc: '小箱の中から見つかった青銅と真鍮の円盤。中央に星の紋様が刻まれ、何かの台座にはめる突起がある。'
    },
    switch_key: {
      id: 'switch_key',
      name: '端子盤の鍵',
      icon: `<svg viewBox="0 0 40 40"><circle cx="14" cy="14" r="6" fill="none" stroke="#e67e22" stroke-width="3"/><line x1="18" y1="18" x2="28" y2="28" stroke="#e67e22" stroke-width="3" stroke-linecap="round"/><line x1="24" y1="24" x2="27" y2="21" stroke="#e67e22" stroke-width="2.5"/></svg>`,
      desc: '机の引き出しに入っていた小さな真鍮鍵。配電盤や端子ボックス向けの形状をしている。'
    },
    armillary_pin: {
      id: 'armillary_pin',
      name: '星型の真鍮ピン',
      icon: `<svg viewBox="0 0 40 40"><polygon points="20,6 23,15 32,15 25,20 27,29 20,24 13,29 15,20 8,15 17,15" fill="#f1c40f" stroke="#caa86a" stroke-width="1.5"/><line x1="20" y1="24" x2="20" y2="34" stroke="#e8c988" stroke-width="3" stroke-linecap="round"/></svg>`,
      desc: '壁金庫の中に納められていた小さな真鍮ピン。頭部に星の意匠が施されている。'
    },
    poker: {
      id: 'poker',
      name: '真鍮の火かき棒',
      icon: `<svg viewBox="0 0 40 40"><line x1="10" y1="30" x2="28" y2="12" stroke="#bdc3c7" stroke-width="3" stroke-linecap="round"/><path d="M 28,12 Q 32,8 30,6" stroke="#bdc3c7" stroke-width="2.5" fill="none"/><line x1="10" y1="30" x2="14" y2="33" stroke="#bdc3c7" stroke-width="2.5"/></svg>`,
      desc: '天球儀の中から見つかった真鍮の棒。先端がフック状になっており、重い物を引っ掛けて動かせる。'
    },
    emblem: {
      id: 'emblem',
      name: '賢者の青玉紋章',
      icon: `<svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="12" fill="#caa86a" stroke="#7a5f33" stroke-width="2"/><circle cx="20" cy="20" r="6" fill="#3498db" stroke="#1b4f72" stroke-width="1.5"/></svg>`,
      desc: '暖炉の灰の中から引き上げた重厚なメダル。中央に神秘的な青い宝玉が嵌め込まれている。'
    },
    broken_key: {
      id: 'broken_key',
      name: '不完全な鍵身',
      icon: `<svg viewBox="0 0 40 40"><line x1="14" y1="26" x2="28" y2="12" stroke="#f1c40f" stroke-width="4" stroke-linecap="round"/><line x1="24" y1="16" x2="27" y2="13" stroke="#f1c40f" stroke-width="3"/><circle cx="12" cy="28" r="4" fill="none" stroke="#f1c40f" stroke-width="2" stroke-dasharray="2,2"/></svg>`,
      desc: '古時計から落ちてきた真鍮の鍵軸。持ち手が欠損しており回すことができない。【調べる】で別のパーツを結合できそうだ。'
    },
    brass_key: {
      id: 'brass_key',
      name: '賢者の真鍮鍵',
      icon: `<svg viewBox="0 0 40 40"><circle cx="15" cy="15" r="8" fill="#3498db" stroke="#f1c40f" stroke-width="3.5"/><line x1="21" y1="21" x2="33" y2="33" stroke="#f1c40f" stroke-width="4.5" stroke-linecap="round"/><line x1="29" y1="29" x2="33" y2="25" stroke="#f1c40f" stroke-width="3"/><line x1="25" y1="25" x2="29" y2="21" stroke="#f1c40f" stroke-width="3"/></svg>`,
      desc: '鍵身に青玉紋章を結合して完成した真鍮の大鍵。大扉の頑丈な鍵穴に適合する！'
    }
  };

  // --- ゲームステート ---
  const state = {
    isLightOn: true,
    switchCoverUnlocked: false,
    
    carpetFlipped: false,
    hasScrewdriver: false,
    sofaBoxFound: false,
    boxDisassembled: false,
    drawerUnlocked: false,
    hasSwitchKey: false,
    hasPoker: false,
    fireplaceGrilleRemoved: false,
    hasEmblem: false,
    booksSequence: [],
    booksPuzzleSolved: false,
    safeDiscInserted: false,
    safeAngle: 90,
    safeUnlocked: false,
    hasArmillaryPin: false,
    armillaryPinInserted: false,
    armillaryAngle: 90,
    armillaryOpened: false,
    clockHour: 0,
    clockMinute: 0,
    clockPuzzleSolved: false,
    hasBrokenKey: false,
    keyAssembled: false,
    doorCode: [0, 0, 0, 0],
    doorKeyUnlocked: false,
    doorCodeUnlocked: false,
    gameCleared: false,

    inventory: [], // [{ id, name, icon, desc }]
    selectedItem: null,
    
    startTime: Date.now(),
  };

  // --- DOM Elements ---
  const container = document.getElementById('canvas-container');
  const menuScreen = document.getElementById('menu-screen');
  const btnPlayStage1 = document.getElementById('btn-play-stage-1');
  const btnRestartStage1 = document.getElementById('btn-restart-stage-1');
  const stage1Badge = document.getElementById('stage-1-badge');
  const stage1Meta = document.getElementById('stage-1-meta');
  const menuBtnSettings = document.getElementById('menu-btn-settings');

  const crosshair = document.getElementById('crosshair');
  const targetHint = document.getElementById('target-hint');
  const targetHintText = document.getElementById('target-hint-text');
  const darknessVignette = document.getElementById('darkness-vignette');
  const hudCompass = document.getElementById('hud-compass');
  const messageText = document.getElementById('message-text');
  const messageBar = document.getElementById('message-bar');

  const itemGetToast = document.getElementById('item-get-toast');
  const toastItemIcon = document.getElementById('toast-item-icon');
  const toastItemName = document.getElementById('toast-item-name');

  const hudEl = document.getElementById('hud');
  const messageBarContainer = document.getElementById('message-bar-container');
  const inventoryBarContainer = document.getElementById('inventory-bar-container');
  const topMenuEl = document.getElementById('top-menu');
  const btnGameSettings = document.getElementById('btn-game-settings');

  let isGameStarted = false;

  // モーダル群
  const inspectModal = document.getElementById('inspect-modal');
  const modalCategory = document.getElementById('modal-category');
  const modalTitle = document.getElementById('modal-title');
  const modalBody = document.getElementById('modal-body');
  const modalCloseBtn = document.getElementById('modal-close-btn');

  const itemDetailModal = document.getElementById('item-detail-modal');
  const itemDetailName = document.getElementById('item-detail-name');
  const itemDetailIconLarge = document.getElementById('item-detail-icon-large');
  const itemDetailDesc = document.getElementById('item-detail-desc');
  const itemDetailActionContainer = document.getElementById('item-detail-action-container');
  const btnItemAction = document.getElementById('btn-item-action');
  const itemDetailCloseBtn = document.getElementById('item-detail-close-btn');

  const settingsModal = document.getElementById('settings-modal');
  const settingsModalClose = document.getElementById('settings-modal-close');
  const btnSettingsClose = document.getElementById('btn-settings-close');
  const btnSoundOn = document.getElementById('btn-sound-on');
  const btnSoundOff = document.getElementById('btn-sound-off');
  const sliderLookSensitivity = document.getElementById('slider-look-sensitivity');
  const sensitivityValueDisplay = document.getElementById('sensitivity-value-display');
  const btnSettingToMenu = document.getElementById('btn-setting-to-menu');
  const btnSettingRestart = document.getElementById('btn-setting-restart');
  const blockMenuReturn = document.getElementById('block-menu-return');
  const blockRestartStage = document.getElementById('block-restart-stage');

  const clearModal = document.getElementById('clear-modal');
  const clearTimeEl = document.getElementById('clear-time');
  const btnReplay = document.getElementById('btn-replay');
  const btnClearToMenu = document.getElementById('btn-clear-to-menu');

  const invSlots = document.querySelectorAll('.inv-slot');

  let activeModal = null;
  let detailedItemId = null;

  // --- 3D 空間定義定数 ---
  const ROOM = {
    width: 10,
    depth: 10,
    height: 4.0,
    wallBoundary: 4.35,
  };

  const PLAYER = {
    eyeHeight: 1.65,
    moveSpeed: 4.5,
    damping: 10.0,
    radius: 0.45,
    interactDistance: 4.0,
  };

  // --- Three.js セットアップ ---
  const scene = new THREE.Scene();
  // 落ち着いた暖色系の背景とフォグ（空気遠近感）
  scene.background = new THREE.Color(0x140e09);
  scene.fog = new THREE.FogExp2(0x140e09, 0.038);

  const camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set(0, PLAYER.eyeHeight, 1.8);

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // シャドウマップの有効化（PCFSoftShadowMap）
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  // シネマティックなトーンマッピング設定
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.08;
  renderer.outputEncoding = THREE.sRGBEncoding;
  container.appendChild(renderer.domElement);

  const controls = new THREE.PointerLockControls(camera, document.body);

  // 移動管理
  const moveState = { forward: false, backward: false, left: false, right: false };
  const velocity = new THREE.Vector3();
  const direction = new THREE.Vector3();

  // 衝突・Raycaster管理
  const interactables = [];
  const obstacleBoxes = [];
  let hoveredObject = null;

  // 動的ライト・オブジェクト参照
  let doorPivotGroup = null;
  let exitHallGroup = null;     // 脱出の光の回廊グループ
  let exitSunLight = null;      // 出口からの逆光ライト
  let bookshelfMeshGroup = null;
  let carpetCornerMesh = null;
  let ceilingPointLight = null; // 主光源（中央天井）
  let ambientLight = null;      // 環境光
  let fireplaceLight = null;    // 暖炉の揺らめく補助光
  let deskSpotLight = null;     // 書斎机のスポットライト
  let deskShadeLight = null;    // ランプシェード内部の補助点光源
  let ceilingBulbMesh = null;   // 天井電球
  let deskBulbMesh = null;      // デスク電球
  let deskShadeMesh = null;     // デスクランプの緑シェード
  let deskLightPoolMesh = null; // ランプ周囲の天板ライトプール（光の輪）

  // カメラズーム演出用ステート（机・手帳の調査時 0.6秒補間）
  const cameraZoom = {
    active: false,
    isZoomedIn: false,
    mode: 'in', // 'in' | 'out'
    startTime: 0,
    duration: 600,
    fromPos: new THREE.Vector3(),
    toPos: new THREE.Vector3(),
    fromQuat: new THREE.Quaternion(),
    toQuat: new THREE.Quaternion(),
    savedPos: new THREE.Vector3(),
    savedQuat: new THREE.Quaternion(),
    onComplete: null
  };

  // オブジェクトクリック・インタラクション状態フラグ（クリック中・ズーム演出中のEsc誤動作防止用）
  let isMouseDown = false;
  let isObjectInteracting = false;
  let clockPendulumGroup = null;    // 時計の振り子
  let clockHourHandPivot = null;    // 壁掛け時計の短針ピボット（3D連動用）
  let clockMinuteHandPivot = null;  // 壁掛け時計の長針ピボット（3D連動用）
  let clockFaceMesh = null;         // 壁掛け時計の文字盤メッシュ（暗闇蓄光用）
  let paintingCanvasMesh = null;    // 南の絵画メッシュ（暗闇蓄光用）
  const constellationBookBands = []; // 本棚の仕掛け本背表紙バンド（暗闇蓄光用）

  // 3D空間の壁掛け古時計の針を現在の時刻(state.clockHour, state.clockMinute)に同期
  function updateClockHands3D() {
    if (!clockHourHandPivot || !clockMinuteHandPivot) return;
    // 短針角度：(時 % 12) * 30度 + (分 / 60) * 30度（0時0分で真上・時計回りに回転）
    const hourAngleDeg = (state.clockHour % 12) * 30 + (state.clockMinute / 60) * 30;
    // 長針角度：分 * 6度（0分で真上・時計回りに回転）
    const minuteAngleDeg = (state.clockMinute % 60) * 6;
    clockHourHandPivot.rotation.z = -THREE.MathUtils.degToRad(hourAngleDeg);
    clockMinuteHandPivot.rotation.z = -THREE.MathUtils.degToRad(minuteAngleDeg);
  }

  // --- プロシージャルテクスチャ生成 ---

  // 1. ダークウッド床・家具テクスチャ
  function createWoodTexture(baseColor, grainColor, planks = 8) {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = baseColor;
    ctx.fillRect(0, 0, 512, 512);

    // 微細な木目スジ
    ctx.strokeStyle = grainColor;
    ctx.lineWidth = 1.8;
    for (let i = 0; i < 200; i++) {
      const y = Math.random() * 512;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.bezierCurveTo(
        170, y + (Math.random() - 0.5) * 14,
        340, y + (Math.random() - 0.5) * 14,
        512, y + (Math.random() - 0.5) * 8
      );
      ctx.stroke();
    }

    // 板の継ぎ目とアクセントシャドウ
    if (planks > 0) {
      const step = 512 / planks;
      for (let i = 1; i < planks; i++) {
        const y = i * step;
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.48)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(512, y);
        ctx.stroke();

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, y + 2);
        ctx.lineTo(512, y + 2);
        ctx.stroke();
      }
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    return tex;
  }

  // 2. くすんだレンガ・漆喰調ウォールテクスチャ（ダークブラウン／チャコール）
  function createWallTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    // 下地：ダークアンティークトーン
    ctx.fillStyle = '#27201a';
    ctx.fillRect(0, 0, 512, 512);

    // 石材・レンガの微細ブロック陰影
    const blockH = 32;
    const blockW = 64;
    for (let y = 0; y < 512; y += blockH) {
      const row = Math.floor(y / blockH);
      const offsetX = (row % 2 === 0) ? 0 : blockW / 2;
      for (let x = -blockW; x < 512 + blockW; x += blockW) {
        const actualX = x + offsetX;
        const shade = Math.floor(32 + Math.random() * 16);
        ctx.fillStyle = `rgb(${shade + 10}, ${shade + 2}, ${shade - 4})`;
        ctx.fillRect(actualX + 1, y + 1, blockW - 2, blockH - 2);

        // 目地（モルタル）
        ctx.strokeStyle = 'rgba(12, 9, 7, 0.65)';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(actualX, y, blockW, blockH);
      }
    }

    // 漆喰の擦れ・ノイズ
    for (let i = 0; i < 4000; i++) {
      const px = Math.random() * 512;
      const py = Math.random() * 512;
      const alpha = Math.random() * 0.06;
      ctx.fillStyle = i % 2 === 0 ? `rgba(255, 220, 180, ${alpha})` : `rgba(0, 0, 0, ${alpha * 1.6})`;
      ctx.fillRect(px, py, 2.5, 2.5);
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    return tex;
  }

  // 3. ペルシャ風絨毯テクスチャ
  function createPersianRugTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#541518';
    ctx.fillRect(0, 0, 512, 512);

    // 縁飾り
    ctx.strokeStyle = '#caa86a';
    ctx.lineWidth = 16;
    ctx.strokeRect(16, 16, 480, 480);

    ctx.strokeStyle = '#1b222c';
    ctx.lineWidth = 8;
    ctx.strokeRect(36, 36, 440, 440);

    // メダリオン
    ctx.fillStyle = '#caa86a';
    ctx.beginPath();
    ctx.moveTo(256, 90);
    ctx.lineTo(390, 256);
    ctx.lineTo(256, 422);
    ctx.lineTo(122, 256);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#1e2430';
    ctx.beginPath();
    ctx.arc(256, 256, 64, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#e8c988';
    ctx.beginPath();
    ctx.arc(256, 256, 26, 0, Math.PI * 2);
    ctx.fill();

    return new THREE.CanvasTexture(canvas);
  }

  // 4. 油絵『星辰の夜』テクスチャ（通常・暗闇蓄光）
  function createPaintingTexture(isLightOn) {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 384;
    const ctx = canvas.getContext('2d');

    const skyGrad = ctx.createLinearGradient(0, 0, 0, 384);
    if (isLightOn) {
      skyGrad.addColorStop(0, '#0c1626');
      skyGrad.addColorStop(1, '#182740');
    } else {
      skyGrad.addColorStop(0, '#040810');
      skyGrad.addColorStop(1, '#080e1a');
    }
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, 512, 384);

    ctx.fillStyle = '#161e2a';
    ctx.beginPath();
    ctx.moveTo(0, 384);
    ctx.lineTo(120, 240);
    ctx.lineTo(240, 300);
    ctx.lineTo(400, 200);
    ctx.lineTo(512, 260);
    ctx.lineTo(512, 384);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = isLightOn ? '#f9e79f' : '#576274';
    ctx.beginPath();
    ctx.arc(380, 130, 56, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#06080b';
    ctx.beginPath();
    ctx.moveTo(350, 384);
    ctx.lineTo(350, 210);
    ctx.lineTo(380, 80);
    ctx.lineTo(410, 210);
    ctx.lineTo(410, 384);
    ctx.closePath();
    ctx.fill();

    if (!isLightOn) {
      ctx.shadowColor = '#5dade2';
      ctx.shadowBlur = 15;
      ctx.strokeStyle = '#5dade2';
      ctx.lineWidth = 4;
      ctx.setLineDash([8, 8]);

      const stars = [
        { x: 90, y: 170, name: '白羊' },
        { x: 180, y: 110, name: '獅子' },
        { x: 270, y: 150, name: '天蠍' },
        { x: 440, y: 90, name: '射手' }
      ];

      ctx.beginPath();
      ctx.moveTo(stars[0].x, stars[0].y);
      for (let i = 1; i < stars.length; i++) {
        ctx.lineTo(stars[i].x, stars[i].y);
      }
      ctx.stroke();
      ctx.setLineDash([]);

      stars.forEach((st) => {
        ctx.fillStyle = '#eaf2f8';
        ctx.beginPath();
        ctx.arc(st.x, st.y, 8, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#aed6f1';
        ctx.font = 'bold 18px "Shippori Mincho", serif';
        ctx.fillText(st.name, st.x - 18, st.y - 14);
      });
      ctx.shadowBlur = 0;
    }

    return new THREE.CanvasTexture(canvas);
  }

  // 4b. 油絵『星辰の夜』の暗闇自発光（emissiveMap）専用テクスチャ
  function createPaintingEmissiveTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 384;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, 512, 384);

    ctx.shadowColor = '#5dade2';
    ctx.shadowBlur = 18;
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 4.5;
    ctx.setLineDash([8, 8]);

    const stars = [
      { x: 90, y: 170, name: '白羊' },
      { x: 180, y: 110, name: '獅子' },
      { x: 270, y: 150, name: '天蠍' },
      { x: 440, y: 90, name: '射手' }
    ];

    ctx.beginPath();
    ctx.moveTo(stars[0].x, stars[0].y);
    for (let i = 1; i < stars.length; i++) {
      ctx.lineTo(stars[i].x, stars[i].y);
    }
    ctx.stroke();
    ctx.setLineDash([]);

    stars.forEach((st) => {
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(st.x, st.y, 8.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#d6eaf8';
      ctx.font = 'bold 18px "Shippori Mincho", serif';
      ctx.fillText(st.name, st.x - 18, st.y - 14);
    });
    ctx.shadowBlur = 0;

    return new THREE.CanvasTexture(canvas);
  }

  // 5. 古時計の文字盤テクスチャ（通常時：アイボリー ／ 消灯時：淡いシアン #5dade2 蓄光）
  function createClockDialTexture(isLightOn = true) {
    const dialCanvas = document.createElement('canvas');
    dialCanvas.width = 256;
    dialCanvas.height = 256;
    const dctx = dialCanvas.getContext('2d');

    if (isLightOn) {
      dctx.fillStyle = '#f8f2e6';
      dctx.beginPath();
      dctx.arc(128, 128, 126, 0, Math.PI * 2);
      dctx.fill();

      dctx.strokeStyle = '#2b1d12';
      dctx.lineWidth = 4;
      dctx.beginPath();
      dctx.arc(128, 128, 114, 0, Math.PI * 2);
      dctx.stroke();

      for (let i = 0; i < 12; i++) {
        const ang = (i * Math.PI) / 6;
        const x1 = 128 + Math.sin(ang) * 94;
        const y1 = 128 - Math.cos(ang) * 94;
        const x2 = 128 + Math.sin(ang) * 110;
        const y2 = 128 - Math.cos(ang) * 110;
        dctx.lineWidth = i % 3 === 0 ? 5 : 2.5;
        dctx.beginPath();
        dctx.moveTo(x1, y1);
        dctx.lineTo(x2, y2);
        dctx.stroke();
      }
    } else {
      // 暗闇蓄光モード：文字盤全体と目盛りが淡いシアン (#5dade2) で自発光
      dctx.fillStyle = '#102436';
      dctx.beginPath();
      dctx.arc(128, 128, 126, 0, Math.PI * 2);
      dctx.fill();

      dctx.shadowColor = '#5dade2';
      dctx.shadowBlur = 12;
      dctx.strokeStyle = '#5dade2';
      dctx.lineWidth = 4.5;
      dctx.beginPath();
      dctx.arc(128, 128, 114, 0, Math.PI * 2);
      dctx.stroke();

      dctx.lineWidth = 2;
      dctx.beginPath();
      dctx.arc(128, 128, 86, 0, Math.PI * 2);
      dctx.stroke();

      for (let i = 0; i < 12; i++) {
        const ang = (i * Math.PI) / 6;
        const x1 = 128 + Math.sin(ang) * 92;
        const y1 = 128 - Math.cos(ang) * 92;
        const x2 = 128 + Math.sin(ang) * 110;
        const y2 = 128 - Math.cos(ang) * 110;
        dctx.lineWidth = i % 3 === 0 ? 5.5 : 3;
        dctx.beginPath();
        dctx.moveTo(x1, y1);
        dctx.lineTo(x2, y2);
        dctx.stroke();
      }
      dctx.shadowBlur = 0;
    }

    return new THREE.CanvasTexture(dialCanvas);
  }

  // --- ライティング構築（主光源＋補助光源＋影） ---
  function setupLighting() {
    // 1. 環境光（AmbientLight）：やや暗めの暖色（#2c1d11, 強度0.52）
    ambientLight = new THREE.AmbientLight(0x2c1d11, 0.52);
    scene.add(ambientLight);

    // 2. 主光源：中央天井のPointLight（オレンジ暖色 #ffaa44, 強度1.45, 影有効）
    ceilingPointLight = new THREE.PointLight(0xffaa44, 1.45, 18, 1.6);
    ceilingPointLight.position.set(0, ROOM.height - 0.35, 0);
    ceilingPointLight.castShadow = true;
    ceilingPointLight.shadow.mapSize.width = 1024;
    ceilingPointLight.shadow.mapSize.height = 1024;
    ceilingPointLight.shadow.bias = -0.0012;
    scene.add(ceilingPointLight);

    // 天井照明器具
    const fixtureGroup = new THREE.Group();
    const baseMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(0.35, 0.45, 0.12, 24),
      new THREE.MeshStandardMaterial({ color: 0x221810, roughness: 0.5, metalness: 0.75 })
    );
    baseMesh.position.y = ROOM.height - 0.06;
    fixtureGroup.add(baseMesh);

    // 電球（光と影に反応するMeshStandardMaterial + emissive）
    ceilingBulbMesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.18, 16, 16),
      new THREE.MeshStandardMaterial({
        color: 0x332211,
        emissive: 0xffaa44,
        emissiveIntensity: 1.25,
        roughness: 0.2
      })
    );
    ceilingBulbMesh.position.y = ROOM.height - 0.2;
    fixtureGroup.add(ceilingBulbMesh);
    scene.add(fixtureGroup);

    // 3. 補助光源 A：暖炉（South）の赤橙色 PointLight（炎の揺らめき、柔らかな環境光としてcastShadowはオフにし壁への不自然な巨大影を防止）
    fireplaceLight = new THREE.PointLight(0xff5518, 0.95, 6.0, 2.0);
    fireplaceLight.position.set(-2.5, 0.48, 4.15);
    fireplaceLight.castShadow = false;
    scene.add(fireplaceLight);

    // 4. 補助照明 B：書斎机（East）のランプ・下部へ柔らかく光を落とす暖色スポットライト
    // 光源を傘の内部・電球下端（Y=1.16）に配置し、傘の上側を照らさず机上のみを下向きに照らす
    deskSpotLight = new THREE.SpotLight(0xffebd2, 1.35, 3.2, Math.PI / 3.0, 0.75, 1.4);
    deskSpotLight.position.set(3.94, 1.16, -1.48);
    deskSpotLight.target.position.set(3.94, 0.86, -1.48);
    deskSpotLight.castShadow = false;
    scene.add(deskSpotLight);
    scene.add(deskSpotLight.target);

    // ランプ直下・手帳周りの微弱な手元アンビエント光（傘の外側へ光を漏らさないよう極小強度・短距離に設定）
    deskShadeLight = new THREE.PointLight(0xffdfa8, 0.20, 1.2, 2.0);
    deskShadeLight.position.set(3.94, 1.12, -1.48);
    scene.add(deskShadeLight);
  }

  function updateLightingState() {
    if (state.isLightOn) {
      ceilingPointLight.intensity = 1.45;
      ambientLight.color.setHex(0x2c1d11);
      ambientLight.intensity = 0.52;
      deskSpotLight.intensity = 1.35;
      if (deskShadeLight) deskShadeLight.intensity = 0.20;
      if (deskLightPoolMesh) deskLightPoolMesh.visible = true;
      fireplaceLight.intensity = 0.95;

      if (ceilingBulbMesh) ceilingBulbMesh.material.emissiveIntensity = 1.25;
      if (deskBulbMesh) deskBulbMesh.material.emissiveIntensity = 0.8;
      if (deskShadeMesh) deskShadeMesh.material.emissiveIntensity = 0.0;

      darknessVignette.classList.add('hidden');
      scene.background.setHex(0x140e09);
      scene.fog.color.setHex(0x140e09);
    } else {
      // 暗闇モード：主光源を消灯し、部屋全体を深い群青（#060b16 / #132442）の静寂な暗闇に包む
      ceilingPointLight.intensity = 0.0;
      ambientLight.color.setHex(0x132442);
      ambientLight.intensity = 0.32;
      deskSpotLight.intensity = 0.0;
      if (deskShadeLight) deskShadeLight.intensity = 0.0;
      if (deskLightPoolMesh) deskLightPoolMesh.visible = false;
      fireplaceLight.intensity = 0.14; // 暖炉の微かな残り火

      if (ceilingBulbMesh) ceilingBulbMesh.material.emissiveIntensity = 0.0;
      if (deskBulbMesh) deskBulbMesh.material.emissiveIntensity = 0.0;
      if (deskShadeMesh) deskShadeMesh.material.emissiveIntensity = 0.0;

      darknessVignette.classList.remove('hidden');
      scene.background.setHex(0x060b16);
      scene.fog.color.setHex(0x060b16);
    }

    // 壁の絵画『星辰の夜』：消灯時に星座ラインが淡いシアン（#5dade2）で蓄光自発光
    if (paintingCanvasMesh) {
      paintingCanvasMesh.material.map = createPaintingTexture(state.isLightOn);
      if (!state.isLightOn) {
        paintingCanvasMesh.material.emissive = new THREE.Color(0x5dade2);
        paintingCanvasMesh.material.emissiveMap = createPaintingEmissiveTexture();
        paintingCanvasMesh.material.emissiveIntensity = 1.35;
      } else {
        paintingCanvasMesh.material.emissive = new THREE.Color(0x000000);
        paintingCanvasMesh.material.emissiveMap = null;
        paintingCanvasMesh.material.emissiveIntensity = 0.0;
      }
      paintingCanvasMesh.material.needsUpdate = true;
    }

    // 壁掛けの古時計の文字盤：消灯時に淡いシアン（#5dade2）で蓄光自発光
    if (clockFaceMesh) {
      clockFaceMesh.material.map = createClockDialTexture(state.isLightOn);
      if (!state.isLightOn) {
        clockFaceMesh.material.emissive = new THREE.Color(0x5dade2);
        clockFaceMesh.material.emissiveIntensity = 0.72;
      } else {
        clockFaceMesh.material.emissive = new THREE.Color(0x000000);
        clockFaceMesh.material.emissiveIntensity = 0.0;
      }
      clockFaceMesh.material.needsUpdate = true;
    }

    // 本棚最上段の仕掛け星座本：消灯時に背表紙バンドが淡いシアン（#5dade2）で微かに蓄光発光
    constellationBookBands.forEach((bandMat) => {
      if (!state.isLightOn) {
        bandMat.emissive = new THREE.Color(0x5dade2);
        bandMat.emissiveIntensity = 0.65;
      } else {
        bandMat.emissive = new THREE.Color(0x000000);
        bandMat.emissiveIntensity = 0.0;
      }
    });
  }

  // --- 密室空間（壁・床・天井・化粧梁）構築 ---
  function buildRoom() {
    const floorTex = createWoodTexture('#2d1a0e', '#190d07', 8);
    floorTex.repeat.set(4, 4);

    const wallTex = createWallTexture();
    wallTex.repeat.set(3, 1.5);

    // 床：暗い木目調（ダークウッド）、わずかに光を反射する質感（roughness: 0.7, metalness: 0.08）
    const floorMat = new THREE.MeshStandardMaterial({
      map: floorTex,
      roughness: 0.7,
      metalness: 0.08,
    });

    // 天井：重厚なダークトーン
    const ceilingMat = new THREE.MeshStandardMaterial({
      color: 0x1c1612,
      roughness: 0.9,
      metalness: 0.02,
    });

    // 壁：くすんだレンガ・漆喰調のテクスチャ感（roughness: 0.88, metalness: 0.04）
    const wallMat = new THREE.MeshStandardMaterial({
      map: wallTex,
      roughness: 0.88,
      metalness: 0.04,
    });

    // 床メッシュ
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(ROOM.width, ROOM.depth), floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    // 天井メッシュ
    const ceiling = new THREE.Mesh(new THREE.PlaneGeometry(ROOM.width, ROOM.depth), ceilingMat);
    ceiling.rotation.x = Math.PI / 2;
    ceiling.position.y = ROOM.height;
    ceiling.receiveShadow = true;
    scene.add(ceiling);

    // 四方の壁
    const thick = 0.2;
    const nsGeo = new THREE.BoxGeometry(ROOM.width + thick * 2, ROOM.height, thick);
    const ewGeo = new THREE.BoxGeometry(thick, ROOM.height, ROOM.depth);

    // 北壁（大扉用の開口部 x: [-0.70, 0.70], y: [0, 2.54] を設けた3分割壁構造）
    const northZ = -ROOM.depth / 2 - thick / 2; // -5.1m (壁内面は -5.0m)
    const doorHalfWidth = 0.70;
    const doorOpeningHeight = 2.54;
    const sideWallWidth = (ROOM.width + thick * 2 - doorHalfWidth * 2) / 2; // 4.50m

    // 北壁・左側 (x: -5.2 ~ -0.70)
    const northLeft = new THREE.Mesh(
      new THREE.BoxGeometry(sideWallWidth, ROOM.height, thick),
      wallMat
    );
    northLeft.position.set(-doorHalfWidth - sideWallWidth / 2, ROOM.height / 2, northZ);
    northLeft.receiveShadow = true;
    scene.add(northLeft);

    // 北壁・右側 (x: 0.70 ~ 5.2)
    const northRight = new THREE.Mesh(
      new THREE.BoxGeometry(sideWallWidth, ROOM.height, thick),
      wallMat
    );
    northRight.position.set(doorHalfWidth + sideWallWidth / 2, ROOM.height / 2, northZ);
    northRight.receiveShadow = true;
    scene.add(northRight);

    // 北壁・ドア上部壁 (x: -0.70 ~ 0.70, y: 2.54 ~ 4.0)
    const topWallHeight = ROOM.height - doorOpeningHeight; // 1.46m
    const northTop = new THREE.Mesh(
      new THREE.BoxGeometry(doorHalfWidth * 2, topWallHeight, thick),
      wallMat
    );
    northTop.position.set(0, doorOpeningHeight + topWallHeight / 2, northZ);
    northTop.receiveShadow = true;
    scene.add(northTop);

    // --- 扉の向こう側：脱出の光の回廊 & 外の世界（通常時は非表示にして光漏れを完全防止、扉開放時に劇的フェードイン） ---
    exitHallGroup = new THREE.Group();
    exitHallGroup.position.set(0, 0, -5.0);
    exitHallGroup.visible = false; // 扉が閉まっている間は非表示にして部屋への光漏れをゼロに

    // 外の回廊の石畳フロア
    const exitFloorMat = new THREE.MeshStandardMaterial({
      color: 0x42382e,
      roughness: 0.55,
      metalness: 0.08
    });
    const exitFloor = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 6.0), exitFloorMat);
    exitFloor.rotation.x = -Math.PI / 2;
    exitFloor.position.set(0, 0.005, -3.0);
    exitFloor.receiveShadow = true;
    exitHallGroup.add(exitFloor);

    // 外の回廊の側壁
    const exitWallMat = new THREE.MeshStandardMaterial({
      color: 0x2e241c,
      roughness: 0.75,
      metalness: 0.05
    });
    const exitWallL = new THREE.Mesh(new THREE.BoxGeometry(0.2, 3.4, 6.0), exitWallMat);
    exitWallL.position.set(-1.15, 1.7, -3.0);
    exitHallGroup.add(exitWallL);

    const exitWallR = new THREE.Mesh(new THREE.BoxGeometry(0.2, 3.4, 6.0), exitWallMat);
    exitWallR.position.set(1.15, 1.7, -3.0);
    exitHallGroup.add(exitWallR);

    // 回廊の天井
    const exitCeil = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.2, 6.0), exitWallMat);
    exitCeil.position.set(0, 3.3, -3.0);
    exitHallGroup.add(exitCeil);

    // 突き当たりの外の世界・眩い光のゲート面
    const lightGateMat = new THREE.MeshBasicMaterial({
      color: 0xfffaea
    });
    const lightGate = new THREE.Mesh(new THREE.PlaneGeometry(2.3, 3.2), lightGateMat);
    lightGate.position.set(0, 1.6, -5.95);
    exitHallGroup.add(lightGate);

    // 扉の奥から部屋へ差し込む神々しい逆光ライト（初期強度 0、扉開放時にフェードイン）
    exitSunLight = new THREE.PointLight(0xfff3d6, 0.0, 16, 1.1);
    exitSunLight.position.set(0, 2.2, -4.0);
    exitHallGroup.add(exitSunLight);

    // 光のハロー（光彩ビルボード）
    const glowMat = new THREE.MeshBasicMaterial({
      color: 0xffe6a3,
      transparent: true,
      opacity: 0.55
    });
    const glowMesh = new THREE.Mesh(new THREE.PlaneGeometry(2.8, 3.6), glowMat);
    glowMesh.position.set(0, 1.6, -5.8);
    exitHallGroup.add(glowMesh);

    scene.add(exitHallGroup);

    // 南壁
    const south = new THREE.Mesh(nsGeo, wallMat);
    south.position.set(0, ROOM.height / 2, ROOM.depth / 2 + thick / 2);
    south.receiveShadow = true;
    scene.add(south);

    // 東壁
    const east = new THREE.Mesh(ewGeo, wallMat);
    east.position.set(ROOM.width / 2 + thick / 2, ROOM.height / 2, 0);
    east.receiveShadow = true;
    scene.add(east);

    // 西壁
    const west = new THREE.Mesh(ewGeo, wallMat);
    west.position.set(-ROOM.width / 2 - thick / 2, ROOM.height / 2, 0);
    west.receiveShadow = true;
    scene.add(west);

    // 天井のダークウッド化粧梁（ビーム）による重厚な洋館建築の演出
    const beamMat = new THREE.MeshStandardMaterial({ color: 0x22140b, roughness: 0.65, metalness: 0.05 });
    const beamGeoX = new THREE.BoxGeometry(ROOM.width, 0.22, 0.28);
    const beamGeoZ = new THREE.BoxGeometry(0.28, 0.22, ROOM.depth);

    [-2.5, 0, 2.5].forEach((zPos) => {
      const beam = new THREE.Mesh(beamGeoX, beamMat);
      beam.position.set(0, ROOM.height - 0.11, zPos);
      beam.castShadow = true;
      beam.receiveShadow = true;
      scene.add(beam);
    });

    [-2.5, 2.5].forEach((xPos) => {
      const beam = new THREE.Mesh(beamGeoZ, beamMat);
      beam.position.set(xPos, ROOM.height - 0.11, 0);
      beam.castShadow = true;
      beam.receiveShadow = true;
      scene.add(beam);
    });

    // 巾木（ベースボード）
    const bbMat = new THREE.MeshStandardMaterial({ color: 0x1e120a, roughness: 0.6 });
    const bbHeight = 0.14;
    const bbDepth = 0.05;
    const bbNS = new THREE.BoxGeometry(ROOM.width, bbHeight, bbDepth);
    const bbEW = new THREE.BoxGeometry(bbDepth, bbHeight, ROOM.depth);

    // 北壁の巾木（大扉の台座 plinth: x = ±0.88 の外側でピッタリ止めて干渉・貫通を完全解消）
    const doorPlinthOuterX = 0.88;
    const bbNorthWidth = (ROOM.width / 2) - doorPlinthOuterX; // 5.0 - 0.88 = 4.12m
    const bbNLeft = new THREE.Mesh(
      new THREE.BoxGeometry(bbNorthWidth, bbHeight, bbDepth),
      bbMat
    );
    bbNLeft.position.set(-doorPlinthOuterX - bbNorthWidth / 2, bbHeight / 2, -ROOM.depth / 2 + bbDepth / 2);
    scene.add(bbNLeft);

    const bbNRight = new THREE.Mesh(
      new THREE.BoxGeometry(bbNorthWidth, bbHeight, bbDepth),
      bbMat
    );
    bbNRight.position.set(doorPlinthOuterX + bbNorthWidth / 2, bbHeight / 2, -ROOM.depth / 2 + bbDepth / 2);
    scene.add(bbNRight);

    const bbS = new THREE.Mesh(bbNS, bbMat);
    bbS.position.set(0, bbHeight / 2, ROOM.depth / 2 - bbDepth / 2);
    scene.add(bbS);

    const bbE = new THREE.Mesh(bbEW, bbMat);
    bbE.position.set(ROOM.width / 2 - bbDepth / 2, bbHeight / 2, 0);
    scene.add(bbE);

    const bbW = new THREE.Mesh(bbEW, bbMat);
    bbW.position.set(-ROOM.width / 2 + bbDepth / 2, bbHeight / 2, 0);
    scene.add(bbW);
  }

  function registerInteractive(group, metadata, collision = null) {
    group.userData = { isInteractiveRoot: true, ...metadata };
    group.traverse((c) => {
      if (c.isMesh) {
        if (c.userData && c.userData.isHitBox) {
          c.castShadow = false;
          c.receiveShadow = false;
        } else if (c.userData && c.userData.noCastShadow) {
          c.castShadow = false;
          c.receiveShadow = true;
        } else {
          c.castShadow = true;
          c.receiveShadow = true;
        }
        c.userData.interactiveRoot = group;
        interactables.push(c);
      }
    });
    if (collision) {
      obstacleBoxes.push(collision);
    }
    scene.add(group);
  }

  // --- 東西南北のオブジェクト構築（マテリアルブラッシュアップ） ---
  function buildAllObjects() {
    const darkWoodTex = createWoodTexture('#382012', '#201007', 4);
    const oakWoodTex = createWoodTexture('#4a2e1a', '#28170c', 6);

    // 真鍮ゴールドマテリアル（metalness: 0.82, roughness: 0.28 のリッチな金属光沢）
    const brassMat = new THREE.MeshStandardMaterial({
      color: 0xd4af37,
      roughness: 0.28,
      metalness: 0.82,
    });

    // アンティーク木材マテリアル（roughness: 0.65, metalness: 0.05）
    const darkWoodMat = new THREE.MeshStandardMaterial({
      map: darkWoodTex,
      roughness: 0.65,
      metalness: 0.05,
    });

    const oakWoodMat = new THREE.MeshStandardMaterial({
      map: oakWoodTex,
      roughness: 0.68,
      metalness: 0.05,
    });

    // Raycaster判定を補助する不可視バウンディングボックス生成ヘルパー
    function attachInvisibleCollider(targetGroup, w, h, d, cx, cy, cz) {
      const hitMesh = new THREE.Mesh(
        new THREE.BoxGeometry(w, h, d),
        new THREE.MeshBasicMaterial({
          transparent: true,
          opacity: 0.0,
          depthWrite: false
        })
      );
      hitMesh.position.set(cx, cy, cz);
      hitMesh.userData.isHitBox = true;
      targetGroup.add(hitMesh);
    }

    // ドアノブ・時計等用の高光沢真鍮マテリアル（metalness: 0.85）
    const polishedBrassMat = new THREE.MeshStandardMaterial({
      color: 0xd4af37,
      metalness: 0.85,
      roughness: 0.25
    });

    // ==========================================
    // 【1. 北の壁 (North)】
    // ==========================================

    // A. 脱出の大扉（壁面 z = -5.0 に完全密着・隙間ゼロ・台座と枠の美しい接合）
    const doorSystemGroup = new THREE.Group();
    doorSystemGroup.position.set(0, 0, -4.98); // 壁内面 z = -5.0 に奥端を密着

    const frameMat = new THREE.MeshStandardMaterial({
      map: darkWoodTex,
      color: 0x24150c,
      roughness: 0.62,
      metalness: 0.06
    });
    const recessedPanelMat = new THREE.MeshStandardMaterial({
      map: darkWoodTex,
      color: 0x1b0f08,
      roughness: 0.72,
      metalness: 0.04
    });

    // 外枠の立体木枠トリム（左右の柱ピラスター＋台座＋上部2段ペディメント冠）
    // 柱: x = ±0.78, 幅 0.16 (内側 x = ±0.70 で開口部と完全一致), 高さ 2.54, 奥行き 0.20
    const leftJamb = new THREE.Mesh(new THREE.BoxGeometry(0.16, 2.54, 0.20), frameMat);
    leftJamb.position.set(-0.78, 1.27, 0.08);
    doorSystemGroup.add(leftJamb);

    const rightJamb = new THREE.Mesh(new THREE.BoxGeometry(0.16, 2.54, 0.20), frameMat);
    rightJamb.position.set(0.78, 1.27, 0.08);
    doorSystemGroup.add(rightJamb);

    // 柱の足元台座: x = ±0.78, 幅 0.20 (x: ±0.68 ~ ±0.88), 高さ 0.28, 奥行き 0.24 (巾木と接合)
    [-0.78, 0.78].forEach((jx) => {
      const plinth = new THREE.Mesh(new THREE.BoxGeometry(0.20, 0.28, 0.24), recessedPanelMat);
      plinth.position.set(jx, 0.14, 0.10);
      doorSystemGroup.add(plinth);
    });

    // 上部下段梁枠: 幅 1.76 (x: -0.88 ~ 0.88), 高さ 0.10, 奥行き 0.22 (y: 2.54 ~ 2.64)
    const topHeaderLower = new THREE.Mesh(new THREE.BoxGeometry(1.76, 0.10, 0.22), frameMat);
    topHeaderLower.position.set(0, 2.59, 0.09);
    doorSystemGroup.add(topHeaderLower);

    // 上部上段冠ペディメント: 幅 1.86 (x: -0.93 ~ 0.93), 高さ 0.08, 奥行き 0.26 (y: 2.64 ~ 2.72)
    const topHeaderCrown = new THREE.Mesh(new THREE.BoxGeometry(1.86, 0.08, 0.26), recessedPanelMat);
    topHeaderCrown.position.set(0, 2.68, 0.11);
    doorSystemGroup.add(topHeaderCrown);

    // 扉本体（ヒンジ回転ピボット: x = -0.70）
    doorPivotGroup = new THREE.Group();
    doorPivotGroup.position.set(-0.70, 0, 0.04);

    const doorLeaf = new THREE.Mesh(new THREE.BoxGeometry(1.40, 2.54, 0.10), darkWoodMat);
    doorLeaf.position.set(0.70, 1.27, 0.01);
    doorPivotGroup.add(doorLeaf);

    // 扉表面の4面パネル掘り込み（凹面枠＋中央浮き彫りベベルパネル）
    const panelRows = [
      { cy: 1.88, h: 0.86 },
      { cy: 0.72, h: 0.92 }
    ];
    const panelCols = [0.40, 1.00];

    panelRows.forEach((row) => {
      panelCols.forEach((cx) => {
        // 掘り込み凹みベース
        const recess = new THREE.Mesh(
          new THREE.BoxGeometry(0.46, row.h, 0.025),
          recessedPanelMat
        );
        recess.position.set(cx, row.cy, 0.075);
        doorPivotGroup.add(recess);

        // 中央の浮き彫りレイズドパネル
        const raised = new THREE.Mesh(
          new THREE.BoxGeometry(0.36, row.h - 0.12, 0.022),
          darkWoodMat
        );
        raised.position.set(cx, row.cy, 0.09);
        doorPivotGroup.add(raised);
      });
    });

    // 真鍮の蝶番（ヒンジ）3箇所
    [0.45, 1.30, 2.15].forEach((hy) => {
      const hinge = new THREE.Mesh(
        new THREE.CylinderGeometry(0.018, 0.018, 0.12, 12),
        polishedBrassMat
      );
      hinge.position.set(0.02, hy, 0.09);
      doorPivotGroup.add(hinge);
    });

    // 電子錠プレート：黒い金属ボックス＋「● LOCKED」と赤く自発光（emissive: #e74c3c）するLEDインジケータ
    const lockPlateMat = new THREE.MeshStandardMaterial({
      color: 0x14181e,
      roughness: 0.32,
      metalness: 0.85
    });
    const lockTrim = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.48, 0.03), polishedBrassMat);
    lockTrim.position.set(0.7, 1.35, 0.088);
    doorPivotGroup.add(lockTrim);

    const lockPlate = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.44, 0.045), lockPlateMat);
    lockPlate.position.set(0.7, 1.35, 0.105);
    doorPivotGroup.add(lockPlate);

    // 「● LOCKED」赤色自発光インジケータテクスチャ生成
    const lockScreenCanvas = document.createElement('canvas');
    lockScreenCanvas.width = 256;
    lockScreenCanvas.height = 80;
    const lctx = lockScreenCanvas.getContext('2d');
    lctx.fillStyle = '#180404';
    lctx.fillRect(0, 0, 256, 80);
    lctx.strokeStyle = '#661414';
    lctx.lineWidth = 4;
    lctx.strokeRect(4, 4, 248, 72);
    lctx.fillStyle = '#e74c3c';
    lctx.font = 'bold 34px "Share Tech Mono", monospace';
    lctx.textAlign = 'center';
    lctx.textBaseline = 'middle';
    lctx.fillText('● LOCKED', 128, 42);
    const lockScreenTex = new THREE.CanvasTexture(lockScreenCanvas);

    const lockLedMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      map: lockScreenTex,
      emissive: 0xe74c3c,
      emissiveMap: lockScreenTex,
      emissiveIntensity: 1.35,
      roughness: 0.25
    });
    const lockLed = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.078, 0.012), lockLedMat);
    lockLed.position.set(0.7, 1.47, 0.13);
    doorPivotGroup.add(lockLed);

    // 丸型赤色LEDランプ球
    const redLedDot = new THREE.Mesh(
      new THREE.SphereGeometry(0.014, 14, 14),
      new THREE.MeshStandardMaterial({
        color: 0xff3322,
        emissive: 0xe74c3c,
        emissiveIntensity: 1.8,
        roughness: 0.2
      })
    );
    redLedDot.position.set(0.55, 1.47, 0.135);
    doorPivotGroup.add(redLedDot);

    // テンキーボタン群（3×4グリッド）
    const keyBtnMat = new THREE.MeshStandardMaterial({ color: 0x2c333d, roughness: 0.3, metalness: 0.7 });
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 3; c++) {
        const kBtn = new THREE.Mesh(new THREE.BoxGeometry(0.052, 0.036, 0.012), keyBtnMat);
        kBtn.position.set(0.63 + c * 0.07, 1.37 - r * 0.052, 0.13);
        doorPivotGroup.add(kBtn);
      }
    }

    // 真鍮の丸型ドアノブ（SphereGeometry / metalness: 0.85）＆台座ロゼット＆鍵穴
    const knobRosette = new THREE.Mesh(
      new THREE.CylinderGeometry(0.048, 0.054, 0.016, 24),
      polishedBrassMat
    );
    knobRosette.rotation.x = Math.PI / 2;
    knobRosette.position.set(1.26, 1.15, 0.088);
    doorPivotGroup.add(knobRosette);

    const knobSpindle = new THREE.Mesh(
      new THREE.CylinderGeometry(0.018, 0.018, 0.055, 16),
      polishedBrassMat
    );
    knobSpindle.rotation.x = Math.PI / 2;
    knobSpindle.position.set(1.26, 1.15, 0.115);
    doorPivotGroup.add(knobSpindle);

    const knobSphere = new THREE.Mesh(
      new THREE.SphereGeometry(0.052, 24, 24),
      polishedBrassMat
    );
    knobSphere.position.set(1.26, 1.15, 0.155);
    doorPivotGroup.add(knobSphere);

    // 鍵穴エスカッション
    const keyholePlate = new THREE.Mesh(
      new THREE.CylinderGeometry(0.026, 0.026, 0.014, 18),
      polishedBrassMat
    );
    keyholePlate.rotation.x = Math.PI / 2;
    keyholePlate.position.set(1.26, 1.02, 0.088);
    doorPivotGroup.add(keyholePlate);

    doorSystemGroup.add(doorPivotGroup);
    attachInvisibleCollider(doorSystemGroup, 1.85, 2.75, 0.35, 0, 1.37, 0.05);

    registerInteractive(
      doorSystemGroup,
      {
        id: 'door',
        name: '脱出の大扉',
        category: 'NORTH / EXIT DOOR',
        action: () => triggerZoomAndInspect(
          new THREE.Vector3(0, 1.45, -3.4),
          new THREE.Vector3(0, 1.42, -4.9),
          openDoorModal
        )
      },
      { minX: -0.9, maxX: 0.9, minZ: -5.0, maxZ: -4.5 }
    );

    // B. 照明スイッチ盤
    const switchGroup = new THREE.Group();
    switchGroup.position.set(-2.0, 1.5, -4.88);

    const panelBox = new THREE.Mesh(
      new THREE.BoxGeometry(0.42, 0.58, 0.08),
      new THREE.MeshStandardMaterial({ color: 0x22262e, roughness: 0.4, metalness: 0.75 })
    );
    switchGroup.add(panelBox);

    const coverMesh = new THREE.Mesh(
      new THREE.BoxGeometry(0.36, 0.5, 0.04),
      polishedBrassMat
    );
    coverMesh.position.z = 0.05;
    switchGroup.add(coverMesh);

    // 四隅の真鍮マイナスネジ装飾
    [[-0.14, 0.20], [0.14, 0.20], [-0.14, -0.20], [0.14, -0.20]].forEach(([sx, sy]) => {
      const screw = new THREE.Mesh(
        new THREE.CylinderGeometry(0.014, 0.014, 0.012, 12),
        new THREE.MeshStandardMaterial({ color: 0x8c7322, metalness: 0.9, roughness: 0.3 })
      );
      screw.rotation.x = Math.PI / 2;
      screw.position.set(sx, sy, 0.072);
      switchGroup.add(screw);
    });

    registerInteractive(switchGroup, {
      id: 'switch_panel',
      name: '照明スイッチ盤',
      category: 'NORTH / POWER PANEL',
      action: () => triggerZoomAndInspect(
        new THREE.Vector3(-2.0, 1.5, -3.8),
        new THREE.Vector3(-2.0, 1.5, -4.88),
        openSwitchModal
      )
    });

    // C. 壁掛けの古時計（木製縦長ケース・白い円形文字盤・真鍮の長針/短針・揺れる金属振り子）
    const clockGroup = new THREE.Group();
    clockGroup.position.set(2.2, 2.2, -4.88);

    // 木製縦長メインケース
    const clockCase = new THREE.Mesh(new THREE.BoxGeometry(0.66, 1.32, 0.16), darkWoodMat);
    clockGroup.add(clockCase);

    // 上部クラウン冠・アーチ型ペディメントと真鍮フィニアル
    const clockTopCornice = new THREE.Mesh(new THREE.BoxGeometry(0.78, 0.08, 0.22), frameMat);
    clockTopCornice.position.set(0, 0.68, 0.02);
    clockGroup.add(clockTopCornice);

    const clockArch = new THREE.Mesh(
      new THREE.CylinderGeometry(0.28, 0.28, 0.18, 24, 1, false, 0, Math.PI),
      darkWoodMat
    );
    clockArch.rotation.z = Math.PI / 2;
    clockArch.rotation.y = Math.PI / 2;
    clockArch.position.set(0, 0.70, 0.01);
    clockGroup.add(clockArch);

    // 頂部中央と左右の真鍮フィニアル球
    [[-0.32, 0.76], [0, 0.92], [0.32, 0.76]].forEach(([fx, fy]) => {
      const finialSpire = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.022, 0.06, 12), polishedBrassMat);
      finialSpire.position.set(fx, fy, 0.04);
      clockGroup.add(finialSpire);
      const finialBall = new THREE.Mesh(new THREE.SphereGeometry(0.026, 16, 16), polishedBrassMat);
      finialBall.position.set(fx, fy + 0.04, 0.04);
      clockGroup.add(finialBall);
    });

    // 下部台座モールディング
    const clockBaseMold = new THREE.Mesh(new THREE.BoxGeometry(0.76, 0.09, 0.22), frameMat);
    clockBaseMold.position.set(0, -0.68, 0.02);
    clockGroup.add(clockBaseMold);

    // 左右の装飾コラム丸柱
    [-0.31, 0.31].forEach((colX) => {
      const colShaft = new THREE.Mesh(
        new THREE.CylinderGeometry(0.028, 0.028, 1.24, 16),
        frameMat
      );
      colShaft.position.set(colX, 0, 0.09);
      clockGroup.add(colShaft);

      [-0.58, 0.58].forEach((capY) => {
        const colRing = new THREE.Mesh(
          new THREE.CylinderGeometry(0.036, 0.036, 0.03, 16),
          polishedBrassMat
        );
        colRing.position.set(colX, capY, 0.09);
        clockGroup.add(colRing);
      });
    });

    // 白い円形文字盤（CylinderGeometry + クラシック目盛りテクスチャ・消灯時シアン蓄光対応）
    const dialTex = createClockDialTexture(true);

    clockFaceMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(0.24, 0.24, 0.03, 32),
      new THREE.MeshStandardMaterial({
        map: dialTex,
        color: 0xf8f2e6,
        emissive: new THREE.Color(0x000000),
        emissiveIntensity: 0.0,
        roughness: 0.32,
        metalness: 0.08
      })
    );
    clockFaceMesh.rotation.x = Math.PI / 2;
    clockFaceMesh.position.set(0, 0.26, 0.09);
    clockGroup.add(clockFaceMesh);

    const faceRing = new THREE.Mesh(new THREE.TorusGeometry(0.242, 0.018, 16, 36), polishedBrassMat);
    faceRing.position.set(0, 0.26, 0.105);
    clockGroup.add(faceRing);

    // 真鍮の長針・短針と中央ピン
    const centerPin = new THREE.Mesh(
      new THREE.CylinderGeometry(0.018, 0.018, 0.025, 16),
      polishedBrassMat
    );
    centerPin.rotation.x = Math.PI / 2;
    centerPin.position.set(0, 0.26, 0.115);
    clockGroup.add(centerPin);

    // 短針（真鍮製：初期状態0時0分・真上方向、モーダル操作と連動）
    clockHourHandPivot = new THREE.Group();
    clockHourHandPivot.position.set(0, 0.26, 0.115);
    const hourHandMesh = new THREE.Mesh(
      new THREE.BoxGeometry(0.018, 0.13, 0.008),
      polishedBrassMat
    );
    hourHandMesh.position.set(0, 0.055, 0);
    clockHourHandPivot.add(hourHandMesh);
    clockGroup.add(clockHourHandPivot);

    // 長針（真鍮製：初期状態0時0分・真上方向、モーダル操作と連動）
    clockMinuteHandPivot = new THREE.Group();
    clockMinuteHandPivot.position.set(0, 0.26, 0.12);
    const minuteHandMesh = new THREE.Mesh(
      new THREE.BoxGeometry(0.013, 0.185, 0.008),
      polishedBrassMat
    );
    minuteHandMesh.position.set(0, 0.08, 0);
    clockMinuteHandPivot.add(minuteHandMesh);
    clockGroup.add(clockMinuteHandPivot);

    // 3D空間の針の角度を初期状態（0時0分）に同期
    updateClockHands3D();

    // 下部ケースの振り子窓（奥まった黒室＋真鍮縁取り枠）
    const pendWindow = new THREE.Mesh(
      new THREE.BoxGeometry(0.38, 0.50, 0.04),
      new THREE.MeshStandardMaterial({ color: 0x0c0e12, roughness: 0.25, metalness: 0.6 })
    );
    pendWindow.position.set(0, -0.30, 0.075);
    clockGroup.add(pendWindow);

    const pendFrameTop = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.025, 0.03), polishedBrassMat);
    pendFrameTop.position.set(0, -0.05, 0.095);
    clockGroup.add(pendFrameTop);
    const pendFrameBot = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.025, 0.03), polishedBrassMat);
    pendFrameBot.position.set(0, -0.55, 0.095);
    clockGroup.add(pendFrameBot);

    // 真鍮の振り子（金属の丸棒＋球体レンズボブ）
    clockPendulumGroup = new THREE.Group();
    clockPendulumGroup.position.set(0, -0.10, 0.095);

    const rodMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(0.008, 0.008, 0.30, 12),
      polishedBrassMat
    );
    rodMesh.position.set(0, -0.15, 0);
    clockPendulumGroup.add(rodMesh);

    const bobMesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.068, 24, 24),
      polishedBrassMat
    );
    bobMesh.scale.set(1.0, 1.0, 0.42);
    bobMesh.position.set(0, -0.31, 0);
    clockPendulumGroup.add(bobMesh);

    clockGroup.add(clockPendulumGroup);
    attachInvisibleCollider(clockGroup, 0.82, 1.55, 0.28, 0, 0.05, 0.05);

    registerInteractive(clockGroup, {
      id: 'clock',
      name: '壁掛けの古時計',
      category: 'NORTH / ANTIQUE CLOCK',
      action: () => triggerZoomAndInspect(
        new THREE.Vector3(2.2, 2.1, -3.6),
        new THREE.Vector3(2.2, 2.25, -4.88),
        openClockModal
      )
    });

    // ==========================================
    // 【2. 東の壁 (East)】
    // ==========================================

    // A. アンティーク書斎机（GLTFLoaderによる外部3Dモデル assets/models/desk.glb 読み込み＆立体小物配置）
    const deskGroup = new THREE.Group();
    deskGroup.position.set(3.8, 0, -2.0);
    deskGroup.rotation.set(0, 0, 0);

    // Raycaster（照準クリック）判定を確実に維持する不可視バウンディングボックス
    const deskHitBox = new THREE.Mesh(
      new THREE.BoxGeometry(1.26, 1.25, 2.26),
      new THREE.MeshBasicMaterial({
        transparent: true,
        opacity: 0.0,
        depthWrite: false
      })
    );
    deskHitBox.position.set(0, 0.625, 0);
    deskHitBox.userData.isHitBox = true;
    deskGroup.add(deskHitBox);

    // 既存の仮置きCube机本体（非表示化・フォールバック用）
    const deskPlaceholderGroup = new THREE.Group();
    deskPlaceholderGroup.visible = false;

    const deskTop = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.08, 2.2), darkWoodMat);
    deskTop.position.set(0, 0.82, 0);
    deskPlaceholderGroup.add(deskTop);

    const legLeft = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.78, 0.55), darkWoodMat);
    legLeft.position.set(0, 0.39, -0.75);
    deskPlaceholderGroup.add(legLeft);

    const legRight = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.78, 0.55), darkWoodMat);
    legRight.position.set(0, 0.39, 0.75);
    deskPlaceholderGroup.add(legRight);

    const drawer = new THREE.Mesh(new THREE.BoxGeometry(1.05, 0.16, 0.82), darkWoodMat);
    drawer.position.set(-0.02, 0.68, 0);
    deskPlaceholderGroup.add(drawer);

    const handle = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.03, 0.16), brassMat);
    handle.position.set(-0.56, 0.68, 0);
    deskPlaceholderGroup.add(handle);

    deskGroup.add(deskPlaceholderGroup);

    // =========================================================================
    // 1. スタンドライト（Desk Lamp）：円柱台座・真鍮ポール・深緑の円錐シェード
    // =========================================================================
    const lampBrassMat = new THREE.MeshStandardMaterial({
      color: 0xd4af37,
      metalness: 0.85,
      roughness: 0.3
    });
    const lampShadeMat = new THREE.MeshStandardMaterial({
      color: 0x0f3822,
      emissive: 0x000000,
      emissiveIntensity: 0.0,
      roughness: 0.25,
      metalness: 0.08,
      side: THREE.DoubleSide
    });

    const deskLampGroup = new THREE.Group();
    deskLampGroup.position.set(0.14, 0.86, 0.52);

    // 台座：薄い金色の円柱 CylinderGeometry(0.12, 0.14, 0.03, 24)
    const lampBase = new THREE.Mesh(
      new THREE.CylinderGeometry(0.12, 0.14, 0.03, 24),
      lampBrassMat
    );
    lampBase.position.set(0, 0.015, 0);
    deskLampGroup.add(lampBase);

    // 台座上の装飾段差リング
    const lampCollar = new THREE.Mesh(
      new THREE.CylinderGeometry(0.045, 0.075, 0.022, 24),
      lampBrassMat
    );
    lampCollar.position.set(0, 0.038, 0);
    deskLampGroup.add(lampCollar);

    // 支柱：真鍮の金属製ポール CylinderGeometry(0.015, 0.015, 0.35, 12)（台座の中心軸 x=0, z=0 に完全一致）
    const lampPole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.015, 0.015, 0.35, 12),
      lampBrassMat
    );
    lampPole.position.set(0, 0.205, 0);
    deskLampGroup.add(lampPole);

    // ランプシェード（傘）：深緑の円錐 ConeGeometry(0.18, 0.14, 24, 1, true)
    // 支柱の真上（x=0, z=0）に同軸配置し、位置ずれを解消
    const lampShade = new THREE.Mesh(
      new THREE.ConeGeometry(0.18, 0.14, 24, 1, true),
      lampShadeMat
    );
    lampShade.position.set(0, 0.34, 0);
    deskShadeMesh = lampShade;
    deskLampGroup.add(lampShade);

    // シェード天頂の真鍮キャップ＆フィニアル（支柱頂点と傘の頂点をシームレスに結合）
    const shadeCap = new THREE.Mesh(
      new THREE.CylinderGeometry(0.018, 0.042, 0.024, 24),
      lampBrassMat
    );
    shadeCap.position.set(0, 0.405, 0);
    deskLampGroup.add(shadeCap);

    const shadeFinial = new THREE.Mesh(
      new THREE.SphereGeometry(0.016, 16, 16),
      lampBrassMat
    );
    shadeFinial.position.set(0, 0.422, 0);
    deskLampGroup.add(shadeFinial);

    // シェード内側の発光電球（傘の内部中央に配置）
    deskBulbMesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.032, 16, 16),
      new THREE.MeshStandardMaterial({
        color: 0xfff0d0,
        emissive: 0xffdeb0,
        emissiveIntensity: 0.8,
        roughness: 0.3
      })
    );
    deskBulbMesh.position.set(0, 0.31, 0);
    deskLampGroup.add(deskBulbMesh);

    // ランプ自身のパーツが内部光源を遮って真下に不自然な影を作らないよう設定
    deskLampGroup.traverse((part) => {
      if (part.isMesh) {
        part.userData.noCastShadow = true;
      }
    });

    deskGroup.add(deskLampGroup);

    // ランプの周りが丸く暖かく照らされる天板上のライトプール（光のグラデーション）
    const poolCanvas = document.createElement('canvas');
    poolCanvas.width = 512;
    poolCanvas.height = 938;
    const poolCtx = poolCanvas.getContext('2d');
    poolCtx.clearRect(0, 0, poolCanvas.width, poolCanvas.height);

    // 天板(1.20m x 2.20m)上のランプ位置(x = +0.14, z = +0.52)を中心とする円形グラデーション
    const lampCenterX = ((0.14 + 0.60) / 1.20) * poolCanvas.width;
    const lampCenterY = ((0.52 + 1.10) / 2.20) * poolCanvas.height;
    const poolGrad = poolCtx.createRadialGradient(
      lampCenterX, lampCenterY, 8,
      lampCenterX, lampCenterY, 440
    );
    poolGrad.addColorStop(0.0, 'rgba(255, 235, 185, 0.14)');
    poolGrad.addColorStop(0.25, 'rgba(255, 222, 160, 0.09)');
    poolGrad.addColorStop(0.55, 'rgba(255, 205, 130, 0.04)');
    poolGrad.addColorStop(1.0, 'rgba(255, 180, 90, 0.0)');
    poolCtx.fillStyle = poolGrad;
    poolCtx.fillRect(0, 0, poolCanvas.width, poolCanvas.height);

    const poolTex = new THREE.CanvasTexture(poolCanvas);
    deskLightPoolMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(1.20, 2.20),
      new THREE.MeshBasicMaterial({
        map: poolTex,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      })
    );
    deskLightPoolMesh.rotation.x = -Math.PI / 2;
    deskLightPoolMesh.position.set(0, 0.8615, 0);
    deskLightPoolMesh.userData.isHitBox = true;
    deskGroup.add(deskLightPoolMesh);

    // =========================================================================
    // 2. 手帳（Diary）：天板の中央手前に配置、革の表紙＋丸背表紙＋紙束＋13度傾き
    // =========================================================================
    const diaryGroup = new THREE.Group();
    // 天板の中央手前（机の西端から少し引いた位置）に配置し、Y軸回転で約13度傾ける
    diaryGroup.position.set(-0.22, 0.86, -0.08);
    diaryGroup.rotation.y = THREE.MathUtils.degToRad(13);

    const diaryLeatherMat = new THREE.MeshStandardMaterial({
      color: 0x6e201b, // 深いアンティークワインレッド
      roughness: 0.55,
      metalness: 0.08
    });
    const diaryPagesMat = new THREE.MeshStandardMaterial({
      color: 0xf6ede0, // 羊皮紙・古紙のクリーム色
      roughness: 0.72,
      metalness: 0.02
    });

    // 下表紙
    const bottomCover = new THREE.Mesh(
      new THREE.BoxGeometry(0.26, 0.008, 0.34),
      diaryLeatherMat
    );
    bottomCover.position.set(0, 0.004, 0);
    diaryGroup.add(bottomCover);

    // 中身のページ束（表紙よりわずかに内側に収まる）
    const pageBlock = new THREE.Mesh(
      new THREE.BoxGeometry(0.245, 0.032, 0.324),
      diaryPagesMat
    );
    pageBlock.position.set(-0.004, 0.024, 0);
    diaryGroup.add(pageBlock);

    // 上表紙
    const topCover = new THREE.Mesh(
      new THREE.BoxGeometry(0.26, 0.008, 0.34),
      diaryLeatherMat
    );
    topCover.position.set(0, 0.044, 0);
    diaryGroup.add(topCover);

    // 丸みを帯びた背表紙（CylinderGeometry）
    const spineMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(0.024, 0.024, 0.34, 16),
      diaryLeatherMat
    );
    spineMesh.rotation.x = Math.PI / 2;
    spineMesh.position.set(0.125, 0.024, 0);
    diaryGroup.add(spineMesh);

    // 背表紙のクラシックなバンド装飾（4本）
    [-0.11, -0.038, 0.038, 0.11].forEach((zOff) => {
      const hub = new THREE.Mesh(
        new THREE.CylinderGeometry(0.0265, 0.0265, 0.012, 16),
        lampBrassMat
      );
      hub.rotation.x = Math.PI / 2;
      hub.position.set(0.126, 0.024, zOff);
      diaryGroup.add(hub);
    });

    // 表紙中央の真鍮天体メダリオン装飾
    const coverMedallion = new THREE.Mesh(
      new THREE.CylinderGeometry(0.038, 0.038, 0.004, 24),
      lampBrassMat
    );
    coverMedallion.position.set(-0.01, 0.049, 0);
    diaryGroup.add(coverMedallion);

    const coverRing = new THREE.Mesh(
      new THREE.TorusGeometry(0.056, 0.003, 8, 24),
      lampBrassMat
    );
    coverRing.rotation.x = Math.PI / 2;
    coverRing.position.set(-0.01, 0.049, 0);
    diaryGroup.add(coverRing);

    // ページの間から覗く真鍮ゴールドの栞リボン
    const ribbonMesh = new THREE.Mesh(
      new THREE.BoxGeometry(0.018, 0.003, 0.09),
      new THREE.MeshStandardMaterial({ color: 0xc59b27, roughness: 0.45, metalness: 0.3 })
    );
    ribbonMesh.position.set(-0.04, 0.006, 0.19);
    ribbonMesh.rotation.y = 0.18;
    diaryGroup.add(ribbonMesh);

    // 手帳の自己遮蔽による不自然な真っ黒影を排除し、ランプ光と環境光で常に鮮明に視認可能に設定
    diaryGroup.traverse((part) => {
      if (part.isMesh) {
        part.userData.noCastShadow = true;
        part.castShadow = false;
        part.receiveShadow = false;
      }
    });

    deskGroup.add(diaryGroup);

    registerInteractive(
      deskGroup,
      {
        id: 'desk',
        name: '古びた手帳とアンティーク書斎机',
        category: 'EAST / STUDY DESK & DIARY',
        action: triggerDeskZoomAndInspect
      },
      { minX: 3.1, maxX: 4.6, minZ: -3.2, maxZ: -0.8 }
    );

    // GLTFLoader で assets/models/desk.glb を非同期読み込み
    if (typeof THREE.GLTFLoader !== 'undefined') {
      const gltfLoader = new THREE.GLTFLoader();
      gltfLoader.load(
        'assets/models/desk.glb',
        (gltf) => {
          const deskModel = gltf.scene;

          // 仮置きCubeグループを完全に非表示＆削除
          deskPlaceholderGroup.visible = false;
          if (deskPlaceholderGroup.parent) {
            deskGroup.remove(deskPlaceholderGroup);
          }

          // 部屋のスケール（奥行 約2.22m・高さ 約0.85〜1.25m）に合うようにモデルのサイズ(scale)と位置を自動調整
          const rawBox = new THREE.Box3().setFromObject(deskModel);
          const rawSize = new THREE.Vector3();
          rawBox.getSize(rawSize);

          if (rawSize.x > 0 && rawSize.y > 0 && rawSize.z > 0) {
            const targetSpanZ = 2.22;
            const scaleFactor = targetSpanZ / Math.max(rawSize.z, 0.001);
            deskModel.scale.set(scaleFactor, scaleFactor, scaleFactor);

            // スケール適用後のバウンディングボックスを再計算して床面(y=0)および中心に配置
            const scaledBox = new THREE.Box3().setFromObject(deskModel);
            const scaledCenter = new THREE.Vector3();
            scaledBox.getCenter(scaledCenter);
            deskModel.position.set(
              -scaledCenter.x,
              -scaledBox.min.y,
              -scaledCenter.z
            );
          }

          // 読み込んだ3Dモデルの全メッシュに木目質感・影設定（castShadow / receiveShadow）とRaycaster判定を適用
          deskModel.traverse((child) => {
            if (child.isMesh) {
              if (child.material && child.material.name !== 'AntiqueBrass') {
                child.material = child.material.clone();
                child.material.map = darkWoodTex;
                child.material.roughness = 0.55;
                child.material.needsUpdate = true;
              }
              child.castShadow = true;
              child.receiveShadow = true;
              child.userData.interactiveRoot = deskGroup;
              interactables.push(child);
            }
          });

          deskGroup.add(deskModel);
        },
        undefined,
        (error) => {
          console.warn('desk.glb の非同期読み込みに失敗したため仮置きモデルを表示します:', error);
          deskPlaceholderGroup.visible = true;
        }
      );
    } else {
      deskPlaceholderGroup.visible = true;
    }

    // B. 本棚と星座パズル本（棚板の厚み・側板・最上段の7冊の仕掛け本［色・厚み・高さに自然な個体差］・下段蔵書）
    const shelfSystem = new THREE.Group();
    shelfSystem.position.set(4.5, 0, 1.2);

    bookshelfMeshGroup = new THREE.Group();

    // 背板（奥側 x = +0.34）
    const shelfBack = new THREE.Mesh(new THREE.BoxGeometry(0.06, 2.68, 2.18), oakWoodMat);
    shelfBack.position.set(0.34, 1.34, 0);
    bookshelfMeshGroup.add(shelfBack);

    // 左右の側板（z = -1.06, +1.06）
    [-1.06, 1.06].forEach((sz) => {
      const sidePanel = new THREE.Mesh(new THREE.BoxGeometry(0.72, 2.68, 0.08), oakWoodMat);
      sidePanel.position.set(0.01, 1.34, sz);
      bookshelfMeshGroup.add(sidePanel);

      // 前面ピラスター化粧柱
      const frontTrim = new THREE.Mesh(new THREE.BoxGeometry(0.05, 2.68, 0.11), darkWoodMat);
      frontTrim.position.set(-0.35, 1.34, sz);
      bookshelfMeshGroup.add(frontTrim);
    });

    // 上部クラウン冠モールディング＆下部台座ベース
    const shelfCrown = new THREE.Mesh(new THREE.BoxGeometry(0.80, 0.11, 2.30), darkWoodMat);
    shelfCrown.position.set(-0.01, 2.69, 0);
    bookshelfMeshGroup.add(shelfCrown);

    const shelfPlinth = new THREE.Mesh(new THREE.BoxGeometry(0.76, 0.14, 2.24), darkWoodMat);
    shelfPlinth.position.set(0.0, 0.07, 0);
    bookshelfMeshGroup.add(shelfPlinth);

    // 厚みのある4段の棚板（y = 0.16, 0.76, 1.36, 1.96）
    const shelfLevels = [0.16, 0.76, 1.36, 1.96];
    shelfLevels.forEach((sy) => {
      const plank = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.055, 2.04), oakWoodMat);
      plank.position.set(0.0, sy, 0);
      bookshelfMeshGroup.add(plank);
    });

    // 最上段（y = 1.987 棚板上）：7冊の星座仕掛け本（一冊ずつ色を変え、厚みや高さをわずかにランダム化）
    const constellationBooks = [
      { color: 0x781e19, h: 0.44, t: 0.125, d: 0.31 }, // 1: 白羊 (深紅)
      { color: 0x1e4d2b, h: 0.39, t: 0.105, d: 0.29 }, // 2: 金牛 (深緑)
      { color: 0x6e471b, h: 0.42, t: 0.135, d: 0.30 }, // 3: 双子 (琥珀茶)
      { color: 0x4a235a, h: 0.46, t: 0.115, d: 0.32 }, // 4: 巨蟹 (紫)
      { color: 0x8c5818, h: 0.41, t: 0.130, d: 0.30 }, // 5: 獅子 (黄金茶)
      { color: 0x163859, h: 0.45, t: 0.110, d: 0.31 }, // 6: 天蠍 (紺青)
      { color: 0x145a38, h: 0.38, t: 0.140, d: 0.29 }  // 7: 射手 (翠緑)
    ];

    const topShelfSurfaceY = 1.96 + 0.0275;
    let currentBookZ = -0.78;
    constellationBooks.forEach((b) => {
      const bookGroup = new THREE.Group();
      const bMat = new THREE.MeshStandardMaterial({
        color: b.color,
        roughness: 0.55,
        metalness: 0.06
      });

      // 本の本体
      const body = new THREE.Mesh(new THREE.BoxGeometry(b.d, b.h, b.t), bMat);
      body.position.set(0, b.h / 2, 0);
      bookGroup.add(body);

      // 丸みを帯びた背表紙（前面側 -X）
      const spine = new THREE.Mesh(
        new THREE.CylinderGeometry(b.t / 2, b.t / 2, b.h, 12),
        bMat
      );
      spine.position.set(-b.d / 2, b.h / 2, 0);
      bookGroup.add(spine);

      // 背表紙の上下金箔ライン（暗闇時に淡いシアンで蓄光反応する専用マテリアル）
      const bandMat = polishedBrassMat.clone();
      constellationBookBands.push(bandMat);
      [-0.12, 0.12].forEach((gy) => {
        const goldBand = new THREE.Mesh(
          new THREE.BoxGeometry(0.012, 0.014, b.t * 0.92),
          bandMat
        );
        goldBand.position.set(-b.d / 2 - b.t * 0.38, b.h / 2 + gy, 0);
        bookGroup.add(goldBand);
      });

      bookGroup.position.set(-0.08, topShelfSurfaceY, currentBookZ + b.t / 2);
      currentBookZ += b.t + 0.10;
      bookshelfMeshGroup.add(bookGroup);
    });

    // 中段・下段（y = 1.36, 0.76, 0.16）のクラシカルな装飾古書群（本棚のリアリティ向上）
    const decColors = [0x3b2314, 0x4f1d1d, 0x1d3326, 0x2c2238, 0x543d1a, 0x1e2d3b];
    [1.388, 0.788, 0.188].forEach((rowY, rIdx) => {
      let zCursor = -0.92;
      for (let k = 0; k < 10; k++) {
        const bt = 0.08 + ((k * 3 + rIdx) % 4) * 0.022;
        const bh = 0.32 + ((k * 7 + rIdx) % 5) * 0.032;
        const bd = 0.27 + ((k + rIdx) % 3) * 0.02;
        if (zCursor + bt > 0.92) break;
        // ところどころ少し隙間や傾きを作る
        if ((k + rIdx) % 5 === 3) {
          zCursor += 0.14;
          continue;
        }
        const decMat = new THREE.MeshStandardMaterial({
          color: decColors[(k + rIdx * 2) % decColors.length],
          roughness: 0.65,
          metalness: 0.04
        });
        const decBook = new THREE.Mesh(new THREE.BoxGeometry(bd, bh, bt), decMat);
        decBook.position.set(-0.04, rowY + bh / 2, zCursor + bt / 2);
        if ((k + rIdx) % 4 === 2) {
          decBook.rotation.x = 0.08;
        }
        bookshelfMeshGroup.add(decBook);
        zCursor += bt + 0.015;
      }
    });

    shelfSystem.add(bookshelfMeshGroup);
    // コライダーを bookshelfMeshGroup に追加することで、本棚スライド時にコライダーも一緒に退避する
    attachInvisibleCollider(bookshelfMeshGroup, 0.85, 2.75, 2.30, 0, 1.37, 0);

    registerInteractive(
      shelfSystem,
      {
        id: 'bookshelf',
        name: '本棚の蔵書',
        category: 'EAST / BOOKSHELF',
        action: () => triggerZoomAndInspect(
          new THREE.Vector3(3.1, 1.85, 1.2),
          new THREE.Vector3(4.5, 1.85, 1.2),
          openBookshelfModal
        )
      },
      { minX: 3.9, maxX: 5.0, minZ: 0.0, maxZ: 2.4 }
    );

    // C. 壁金庫（重厚な鋼鉄扉・真鍮ダイヤル・ハンドル）
    const safeGroup = new THREE.Group();
    safeGroup.position.set(4.88, 1.4, 1.2);

    const safeSteelMat = new THREE.MeshStandardMaterial({
      color: 0x1e2229,
      roughness: 0.35,
      metalness: 0.85
    });
    const safeOuterFrame = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.92, 0.92), safeSteelMat);
    safeGroup.add(safeOuterFrame);

    const safeDoor = new THREE.Mesh(
      new THREE.BoxGeometry(0.09, 0.78, 0.78),
      new THREE.MeshStandardMaterial({ color: 0x282d36, roughness: 0.3, metalness: 0.82 })
    );
    safeDoor.position.set(-0.02, 0, 0);
    safeGroup.add(safeDoor);

    const safeCylinder = new THREE.Mesh(
      new THREE.CylinderGeometry(0.18, 0.20, 0.08, 32),
      polishedBrassMat
    );
    safeCylinder.rotation.z = Math.PI / 2;
    safeCylinder.position.set(-0.06, 0.05, -0.08);
    safeGroup.add(safeCylinder);

    const safeDialKnob = new THREE.Mesh(
      new THREE.CylinderGeometry(0.07, 0.09, 0.06, 24),
       safeSteelMat
    );
    safeDialKnob.rotation.z = Math.PI / 2;
    safeDialKnob.position.set(-0.10, 0.05, -0.08);
    safeGroup.add(safeDialKnob);

    // 金庫レバーハンドル
    const safeHandle = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.22, 0.04), polishedBrassMat);
    safeHandle.position.set(-0.09, 0.0, 0.20);
    safeGroup.add(safeHandle);

    // 金庫の不可視コライダーを手前側（x負方向）に広げ、本棚スライド後に確実にRaycastがヒットするようにする
    attachInvisibleCollider(safeGroup, 0.60, 1.15, 1.15, -0.25, 0, 0);

    registerInteractive(safeGroup, {
      id: 'wall_safe',
      name: '本棚奥の壁金庫',
      category: 'EAST / HIDDEN SAFE',
      action: () => {
        if (!state.booksPuzzleSolved) {
          setMessage('本棚の奥に何かが隠されているようだが、本棚が遮っていて手が届かない。');
          return;
        }
        triggerZoomAndInspect(
          new THREE.Vector3(3.6, 1.4, 1.2),
          new THREE.Vector3(4.88, 1.4, 1.2),
          openSafeModal
        );
      }
    });

    // ==========================================
    // 【3. 南の壁 (South)】
    // ==========================================

    // A. 壁の絵画『星辰の夜』（金色の立体モールディング額縁＋四隅装飾＋中央絵画キャンバス）
    const paintingGroup = new THREE.Group();
    paintingGroup.position.set(0, 2.2, 4.88);

    const goldFrameMat = new THREE.MeshStandardMaterial({
      color: 0xc9a032,
      roughness: 0.30,
      metalness: 0.84
    });
    const innerGiltMat = new THREE.MeshStandardMaterial({
      color: 0x9e781e,
      roughness: 0.38,
      metalness: 0.78
    });

    // 背板
    const paintingBack = new THREE.Mesh(
      new THREE.BoxGeometry(1.96, 1.40, 0.03),
      darkWoodMat
    );
    paintingBack.position.set(0, 0, -0.01);
    paintingGroup.add(paintingBack);

    // 上下左右の立体モールディング外枠（2段ステップ構造）
    // 上枠・下枠
    [-0.73, 0.73].forEach((fy) => {
      const outerBar = new THREE.Mesh(new THREE.BoxGeometry(2.18, 0.12, 0.09), goldFrameMat);
      outerBar.position.set(0, fy, -0.03);
      paintingGroup.add(outerBar);

      const innerLiner = new THREE.Mesh(
        new THREE.BoxGeometry(1.98, 0.05, 0.065),
        innerGiltMat
      );
      innerLiner.position.set(0, fy > 0 ? fy - 0.06 : fy + 0.06, -0.025);
      paintingGroup.add(innerLiner);
    });

    // 左枠・右枠
    [-1.03, 1.03].forEach((fx) => {
      const outerSide = new THREE.Mesh(new THREE.BoxGeometry(0.12, 1.58, 0.09), goldFrameMat);
      outerSide.position.set(fx, 0, -0.03);
      paintingGroup.add(outerSide);

      const innerSide = new THREE.Mesh(
        new THREE.BoxGeometry(0.05, 1.38, 0.065),
        innerGiltMat
      );
      innerSide.position.set(fx > 0 ? fx - 0.06 : fx + 0.06, 0, -0.025);
      paintingGroup.add(innerSide);
    });

    // 四隅のコーナーロゼット浮き彫り装飾
    [[-1.03, 0.73], [1.03, 0.73], [-1.03, -0.73], [1.03, -0.73]].forEach(([cx, cy]) => {
      const cornerBlock = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.15, 0.105), goldFrameMat);
      cornerBlock.position.set(cx, cy, -0.035);
      paintingGroup.add(cornerBlock);

      const rosette = new THREE.Mesh(
        new THREE.CylinderGeometry(0.048, 0.055, 0.02, 16),
        polishedBrassMat
      );
      rosette.rotation.x = Math.PI / 2;
      rosette.position.set(cx, cy, -0.09);
      paintingGroup.add(rosette);
    });

    // 中央の絵画キャンバス面
    paintingCanvasMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(1.88, 1.32),
      new THREE.MeshStandardMaterial({
        map: createPaintingTexture(true),
        roughness: 0.58,
        metalness: 0.05
      })
    );
    paintingCanvasMesh.rotation.y = Math.PI;
    paintingCanvasMesh.position.z = -0.032;
    paintingGroup.add(paintingCanvasMesh);

    attachInvisibleCollider(paintingGroup, 2.22, 1.64, 0.18, 0, 0, -0.04);

    registerInteractive(paintingGroup, {
      id: 'painting',
      name: '油絵『星辰の夜』',
      category: 'SOUTH / OIL PAINTING',
      action: () => triggerZoomAndInspect(
        new THREE.Vector3(0, 2.2, 3.5),
        new THREE.Vector3(0, 2.2, 4.88),
        openPaintingModal
      )
    });

    // B. 暖炉（グレーの石/レンガ調マテリアル・細いCylinder鉄格子バー等間隔配置・赤く発光する薪と炭）
    const fireplaceGroup = new THREE.Group();
    fireplaceGroup.position.set(-2.5, 0, 4.4);

    // グレーの石積み・スレート調プロシージャルテクスチャ生成
    const stoneCanvas = document.createElement('canvas');
    stoneCanvas.width = 512;
    stoneCanvas.height = 512;
    const sctx = stoneCanvas.getContext('2d');
    sctx.fillStyle = '#3d4147';
    sctx.fillRect(0, 0, 512, 512);
    const sRows = 8;
    const sCols = 4;
    const sH = 512 / sRows;
    const sW = 512 / sCols;
    for (let r = 0; r < sRows; r++) {
      const offset = (r % 2) * (sW / 2);
      for (let c = -1; c <= sCols; c++) {
        const shade = 68 + ((r * 13 + c * 7) % 26);
        sctx.fillStyle = `rgb(${shade}, ${shade + 2}, ${shade + 6})`;
        sctx.fillRect(c * sW + offset + 3, r * sH + 3, sW - 6, sH - 6);
        sctx.strokeStyle = '#25282c';
        sctx.lineWidth = 3;
        sctx.strokeRect(c * sW + offset + 3, r * sH + 3, sW - 6, sH - 6);
      }
    }
    const stoneTex = new THREE.CanvasTexture(stoneCanvas);
    stoneTex.wrapS = THREE.RepeatWrapping;
    stoneTex.wrapT = THREE.RepeatWrapping;
    stoneTex.repeat.set(2, 2);

    const grayStoneMat = new THREE.MeshStandardMaterial({
      map: stoneTex,
      color: 0x8a9098,
      roughness: 0.85,
      metalness: 0.06
    });
    const darkSlateMat = new THREE.MeshStandardMaterial({
      color: 0x33373d,
      roughness: 0.78,
      metalness: 0.10
    });

    // 床面のハースストーン（炉床石スラブ）
    const hearthSlab = new THREE.Mesh(new THREE.BoxGeometry(2.26, 0.08, 1.05), darkSlateMat);
    hearthSlab.position.set(0, 0.04, -0.06);
    fireplaceGroup.add(hearthSlab);

    // 左右の重厚な石柱ピラー＆段差ベース
    [-0.78, 0.78].forEach((px) => {
      const pillarBase = new THREE.Mesh(new THREE.BoxGeometry(0.50, 0.22, 0.82), darkSlateMat);
      pillarBase.position.set(px, 0.15, 0);
      fireplaceGroup.add(pillarBase);

      const pillarBody = new THREE.Mesh(new THREE.BoxGeometry(0.44, 1.24, 0.74), grayStoneMat);
      pillarBody.position.set(px, 0.76, 0);
      fireplaceGroup.add(pillarBody);

      const pillarCap = new THREE.Mesh(new THREE.BoxGeometry(0.50, 0.12, 0.80), darkSlateMat);
      pillarCap.position.set(px, 1.36, 0);
      fireplaceGroup.add(pillarCap);
    });

    // 火室上部の石造りリンテル（まぐさ石）と2段マントルピース棚
    const lintelStone = new THREE.Mesh(new THREE.BoxGeometry(1.16, 0.26, 0.72), grayStoneMat);
    lintelStone.position.set(0, 1.25, 0);
    fireplaceGroup.add(lintelStone);

    const mantelLower = new THREE.Mesh(new THREE.BoxGeometry(2.14, 0.10, 0.86), grayStoneMat);
    mantelLower.position.set(0, 1.46, -0.02);
    fireplaceGroup.add(mantelLower);

    const mantelShelf = new THREE.Mesh(new THREE.BoxGeometry(2.30, 0.12, 0.94), darkSlateMat);
    mantelShelf.position.set(0, 1.56, -0.04);
    fireplaceGroup.add(mantelShelf);

    // 火室内部の耐火暗壁（奥・左右・天井）
    const fireboxMat = new THREE.MeshStandardMaterial({ color: 0x101215, roughness: 0.95 });
    const fireboxBack = new THREE.Mesh(new THREE.BoxGeometry(1.14, 1.12, 0.12), fireboxMat);
    fireboxBack.position.set(0, 0.60, 0.30);
    fireplaceGroup.add(fireboxBack);

    // 炉内の微かに赤く発光する炭（Embers）と丸太薪（Logs）
    const emberMat = new THREE.MeshStandardMaterial({
      color: 0x240702,
      emissive: 0xd93809,
      emissiveIntensity: 0.95,
      roughness: 0.82
    });
    const emberBed = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.42, 0.08, 16), emberMat);
    emberBed.scale.set(1.1, 1.0, 0.65);
    emberBed.position.set(0, 0.11, 0.04);
    fireplaceGroup.add(emberBed);

    // ゴツゴツした赤熱炭塊（複数配置）
    [
      [-0.22, 0.14, 0.02, 0.07],
      [-0.08, 0.15, -0.04, 0.08],
      [0.08, 0.14, 0.05, 0.075],
      [0.21, 0.13, -0.02, 0.065],
      [0.0, 0.16, 0.08, 0.07]
    ].forEach(([ex, ey, ez, er]) => {
      const coalChunk = new THREE.Mesh(new THREE.DodecahedronGeometry(er, 0), emberMat);
      coalChunk.position.set(ex, ey, ez);
      fireplaceGroup.add(coalChunk);
    });

    // 薪（丸太 CylinderGeometry を3本交差配置＋赤熱した割れ目）
    const charredLogMat = new THREE.MeshStandardMaterial({
      color: 0x21140d,
      emissive: 0x6e1402,
      emissiveIntensity: 0.45,
      roughness: 0.88
    });
    const logSpecs = [
      { pos: [-0.08, 0.20, 0.06], rot: [0.12, 0.25, Math.PI / 2 - 0.12], len: 0.58, rad: 0.055 },
      { pos: [0.08, 0.21, 0.02],  rot: [-0.1, -0.32, Math.PI / 2 + 0.15], len: 0.56, rad: 0.052 },
      { pos: [0.0, 0.27, 0.04],   rot: [0.22, 0.05, Math.PI / 2 - 0.05], len: 0.48, rad: 0.048 }
    ];
    logSpecs.forEach((lg) => {
      const logMesh = new THREE.Mesh(
        new THREE.CylinderGeometry(lg.rad, lg.rad * 1.08, lg.len, 14),
        charredLogMat
      );
      logMesh.position.set(lg.pos[0], lg.pos[1], lg.pos[2]);
      logMesh.rotation.set(lg.rot[0], lg.rot[1], lg.rot[2]);
      fireplaceGroup.add(logMesh);
    });

    // 鉄格子（細いCylinderGeometryバーを等間隔配置＋上下鋳鉄横桟＋槍先フィニアル）
    const wroughtIronMat = new THREE.MeshStandardMaterial({
      color: 0x1c1f24,
      roughness: 0.48,
      metalness: 0.82
    });
    const grilleGroup = new THREE.Group();
    grilleGroup.position.set(0, 0, -0.28);

    // 上下の横レール（丸パイプ）
    [0.16, 0.62].forEach((railY) => {
      const rail = new THREE.Mesh(
        new THREE.CylinderGeometry(0.016, 0.016, 1.12, 12),
        wroughtIronMat
      );
      rail.rotation.z = Math.PI / 2;
      rail.position.set(0, railY, 0);
      grilleGroup.add(rail);
    });

    // 等間隔に並ぶ9本の縦バー（細いCylinderGeometry）＋先端の槍型コーン
    for (let bi = -4; bi <= 4; bi++) {
      const bx = bi * 0.125;
      const barH = 0.62 - Math.abs(bi) * 0.015;
      const vBar = new THREE.Mesh(
        new THREE.CylinderGeometry(0.013, 0.013, barH, 12),
        wroughtIronMat
      );
      vBar.position.set(bx, 0.08 + barH / 2, 0);
      grilleGroup.add(vBar);

      const spearTip = new THREE.Mesh(
        new THREE.ConeGeometry(0.022, 0.055, 12),
        wroughtIronMat
      );
      spearTip.position.set(bx, 0.08 + barH + 0.025, 0);
      grilleGroup.add(spearTip);
    }
    fireplaceGroup.add(grilleGroup);
    attachInvisibleCollider(fireplaceGroup, 2.20, 1.60, 0.95, 0, 0.80, 0);

    registerInteractive(
      fireplaceGroup,
      {
        id: 'fireplace',
        name: '暖炉の火室',
        category: 'SOUTH / FIREPLACE',
        action: () => triggerZoomAndInspect(
          new THREE.Vector3(-2.5, 1.25, 2.8),
          new THREE.Vector3(-2.5, 0.55, 4.4),
          openFireplaceModal
        )
      },
      { minX: -3.6, maxX: -1.4, minZ: 3.9, maxZ: 5.0 }
    );

    // ==========================================
    // 【4. 西の壁 (West)】
    // ==========================================

    // A. 高級革張りソファ（深いワインレッド roughness: 0.5、丸みのあるクッション、四隅の短い木製丸脚）
    const sofaGroup = new THREE.Group();
    sofaGroup.position.set(-3.88, 0, -1.0);
    // 重厚なクラシック3人掛けソファにふさわしいサイズ感へボリュームアップ（幅約2.64m、奥行き約0.98m、高さ約0.96m）
    sofaGroup.scale.set(1.20, 1.16, 1.22);

    const leatherMat = new THREE.MeshStandardMaterial({
      color: 0x4c1218, // 深いワインレッド
      roughness: 0.5,
      metalness: 0.1
    });
    const darkLeatherSeamMat = new THREE.MeshStandardMaterial({
      color: 0x2b080c,
      roughness: 0.45,
      metalness: 0.15
    });

    // 1. 木製丸脚（4本）＋真鍮カップ（台座の下 y = 0 〜 0.10）
    const legPositions = [
      [-0.32, -0.92],
      [0.38, -0.92],
      [-0.32, 0.92],
      [0.38, 0.92]
    ];
    legPositions.forEach(([lx, lz]) => {
      const woodLeg = new THREE.Mesh(
        new THREE.CylinderGeometry(0.042, 0.026, 0.10, 16),
        darkWoodMat
      );
      woodLeg.position.set(lx, 0.05, lz);
      sofaGroup.add(woodLeg);

      const legBrassCup = new THREE.Mesh(
        new THREE.CylinderGeometry(0.030, 0.025, 0.025, 16),
        polishedBrassMat
      );
      legBrassCup.position.set(lx, 0.0125, lz);
      sofaGroup.add(legBrassCup);
    });

    // 2. ソファ下部メインベースフレーム（脚の上 y: 0.10 〜 0.24, 幅 2.16m, 奥行 0.82m）
    const sofaBaseFrame = new THREE.Mesh(
      new THREE.BoxGeometry(0.82, 0.14, 2.16),
      leatherMat
    );
    sofaBaseFrame.position.set(0.05, 0.17, 0);
    sofaGroup.add(sofaBaseFrame);

    // フロント下部の木製飾り枠
    const woodApron = new THREE.Mesh(
      new THREE.BoxGeometry(0.025, 0.03, 2.14),
      darkWoodMat
    );
    woodApron.position.set(0.465, 0.115, 0);
    sofaGroup.add(woodApron);

    // 3. 左右アームレスト（肘掛け：外幅 2.16m、内幅 1.80m、厚み 0.18m）
    // 左アーム: az = +0.99 (z: 0.90 〜 1.08)、右アーム: az = -0.99 (z: -1.08 〜 -0.90)
    [-0.99, 0.99].forEach((az) => {
      // アーム側板ベース（y: 0.24 〜 0.60, 奥行 x: -0.29 〜 0.41）
      const armBody = new THREE.Mesh(new THREE.BoxGeometry(0.70, 0.36, 0.18), leatherMat);
      armBody.position.set(0.06, 0.42, az);
      sofaGroup.add(armBody);

      // アーム上部の丸みロール（上端 y = 0.60 に乗せる：半径 0.09, 長さ 0.70）
      const armTopRoll = new THREE.Mesh(
        new THREE.CylinderGeometry(0.09, 0.09, 0.70, 24),
        leatherMat
      );
      armTopRoll.rotation.z = Math.PI / 2;
      armTopRoll.position.set(0.06, 0.60, az);
      sofaGroup.add(armTopRoll);

      // アーム前面の化粧フェイシア下部パネル（x = 0.43, y: 0.24 〜 0.60）
      const armFrontFace = new THREE.Mesh(
        new THREE.BoxGeometry(0.04, 0.36, 0.18),
        leatherMat
      );
      armFrontFace.position.set(0.43, 0.42, az);
      sofaGroup.add(armFrontFace);

      // アーム前面上部の丸型スクロールヘッド（上部の丸みと前面を直角の隙間なく美しく結合）
      const armScrollHead = new THREE.Mesh(
        new THREE.CylinderGeometry(0.09, 0.09, 0.04, 28),
        leatherMat
      );
      armScrollHead.rotation.z = Math.PI / 2;
      armScrollHead.position.set(0.43, 0.60, az);
      sofaGroup.add(armScrollHead);

      // アーム前面の装飾トリムプレート（わずかに浮き上がったダークレザー縁取り）
      const armTrimPlate = new THREE.Mesh(
        new THREE.CylinderGeometry(0.08, 0.08, 0.01, 24),
        darkLeatherSeamMat
      );
      armTrimPlate.rotation.z = Math.PI / 2;
      armTrimPlate.position.set(0.455, 0.60, az);
      sofaGroup.add(armTrimPlate);

      // アーム前面スクロール中心の真鍮飾りスタッズ（鋲）
      const centerStud = new THREE.Mesh(
        new THREE.SphereGeometry(0.016, 12, 12),
        polishedBrassMat
      );
      centerStud.position.set(0.465, 0.60, az);
      sofaGroup.add(centerStud);

      // アーム前面の縦ラインに並ぶ真鍮スタッズ鋲（3個）
      [0.50, 0.40, 0.30].forEach((sy) => {
        const vertStud = new THREE.Mesh(
          new THREE.SphereGeometry(0.012, 10, 10),
          polishedBrassMat
        );
        vertStud.position.set(0.455, sy, az);
        sofaGroup.add(vertStud);
      });
    });

    // 4. 背もたれ（Backrest：アーム内寸幅 1.80m 内にぴったり収まり、貫通ゼロ）
    // 背もたれ本体（x: -0.33 〜 -0.15, y: 0.24 〜 0.74, 幅 1.78m: z = -0.89 〜 +0.89）
    const backCore = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.50, 1.78), leatherMat);
    backCore.position.set(-0.24, 0.49, 0);
    sofaGroup.add(backCore);

    // 背もたれ上部のロール（上端 y = 0.74 に乗せる：半径 0.09, 長さ 1.78）
    const backTopRoll = new THREE.Mesh(
      new THREE.CylinderGeometry(0.09, 0.09, 1.78, 24),
      leatherMat
    );
    backTopRoll.rotation.x = Math.PI / 2;
    backTopRoll.position.set(-0.24, 0.74, 0);
    sofaGroup.add(backTopRoll);

    // 背もたれのタフティング（ボタン留め）2段×5列
    for (let bz = -0.68; bz <= 0.68; bz += 0.34) {
      [0.45, 0.62].forEach((by, rIdx) => {
        const zShift = rIdx === 1 ? 0.17 : 0;
        if (Math.abs(bz + zShift) > 0.72) return;
        const btn = new THREE.Mesh(
          new THREE.SphereGeometry(0.015, 10, 10),
          darkLeatherSeamMat
        );
        btn.position.set(-0.145, by, bz + zShift);
        sofaGroup.add(btn);
      });
    }

    // 5. 3分割座面クッション（小箱が隠されている隙間ギミック：各幅 0.56m, アーム内壁 0.90m からのクリアランスを厳格維持）
    // cz = -0.58, 0.0, +0.58 （端 z = ±0.86 < アーム内壁 0.90 なので貫通・干渉ゼロ）
    [-0.58, 0.0, 0.58].forEach((cz) => {
      // クッション本体（y: 0.24 〜 0.36, 奥行 x: -0.14 〜 0.41）
      const cushion = new THREE.Mesh(
        new THREE.BoxGeometry(0.55, 0.12, 0.56),
        leatherMat
      );
      cushion.position.set(0.135, 0.30, cz);
      sofaGroup.add(cushion);

      // クッション前縁ロール（前端 x = 0.41 に丸みを付与：半径 0.06, 長さ 0.54）
      const frontRoll = new THREE.Mesh(
        new THREE.CylinderGeometry(0.06, 0.06, 0.54, 20),
        leatherMat
      );
      frontRoll.rotation.x = Math.PI / 2;
      frontRoll.position.set(0.41, 0.30, cz);
      sofaGroup.add(frontRoll);

      // クッション上面のふっくらトップ面
      const cushionTop = new THREE.Mesh(
        new THREE.BoxGeometry(0.51, 0.02, 0.52),
        darkLeatherSeamMat
      );
      cushionTop.position.set(0.135, 0.365, cz);
      sofaGroup.add(cushionTop);
    });

    attachInvisibleCollider(sofaGroup, 1.15, 1.05, 2.30, 0.05, 0.52, 0);

    registerInteractive(
      sofaGroup,
      {
        id: 'sofa',
        name: '高級革張りソファ',
        category: 'WEST / LEATHER SOFA',
        action: () => triggerZoomAndInspect(
          new THREE.Vector3(-2.6, 1.35, -1.0),
          new THREE.Vector3(-3.88, 0.45, -1.0),
          openSofaModal
        )
      },
      { minX: -4.7, maxX: -3.0, minZ: -2.6, maxZ: 0.6 }
    );

    // B. サイドテーブルと天球儀（真鍮の金属支柱・同心円の回転リング群・中心の小さな球体）
    const globeGroup = new THREE.Group();
    globeGroup.position.set(-3.8, 0, 1.8);

    // クラシカルな丸天板＋縁の立体モールディング
    const tableTop = new THREE.Mesh(
      new THREE.CylinderGeometry(0.50, 0.50, 0.05, 32),
      darkWoodMat
    );
    tableTop.position.set(0, 0.73, 0);
    globeGroup.add(tableTop);

    const tableRim = new THREE.Mesh(
      new THREE.TorusGeometry(0.50, 0.024, 14, 36),
      darkWoodMat
    );
    tableRim.rotation.x = Math.PI / 2;
    tableRim.position.set(0, 0.73, 0);
    globeGroup.add(tableRim);

    const tableApron = new THREE.Mesh(
      new THREE.CylinderGeometry(0.42, 0.42, 0.06, 24),
      frameMat
    );
    tableApron.position.set(0, 0.68, 0);
    globeGroup.add(tableApron);

    // 旋盤加工（バラスター）風のセンター脚柱と三脚ベース
    const tableLeg = new THREE.Mesh(
      new THREE.CylinderGeometry(0.065, 0.095, 0.64, 20),
      darkWoodMat
    );
    tableLeg.position.set(0, 0.36, 0);
    globeGroup.add(tableLeg);

    const legBulb = new THREE.Mesh(
      new THREE.SphereGeometry(0.11, 20, 16),
      darkWoodMat
    );
    legBulb.scale.set(1.0, 0.75, 1.0);
    legBulb.position.set(0, 0.28, 0);
    globeGroup.add(legBulb);

    const tableBasePlinth = new THREE.Mesh(
      new THREE.CylinderGeometry(0.28, 0.34, 0.06, 24),
      darkWoodMat
    );
    tableBasePlinth.position.set(0, 0.03, 0);
    globeGroup.add(tableBasePlinth);

    // 3本の脚先（三方向へ伸びる安定脚）
    [0, (Math.PI * 2) / 3, (Math.PI * 4) / 3].forEach((ang) => {
      const foot = new THREE.Mesh(
        new THREE.BoxGeometry(0.10, 0.06, 0.42),
        darkWoodMat
      );
      foot.position.set(Math.sin(ang) * 0.18, 0.04, Math.cos(ang) * 0.18);
      foot.rotation.y = ang;
      globeGroup.add(foot);
    });

    // --- 天球儀（Armillary Sphere）本体 ---
    // 真鍮の段付き円形台座
    const armBaseLower = new THREE.Mesh(
      new THREE.CylinderGeometry(0.14, 0.18, 0.03, 28),
      polishedBrassMat
    );
    armBaseLower.position.set(0, 0.77, 0);
    globeGroup.add(armBaseLower);

    const armBaseUpper = new THREE.Mesh(
      new THREE.CylinderGeometry(0.08, 0.13, 0.025, 24),
      polishedBrassMat
    );
    armBaseUpper.position.set(0, 0.795, 0);
    globeGroup.add(armBaseUpper);

    // 真鍮の金属支柱（細い円柱＋装飾球ノード）
    const armPillar = new THREE.Mesh(
      new THREE.CylinderGeometry(0.018, 0.024, 0.16, 16),
      polishedBrassMat
    );
    armPillar.position.set(0, 0.87, 0);
    globeGroup.add(armPillar);

    const armPillarNode = new THREE.Mesh(
      new THREE.SphereGeometry(0.032, 16, 16),
      polishedBrassMat
    );
    armPillarNode.position.set(0, 0.87, 0);
    globeGroup.add(armPillarNode);

    // 天球中心座標 (y = 1.18)
    const sphereCenterY = 1.18;

    // 外周の固定子午線リングと水平地平リング
    const horizonRing = new THREE.Mesh(
      new THREE.TorusGeometry(0.26, 0.014, 16, 40),
      polishedBrassMat
    );
    horizonRing.rotation.x = Math.PI / 2;
    horizonRing.position.set(0, sphereCenterY, 0);
    globeGroup.add(horizonRing);

    const meridianRing = new THREE.Mesh(
      new THREE.TorusGeometry(0.25, 0.016, 16, 40),
      polishedBrassMat
    );
    meridianRing.position.set(0, sphereCenterY, 0);
    globeGroup.add(meridianRing);

    // 同心円の回転リング群（3重のTorusGeometryを異なる傾きで配置）
    const zodiacBandRing = new THREE.Mesh(
      new THREE.TorusGeometry(0.215, 0.018, 16, 36),
      polishedBrassMat
    );
    zodiacBandRing.rotation.set(Math.PI / 5, Math.PI / 6, 0.2);
    zodiacBandRing.position.set(0, sphereCenterY, 0);
    globeGroup.add(zodiacBandRing);

    const eclipticRing = new THREE.Mesh(
      new THREE.TorusGeometry(0.175, 0.013, 16, 36),
      polishedBrassMat
    );
    eclipticRing.rotation.set(-Math.PI / 3.2, 0.35, Math.PI / 4);
    eclipticRing.position.set(0, sphereCenterY, 0);
    globeGroup.add(eclipticRing);

    const innerColureRing = new THREE.Mesh(
      new THREE.TorusGeometry(0.135, 0.011, 16, 32),
      polishedBrassMat
    );
    innerColureRing.rotation.set(Math.PI / 2.6, -Math.PI / 4, 0);
    innerColureRing.position.set(0, sphereCenterY, 0);
    globeGroup.add(innerColureRing);

    // 天球を貫く斜めの極軸ロッドと頂部フィニアル
    const polarAxisRod = new THREE.Mesh(
      new THREE.CylinderGeometry(0.007, 0.007, 0.54, 12),
      polishedBrassMat
    );
    polarAxisRod.position.set(0, sphereCenterY, 0);
    polarAxisRod.rotation.z = 0.41; // 地軸傾斜角 約23.4度
    globeGroup.add(polarAxisRod);

    // 中心の小さな球体（ラピスラズリ調の地球・天球コア SphereGeometry）
    const globeCore = new THREE.Mesh(
      new THREE.SphereGeometry(0.062, 24, 24),
      new THREE.MeshStandardMaterial({
        color: 0x184a6e,
        roughness: 0.30,
        metalness: 0.35
      })
    );
    globeCore.position.set(0, sphereCenterY, 0);
    globeGroup.add(globeCore);

    // 中心球体の赤道真鍮ベルト
    const coreBelt = new THREE.Mesh(
      new THREE.TorusGeometry(0.064, 0.005, 12, 28),
      polishedBrassMat
    );
    coreBelt.rotation.x = Math.PI / 2;
    coreBelt.rotation.y = 0.41;
    coreBelt.position.set(0, sphereCenterY, 0);
    globeGroup.add(coreBelt);

    attachInvisibleCollider(globeGroup, 1.05, 1.52, 1.05, 0, 0.76, 0);

    registerInteractive(
      globeGroup,
      {
        id: 'armillary',
        name: '真鍮の天球儀',
        category: 'WEST / ARMILLARY SPHERE',
        action: () => triggerZoomAndInspect(
          new THREE.Vector3(-2.7, 1.40, 1.8),
          new THREE.Vector3(-3.8, 1.18, 1.8),
          openArmillaryModal
        )
      },
      { minX: -4.4, maxX: -3.2, minZ: 1.2, maxZ: 2.4 }
    );

    // C. ペルシャ風絨毯（ソファの横中央 z = -1.0 に合わせて配置）
    const carpetGroup = new THREE.Group();
    carpetGroup.position.set(-2.3, 0.008, -1.0);

    const rugTex = createPersianRugTexture();
    const rugMat = new THREE.MeshStandardMaterial({ map: rugTex, roughness: 0.88, metalness: 0.02 });
    const rugMesh = new THREE.Mesh(new THREE.PlaneGeometry(2.0, 2.8), rugMat);
    rugMesh.rotation.x = -Math.PI / 2;
    rugMesh.receiveShadow = true;
    carpetGroup.add(rugMesh);

    carpetCornerMesh = new THREE.Mesh(
      new THREE.BufferGeometry(),
      new THREE.MeshStandardMaterial({ color: 0x481215, roughness: 0.9 })
    );
    carpetGroup.add(carpetCornerMesh);

    registerInteractive(carpetGroup, {
      id: 'carpet',
      name: 'ペルシャ風絨毯',
      category: 'WEST / PERSIAN CARPET',
      action: () => triggerZoomAndInspect(
        new THREE.Vector3(-1.4, 1.65, -0.2),
        new THREE.Vector3(-2.3, 0.02, -1.0),
        openCarpetModal
      )
    });
  }

  // --- メッセージ表示ヘルパー（一定時間で自動的に上品にフェードアウト・消去） ---
  let messageClearTimer = null;
  let messageHideTimer = null;
  let messageRafId = null;

  function setMessage(text, autoResetDelay = 4000) {
    if (!messageText || !messageBarContainer) return;

    if (messageClearTimer) {
      clearTimeout(messageClearTimer);
      messageClearTimer = null;
    }
    if (messageHideTimer) {
      clearTimeout(messageHideTimer);
      messageHideTimer = null;
    }
    if (messageRafId) {
      cancelAnimationFrame(messageRafId);
      messageRafId = null;
    }

    if (!text || text.trim() === '') {
      clearMessage();
      return;
    }

    messageText.innerHTML = text.replace(/\n/g, '<br>');
    messageBarContainer.classList.remove('hidden');
    messageRafId = requestAnimationFrame(() => {
      messageBarContainer.classList.add('visible');
      messageRafId = null;
    });

    // 指定秒数後に自動フェードアウトし、完全に非表示化（居座りを根絶）
    if (autoResetDelay > 0) {
      messageClearTimer = setTimeout(() => {
        messageBarContainer.classList.remove('visible');
        if (messageBar) {
          messageBar.classList.remove('item-highlight');
        }
        // CSSフェードアウト（0.35秒）完了後に確実にhidden化
        messageHideTimer = setTimeout(() => {
          if (!messageBarContainer.classList.contains('visible')) {
            messageBarContainer.classList.add('hidden');
          }
          messageHideTimer = null;
        }, 360);
        messageClearTimer = null;
      }, autoResetDelay);
    }
  }

  function clearMessage() {
    if (messageClearTimer) {
      clearTimeout(messageClearTimer);
      messageClearTimer = null;
    }
    if (messageHideTimer) {
      clearTimeout(messageHideTimer);
      messageHideTimer = null;
    }
    if (messageRafId) {
      cancelAnimationFrame(messageRafId);
      messageRafId = null;
    }
    if (messageBarContainer) {
      messageBarContainer.classList.remove('visible');
      messageBarContainer.classList.add('hidden');
    }
    if (messageBar) {
      messageBar.classList.remove('item-highlight');
    }
  }

  // --- アイテム入手トースト通知（黒背景・モーダル時でも単独で美しく読み取れる最前面通知） ---
  let toastTimer = null;
  function showItemGetToast(def) {
    if (!itemGetToast || !def) return;
    if (toastItemIcon) toastItemIcon.innerHTML = def.icon;
    if (toastItemName) toastItemName.textContent = `【${def.name}】`;

    itemGetToast.classList.remove('hidden');

    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      itemGetToast.classList.add('hidden');
    }, 3200);
  }

  // --- インベントリ管理 ---
  function addItem(itemId) {
    const def = ITEMS[itemId];
    if (!def) return;
    if (state.inventory.some(i => i.id === itemId)) return;

    soundManager.playItemGet();
    state.inventory.push(def);
    state.selectedItem = itemId;
    renderInventory();
    // アイテム入手時は専用トースト通知（#item-get-toast）を単独表示し、上部でのメッセージバー重複・被りを完全防止
    showItemGetToast(def);
  }

  function removeItem(itemId) {
    const idx = state.inventory.findIndex(i => i.id === itemId);
    if (idx !== -1) {
      state.inventory.splice(idx, 1);
      if (state.selectedItem === itemId) {
        state.selectedItem = null;
      }
      renderInventory();
    }
  }

  function renderInventory() {
    invSlots.forEach((slot, idx) => {
      const inner = slot.querySelector('.slot-inner');
      inner.innerHTML = '';
      slot.classList.remove('selected');

      const item = state.inventory[idx];
      if (item) {
        inner.innerHTML = item.icon;
        slot.title = `[キー ${idx + 1}] ${item.name}`;
        if (state.selectedItem === item.id) {
          slot.classList.add('selected');
        }

        slot.onclick = (e) => {
          e.stopPropagation();
          soundManager.playClick();
          if (state.selectedItem === item.id) {
            openItemDetailModal(item.id);
          } else {
            state.selectedItem = item.id;
            renderInventory();
            setMessage(`【${item.name}】を選択した。`);
          }
        };
      } else {
        slot.title = `スロット ${idx + 1} (空)`;
        slot.onclick = null;
      }
    });
  }

  // --- モーダル制御 ---
  function openModal(category, title, htmlContent, onReady = null) {
    isObjectInteracting = false;
    document.body.classList.add('modal-open');

    activeModal = inspectModal;
    modalCategory.textContent = category;
    modalTitle.textContent = title;
    modalBody.innerHTML = htmlContent;
    inspectModal.classList.remove('hidden');

    if (controls.isLocked) {
      controls.unlock();
    }

    if (onReady) {
      onReady(modalBody);
    }
  }

  function closeModal() {
    if (!activeModal) return;
    isObjectInteracting = false;
    document.body.classList.remove('modal-open');
    activeModal.classList.add('hidden');
    activeModal = null;
    soundManager.playClick();

    // オブジェクトのズームイン状態から閉じる際は、元の探索視点の位置・向きへ滑らかに0.6秒ズームアウト
    if (cameraZoom.isZoomedIn) {
      startCameraZoomOut();
    } else {
      controls.lock();
    }
  }

  // 汎用カメラズームイン演出（0.6秒補間）：任意のオブジェクトに対して近接注視位置へ滑らかにズーム
  function triggerZoomAndInspect(targetPos, lookAtPos, inspectAction, message = null) {
    if (cameraZoom.active) return;
    isObjectInteracting = true;
    clearMessage();
    if (cameraZoom.isZoomedIn) {
      isObjectInteracting = false;
      if (typeof inspectAction === 'function') inspectAction();
      return;
    }

    clearHover();
    cameraZoom.savedPos.copy(camera.position);
    cameraZoom.savedQuat.copy(camera.quaternion);

    const tempCam = camera.clone();
    tempCam.position.copy(targetPos);
    tempCam.up.set(0, 1, 0);
    tempCam.lookAt(lookAtPos);

    cameraZoom.fromPos.copy(camera.position);
    cameraZoom.toPos.copy(targetPos);
    cameraZoom.fromQuat.copy(camera.quaternion);
    cameraZoom.toQuat.copy(tempCam.quaternion);
    isMouseDown = false;
    cameraZoom.mode = 'in';
    cameraZoom.duration = 600; // 0.6秒
    cameraZoom.startTime = performance.now();
    cameraZoom.active = true;
    soundManager.playZoom(false);

    // ズームイン中（0.6秒）はPointerLockを維持（モーダル立ち上がり時にunlockされる）

    cameraZoom.onComplete = () => {
      cameraZoom.isZoomedIn = true;
      isObjectInteracting = false;
      if (message) setMessage(message);
      if (typeof inspectAction === 'function') inspectAction();
    };
  }

  // 互換用：机・手帳クリック時のズームイン演出
  function triggerDeskZoomAndInspect() {
    triggerZoomAndInspect(
      new THREE.Vector3(2.96, 1.38, -2.22),
      new THREE.Vector3(3.58, 0.88, -2.08),
      openDeskModal
    );
  }

  // モーダルを閉じた際やEscキャンセル時の元の探索視点へのスムーズなズームアウト演出
  function startCameraZoomOut() {
    isObjectInteracting = false;
    cameraZoom.onComplete = null; // 以前のズームイン完了コールバックを確実にクリア
    cameraZoom.fromPos.copy(camera.position);
    cameraZoom.toPos.copy(cameraZoom.savedPos);
    cameraZoom.fromQuat.copy(camera.quaternion);
    cameraZoom.toQuat.copy(cameraZoom.savedQuat);
    cameraZoom.mode = 'out';
    cameraZoom.duration = 450; // 0.45秒で素早く滑らかに探索視点へ復帰
    cameraZoom.startTime = performance.now();
    cameraZoom.active = true;
    soundManager.playZoom(true);

    // ユーザージェスチャ内でポインタロックを要求
    controls.lock();

    cameraZoom.onComplete = () => {
      cameraZoom.isZoomedIn = false;
      isObjectInteracting = false;
      camera.position.copy(cameraZoom.savedPos);
      camera.quaternion.copy(cameraZoom.savedQuat);
      if (!controls.isLocked && !activeModal) {
        controls.lock();
      }
    };
  }
  const startDeskZoomOut = startCameraZoomOut;

  function getItemPickerHtml(promptText) {
    if (state.inventory.length === 0) {
      return `
        <div class="item-picker-box">
          <p class="item-picker-label">${promptText}</p>
          <p style="color:#888; font-size:0.82rem;">所持アイテムがありません</p>
        </div>
      `;
    }
    return `
      <div class="item-picker-box">
        <p class="item-picker-label">${promptText}</p>
        <div class="item-picker-list">
          ${state.inventory.map(item => `
            <button type="button" class="item-picker-btn" data-item-id="${item.id}">
              ${item.icon}
              <span>${item.name}</span>
            </button>
          `).join('')}
        </div>
      </div>
    `;
  }

  // --- 各パズルモーダル実装 ---

  // 1. 手帳・書斎机の調査モーダル（ズーム完了時に表示）
  function openDeskModal() {
    soundManager.playTurn();
    let bodyHtml = `
      <div style="text-align:center;">
        <p style="color:#b2aba0; margin-bottom:12px; font-size:0.92rem;">
          アンティークな書斎机だ。緑のバンカーズランプの脇に、革装丁の【古びた手帳】が置かれている。
        </p>

        <div style="background:rgba(20,24,32,0.6); border:1px solid rgba(202,168,106,0.35); border-radius:8px; padding:12px 16px; margin:0 auto 12px auto; max-width:400px; display:flex; align-items:center; justify-content:space-between; gap:12px;">
          <div style="text-align:left;">
            <div style="font-family:var(--font-serif); font-size:1.0rem; color:var(--brass-bright); font-weight:bold;">書斎主の天体日誌</div>
            <div style="font-size:0.8rem; color:#888;">星辰と古時計の運行に関する記録</div>
          </div>
          <button id="btn-read-diary" class="secondary-btn" style="white-space:nowrap; padding:6px 14px; font-size:0.82rem; border-color:var(--accent-gold); color:var(--accent-gold);">${UI_ICONS.book}日誌を開く</button>
        </div>

        <div style="border-top:1px solid rgba(202,168,106,0.25); padding-top:10px; margin-top:8px;">
    `;

    if (!state.drawerUnlocked) {
      bodyHtml += `
        <p style="margin-bottom:8px; font-size:0.88rem; color:#b2aba0;">机の上段の引き出しには銀色の小さな鍵穴がついている。</p>
        <div style="width:90px; height:40px; margin:6px auto; background:#22150f; border:2px solid #5c3d26; border-radius:6px; display:flex; align-items:center; justify-content:center;">
          <span style="display:inline-flex; color:#bdc3c7;">${UI_ICONS.lockClosed}</span>
        </div>
        ${getItemPickerHtml('引き出しの鍵穴に使うアイテムを選んでください')}
      `;
    } else {
      bodyHtml += `
        <p style="color:#58d68d; font-weight:bold; margin-bottom:6px; font-size:0.95rem;">★ 机の引き出しは解錠されている ★</p>
      `;
      if (!state.hasSwitchKey) {
        bodyHtml += `
          <div style="margin:10px 0;">
            <p style="font-size:0.88rem; margin-bottom:8px;">引き出しの奥に真鍮の小さな鍵が収められている！</p>
            <button id="btn-take-switch-key" class="primary-btn" style="max-width:240px; margin:0 auto;">端子盤の鍵を取る</button>
          </div>
        `;
      } else {
        bodyHtml += `
          <div style="background:rgba(202,168,106,0.18); border:1.5px solid var(--accent-gold); border-radius:8px; padding:10px 14px; margin:10px auto; max-width:380px; box-shadow:0 0 16px rgba(241,196,15,0.25);">
            <p style="color:#ffd700; font-weight:bold; font-size:1.0rem; margin-bottom:2px;">★【照明盤の真鍮鍵】を入手しました！★</p>
            <p style="color:#ffffff; font-size:0.84rem;">北の壁の施錠されたスイッチカバーを開けられそうだ。</p>
          </div>
          <p style="color:#aaa; font-size:0.85rem; margin-top:6px;">引き出しの中はもう空だ。</p>
        `;
      }
    }

    bodyHtml += `
        </div>
      </div>
    `;

    openModal('EAST / STUDY DESK', 'アンティーク書斎机', bodyHtml, (container) => {
      const btnDiary = container.querySelector('#btn-read-diary');
      if (btnDiary) {
        btnDiary.onclick = openDiaryModal;
      }

      if (!state.drawerUnlocked) {
        container.querySelectorAll('.item-picker-btn').forEach(btn => {
          btn.onclick = () => {
            const itemId = btn.getAttribute('data-item-id');
            if (itemId === 'silver_key') {
              soundManager.playUnlock();
              state.drawerUnlocked = true;
              removeItem('silver_key');
              setMessage('カチリ！ 銀の鍵が回り、引き出しが開いた！');
              openDeskModal();
            } else {
              soundManager.playClick();
              setMessage('この鍵では合わないようだ。');
            }
          };
        });
      } else {
        const btnTake = container.querySelector('#btn-take-switch-key');
        if (btnTake) {
          btnTake.onclick = () => {
            state.hasSwitchKey = true;
            addItem('switch_key');
            openDeskModal();
          };
        }
      }
    });
  }

  function openDiaryModal() {
    soundManager.playTurn();
    const html = `
      <div>
        <div class="diary-book" style="margin-bottom:12px;">
          <div class="diary-title">書斎主の天体日誌</div>
          <p>『かつて賢者は、古時計の二つの針を大いなる天体の運行になぞらえた。』</p>
          <div class="diary-poem">
            重厚なる短針は、黄昏の陽が沈みゆく【西】の地平へ。<br>
            軽やかなる長針は、黎明の光が生まれ出ずる【東】の空へ。<br>
            二つの針が正しく天の運行を指し示し時、古時計は賢者への捧げ物を落とすであろう。
          </div>
          <p style="font-size:0.82rem; color:#6e5227; text-align:right;">— 賢者の書斎録より</p>
        </div>
        <div style="text-align:center;">
          <button id="btn-back-to-desk" class="secondary-btn" style="font-size:0.85rem; padding:6px 18px;">机の調査に戻る</button>
        </div>
      </div>
    `;
    openModal('MANUSCRIPT / ASTRONOMY', '天体日誌の記述', html, (container) => {
      const btnBack = container.querySelector('#btn-back-to-desk');
      if (btnBack) {
        btnBack.onclick = () => {
          openDeskModal();
        };
      }
    });
  }

  // 2. ソファモーダル
  function openSofaModal() {
    let html = `<div style="text-align:center;">`;
    if (!state.sofaBoxFound) {
      html += `
        <p style="margin-bottom:14px;">革張りのソファだ。座面クッションの深い隙間を探ると、固い感触がある…</p>
        <button id="btn-search-sofa" class="primary-btn" style="max-width:260px; margin:0 auto;">隙間を調べて小箱を取り出す</button>
      `;
    } else {
      html += `
        <p style="color:#b2aba0;">座り心地のよいワインレッドの革張りソファだ。</p>
        <p style="color:#888; font-size:0.88rem; margin-top:8px;">クッションの隙間にはもう何もない。</p>
      `;
    }
    html += `</div>`;

    openModal('WEST / LEATHER SOFA', '高級革張りソファ', html, (container) => {
      const btn = container.querySelector('#btn-search-sofa');
      if (btn) {
        btn.onclick = () => {
          state.sofaBoxFound = true;
          addItem('music_box');
          openSofaModal();
        };
      }
    });
  }

  // 3. 絨毯モーダル
  function openCarpetModal() {
    let html = `<div style="text-align:center;">`;
    if (!state.carpetFlipped) {
      html += `
        <p style="margin-bottom:14px;">ペルシャ風の細密な絨毯だ。北東の角がわずかに浮いている。</p>
        <button id="btn-flip-carpet" class="primary-btn" style="max-width:240px; margin:0 auto;">絨毯の角をめくる</button>
      `;
    } else if (!state.hasScrewdriver) {
      html += `
        <p style="color:#58d68d; font-weight:bold; margin-bottom:10px;">★ 絨毯の角がめくれている ★</p>
        <p style="margin-bottom:14px;">床との隙間に細身のマイナスドライバーが隠されていた！</p>
        <button id="btn-take-driver" class="primary-btn" style="max-width:260px; margin:0 auto;">精密ドライバーを取る</button>
      `;
    } else {
      html += `
        <p style="color:#b2aba0;">角がめくられたペルシャ風絨毯だ。</p>
        <p style="color:#888; font-size:0.88rem; margin-top:8px;">床下にはもう何もない。</p>
      `;
    }
    html += `</div>`;

    openModal('WEST / PERSIAN CARPET', 'ペルシャ風絨毯', html, (container) => {
      const btnFlip = container.querySelector('#btn-flip-carpet');
      if (btnFlip) {
        btnFlip.onclick = () => {
          soundManager.playClick();
          state.carpetFlipped = true;
          openCarpetModal();
        };
      }
      const btnTake = container.querySelector('#btn-take-driver');
      if (btnTake) {
        btnTake.onclick = () => {
          state.hasScrewdriver = true;
          addItem('screwdriver');
          openCarpetModal();
        };
      }
    });
  }

  // 4. 絵画モーダル
  function openPaintingModal() {
    const isLightOn = state.isLightOn;
    let html = `
      <div style="text-align:center;">
        <div style="width:100%; max-width:300px; margin:0 auto 8px auto; border:4px solid var(--brass); border-radius:6px; overflow:hidden;">
    `;

    html += `
      <svg viewBox="0 0 280 210" style="display:block; width:100%; background:${isLightOn ? '#152238' : '#080d17'};">
        <polygon points="0,210 60,130 130,170 220,105 280,140 280,210" fill="#2c3e50"/>
        <circle cx="200" cy="75" r="34" fill="${isLightOn ? '#f9e79f' : '#85929e'}" opacity="0.95"/>
        <path d="M 185,210 L 185,120 L 200,45 L 215,120 L 215,210 Z" fill="#0b0e14"/>
        <text x="140" y="195" font-size="16" fill="#ecf0f1" font-family="Shippori Mincho, serif" text-anchor="middle" opacity="0.8">『星辰の夜』</text>
    `;

    if (!isLightOn) {
      html += `
        <line x1="45" y1="95" x2="95" y2="60" stroke="#5dade2" stroke-width="2.5" stroke-dasharray="4,4" />
        <line x1="95" y1="60" x2="145" y2="85" stroke="#5dade2" stroke-width="2.5" stroke-dasharray="4,4" />
        <line x1="145" y1="85" x2="245" y2="50" stroke="#5dade2" stroke-width="2.5" stroke-dasharray="4,4" />

        <circle cx="45" cy="95" r="6" fill="#eaf2f8" />
        <text x="45" y="82" font-size="11" fill="#aed6f1" text-anchor="middle" font-family="serif">白羊</text>

        <circle cx="95" cy="60" r="6" fill="#eaf2f8" />
        <text x="95" y="48" font-size="11" fill="#aed6f1" text-anchor="middle" font-family="serif">獅子</text>

        <circle cx="145" cy="85" r="6" fill="#eaf2f8" />
        <text x="145" y="72" font-size="11" fill="#aed6f1" text-anchor="middle" font-family="serif">天蠍</text>

        <circle cx="245" cy="50" r="6" fill="#eaf2f8" />
        <text x="245" y="38" font-size="11" fill="#aed6f1" text-anchor="middle" font-family="serif">射手</text>
      `;
    }

    html += `</svg></div>`;

    if (isLightOn) {
      html += `<p style="color:#b2aba0;">月夜の古塔が描かれた静謐な油絵《星辰の夜》だ。</p>`;
    } else {
      html += `
        <p style="color:#5dade2; font-weight:bold;">★ 暗闇の中で4つの星辰が青白く発光した！ ★</p>
        <p style="color:#d5cac0; font-size:0.9rem; margin-top:4px;">左から右へと結ばれる光の軌跡：【白羊 → 獅子 → 天蠍 → 射手】</p>
      `;
    }

    html += `</div>`;
    openModal('SOUTH / OIL PAINTING', '油絵『星辰の夜』', html);
  }

  // 5. 本棚モーダル
  function openBookshelfModal() {
    const books = [
      { id: 'aries', name: '白羊', bg: 'linear-gradient(180deg, #5c261e 0%, #3a150f 100%)' },
      { id: 'taurus', name: '金牛', bg: 'linear-gradient(180deg, #2d4030 0%, #152418 100%)' },
      { id: 'gemini', name: '双子', bg: 'linear-gradient(180deg, #4a3b2c 0%, #2a2016 100%)' },
      { id: 'cancer', name: '巨蟹', bg: 'linear-gradient(180deg, #512e5f 0%, #2e1738 100%)' },
      { id: 'leo', name: '獅子', bg: 'linear-gradient(180deg, #1b3d54 0%, #0c202e 100%)' },
      { id: 'scorpio', name: '天蠍', bg: 'linear-gradient(180deg, #194d2e 0%, #0d2b19 100%)' },
      { id: 'sagittarius', name: '射手', bg: 'linear-gradient(180deg, #5e4912 0%, #362908 100%)' }
    ];

    let html = `<div style="text-align:center;">`;

    if (!state.booksPuzzleSolved) {
      html += `
        <p style="margin-bottom:8px;">背表紙に星座名が刻まれた7冊の書物が並んでいる。</p>
        ${!state.isLightOn ? '<p style="font-size:0.82rem; color:#5dade2;">★ 暗闇の中で背表紙が青白く微かに発光している！</p>' : ''}

        <div class="bookshelf-row">
          ${books.map(b => `
            <button type="button" class="puzzle-book-btn ${!state.isLightOn ? 'glow' : ''}" data-symbol="${b.id}" style="background:${b.bg};">
              <span class="book-title-spine">${b.name}</span>
            </button>
          `).join('')}
        </div>

        <div style="font-size:0.88rem; color:var(--brass-bright); height:24px; margin-bottom:12px;">
          押した順: ${state.booksSequence.map(id => books.find(b => b.id === id).name).join(' → ') || '（未選択）'}
        </div>

        <button id="btn-reset-books" class="secondary-btn" style="padding:6px 16px; font-size:0.82rem;">並び順をやり直す</button>
      `;
    } else {
      html += `
        <div style="background:#17202a; border:2px solid #5dade2; border-radius:8px; padding:18px;">
          <p style="color:#58d68d; font-weight:bold; font-size:1.05rem; margin-bottom:6px;">★ 仕掛けが作動し、本棚が横にスライドした！ ★</p>
          <p style="color:#eaf2f8; font-size:0.92rem;">背後の壁から頑丈な「壁金庫」が露出している。</p>
        </div>
      `;
    }
    html += `</div>`;

    openModal('EAST / BOOKSHELF', '本棚の蔵書', html, (container) => {
      if (!state.booksPuzzleSolved) {
        container.querySelectorAll('.puzzle-book-btn').forEach(btn => {
          btn.onclick = () => {
            const sym = btn.getAttribute('data-symbol');
            soundManager.playClick();
            if (state.booksSequence.length < 4) {
              state.booksSequence.push(sym);
              openBookshelfModal();

              if (state.booksSequence.length === 4) {
                const correct = ['aries', 'leo', 'scorpio', 'sagittarius'];
                const isMatch = state.booksSequence.every((val, i) => val === correct[i]);
                if (isMatch) {
                  soundManager.playSolved();
                  state.booksPuzzleSolved = true;
                  if (bookshelfMeshGroup) {
                    bookshelfMeshGroup.position.z = 1.3;
                  }
                  // 金庫の前までプレイヤーが近づけるよう障害物ボックスを更新
                  const obsIdx = obstacleBoxes.findIndex(b => b.minX === 3.9 && b.minZ === 0.0);
                  if (obsIdx !== -1) {
                    obstacleBoxes[obsIdx] = { minX: 3.9, maxX: 5.0, minZ: 1.3, maxZ: 3.7 };
                  }
                  setMessage('ゴゴゴ…！ 本棚が横にスライドし、壁から真鍮の金庫が現れた！');
                  setTimeout(openBookshelfModal, 500);
                } else {
                  soundManager.playClick();
                  setMessage('カチャ…何も反応しない。押した順序が違うようだ。');
                  setTimeout(() => {
                    state.booksSequence = [];
                    openBookshelfModal();
                  }, 800);
                }
              }
            }
          };
        });

        const btnReset = container.querySelector('#btn-reset-books');
        if (btnReset) {
          btnReset.onclick = () => {
            soundManager.playClick();
            state.booksSequence = [];
            openBookshelfModal();
          };
        }
      }
    });
  }

  // 6. 壁金庫モーダル
  function openSafeModal() {
    let html = `<div style="text-align:center;">`;

    if (!state.safeDiscInserted) {
      html += `
        <p style="margin-bottom:12px;">金庫の中央に円形の窪みがある。何か丸いプレートを嵌め込めそうだ。</p>
        <div style="width:80px; height:80px; margin:6px auto; background:#1b2028; border:3px dashed var(--brass); border-radius:50%; display:flex; align-items:center; justify-content:center; color:#888;">
          円盤スロット
        </div>
        ${getItemPickerHtml('スロットにはめるアイテムを選んでください')}
      `;
    } else if (!state.safeUnlocked) {
      html += `
        <p style="margin-bottom:12px;">円盤がはまった。タップして回転させることができる。</p>
        <div class="safe-rotator-container">
          <svg class="safe-disc-interactive" id="btn-rotate-safe-disc" viewBox="0 0 40 40" style="transform: rotate(${state.safeAngle}deg);">
            <circle cx="20" cy="20" r="18" fill="#1b2631" stroke="#f1c40f" stroke-width="3"/>
            <polygon points="20,7 23,15 31,15 25,20 27,28 20,23 13,28 15,20 9,15 17,15" fill="#f1c40f"/>
            <circle cx="20" cy="20" r="3" fill="#1b2631"/>
          </svg>
          <span style="font-size:0.85rem; color:var(--brass-bright);">現在角度: ${state.safeAngle}度</span>
          <button id="btn-unlock-safe" class="primary-btn" style="max-width:240px;">解錠レバーを引く</button>
        </div>
      `;
    } else {
      html += `
        <div style="background:#131822; border:1px solid var(--brass); border-radius:8px; padding:18px;">
          <p style="color:#58d68d; font-weight:bold; font-size:1.1rem; margin-bottom:6px;">★ 金庫が解錠された！ ★</p>
          <p style="color:#b2aba0; font-size:0.85rem;">金庫の奥に保管されていた羊皮紙の暗号コード：</p>
          <div class="safe-code-display">3928</div>
      `;

      if (!state.hasArmillaryPin) {
        html += `
          <div style="margin-top:14px; border-top:1px dashed rgba(202,168,106,0.4); padding-top:12px;">
            <p style="font-size:0.9rem; color:var(--brass-bright); margin-bottom:10px;">暗号書の脇に小さな真鍮ピンが落ちている！</p>
            <button id="btn-take-pin" class="primary-btn" style="max-width:260px; margin:0 auto;">星型の真鍮ピンを取る</button>
          </div>
        `;
      } else {
        html += `
          <div style="background:rgba(202,168,106,0.18); border:1.5px solid var(--accent-gold); border-radius:8px; padding:10px 14px; margin:10px auto; max-width:380px; box-shadow:0 0 16px rgba(241,196,15,0.25);">
            <p style="color:#ffd700; font-weight:bold; font-size:1.0rem; margin-bottom:2px;">★【星辰の固定ピン】を入手しました！★</p>
            <p style="color:#ffffff; font-size:0.84rem;">頭部に星の意匠が施されたピンだ。</p>
          </div>
          <p style="color:#aaa; font-size:0.85rem; margin-top:6px;">ピンは回収済みだ。</p>
        `;
      }
      html += `</div>`;
    }

    html += `</div>`;

    openModal('EAST / HIDDEN SAFE', '本棚奥の壁金庫', html, (container) => {
      if (!state.safeDiscInserted) {
        container.querySelectorAll('.item-picker-btn').forEach(btn => {
          btn.onclick = () => {
            const itemId = btn.getAttribute('data-item-id');
            if (itemId === 'star_disc') {
              soundManager.playUnlock();
              state.safeDiscInserted = true;
              removeItem('star_disc');
              setMessage('カチリ！ 星座の円盤が金庫のシリンダーにぴったりとはまった！');
              openSafeModal();
            } else {
              soundManager.playClick();
              setMessage('このアイテムはスロットの形に合わない。');
            }
          };
        });
      } else if (!state.safeUnlocked) {
        const discBtn = container.querySelector('#btn-rotate-safe-disc');
        if (discBtn) {
          discBtn.onclick = () => {
            soundManager.playTick();
            state.safeAngle = (state.safeAngle + 90) % 360;
            openSafeModal();
          };
        }
        const btnUnlock = container.querySelector('#btn-unlock-safe');
        if (btnUnlock) {
          btnUnlock.onclick = () => {
            if (state.safeAngle === 0) {
              soundManager.playSolved();
              state.safeUnlocked = true;
              setMessage('ガチャリ！ 重厚なシリンダーが解放され、暗号メモが現れた！');
              openSafeModal();
            } else {
              soundManager.playClick();
              setMessage('レバーが重くて動かない。シリンダーが噛み合っていないようだ。');
            }
          };
        }
      } else {
        const btnTakePin = container.querySelector('#btn-take-pin');
        if (btnTakePin) {
          btnTakePin.onclick = () => {
            state.hasArmillaryPin = true;
            addItem('armillary_pin');
            openSafeModal();
          };
        }
      }
    });
  }

  // 7. 天球儀モーダル
  function openArmillaryModal() {
    let html = `<div style="text-align:center;">`;

    if (!state.armillaryPinInserted) {
      html += `
        <p style="margin-bottom:12px;">細密な真鍮リングで構成された天球儀だ。軸の根元が「星型の穴」でピン留めされロックされている。</p>
        <div style="width:90px; height:90px; margin:6px auto; display:flex; align-items:center; justify-content:center;">
          <svg viewBox="0 0 100 100" style="width:100%; height:100%;">
            <circle cx="50" cy="50" r="42" fill="none" stroke="#b78727" stroke-width="3"/>
            <ellipse cx="50" cy="50" rx="42" ry="16" fill="none" stroke="#f1c40f" stroke-width="2.5" transform="rotate(-30 50 50)"/>
            <circle cx="50" cy="50" r="10" fill="#1b120c" stroke="#d4af37" stroke-width="2"/>
            <polygon points="50,45 52,48 56,48 53,50 54,54 50,52 46,54 47,50 44,48 48,48" fill="#f1c40f"/>
          </svg>
        </div>
        ${getItemPickerHtml('ロック穴に使うアイテムを選んでください')}
      `;
    } else if (!state.armillaryOpened) {
      html += `
        <p style="margin-bottom:12px;">星型ピンでロックが解除された。リングをタップして回転させることができる。</p>
        <div style="display:flex; flex-direction:column; align-items:center; gap:8px; margin:8px 0;">
          <svg id="btn-rotate-armillary" viewBox="0 0 100 100" style="width:110px; height:110px; cursor:pointer; transform:rotate(${state.armillaryAngle}deg); transition:transform 0.25s ease;">
            <circle cx="50" cy="50" r="42" fill="none" stroke="#b78727" stroke-width="3"/>
            <ellipse cx="50" cy="50" rx="42" ry="16" fill="none" stroke="#f1c40f" stroke-width="3"/>
            <polygon points="50,6 45,14 55,14" fill="#3498db" stroke="#2980b9" stroke-width="1"/>
            <circle cx="50" cy="50" r="6" fill="#f39c12"/>
          </svg>
          <span style="font-size:0.85rem; color:var(--brass-bright);">現在角度: ${state.armillaryAngle}度</span>
          <button id="btn-open-armillary" class="primary-btn" style="max-width:240px;">天球儀を開く</button>
        </div>
      `;
    } else {
      html += `
        <div style="background:#131822; border:1px solid var(--brass); border-radius:8px; padding:18px;">
          <p style="color:#c89b3c; font-weight:bold; font-size:1.05rem; margin-bottom:8px;">★ 天球儀の機構が解放された ★</p>
          <p style="color:#eaf2f8; font-size:0.92rem;">内部の空洞から「真鍮の火かき棒」を取り出した！</p>
        </div>
      `;
    }

    html += `</div>`;

    openModal('WEST / ARMILLARY SPHERE', '真鍮の天球儀', html, (container) => {
      if (!state.armillaryPinInserted) {
        container.querySelectorAll('.item-picker-btn').forEach(btn => {
          btn.onclick = () => {
            const itemId = btn.getAttribute('data-item-id');
            if (itemId === 'armillary_pin') {
              soundManager.playUnlock();
              state.armillaryPinInserted = true;
              removeItem('armillary_pin');
              setMessage('カチリ！ 星型の真鍮ピンが吸い込まれるように嵌り、ロックが解除された！');
              openArmillaryModal();
            } else {
              soundManager.playClick();
              setMessage('このアイテムはロック穴に合わない。');
            }
          };
        });
      } else if (!state.armillaryOpened) {
        const rotBtn = container.querySelector('#btn-rotate-armillary');
        if (rotBtn) {
          rotBtn.onclick = () => {
            soundManager.playTick();
            state.armillaryAngle = (state.armillaryAngle + 45) % 360;
            openArmillaryModal();
          };
        }
        const openBtn = container.querySelector('#btn-open-armillary');
        if (openBtn) {
          openBtn.onclick = () => {
            if (state.armillaryAngle === 0) {
              soundManager.playSolved();
              state.armillaryOpened = true;
              setMessage('ガシャリ！ 天球儀の球体が開き、「真鍮の火かき棒」が現れた！');
              setTimeout(() => {
                addItem('poker');
                openArmillaryModal();
              }, 400);
            } else {
              soundManager.playClick();
              setMessage('まだ球体が固定されている。角度が合っていないようだ。');
            }
          };
        }
      }
    });
  }

  // 8. 暖炉モーダル
  function openFireplaceModal() {
    let html = `<div style="text-align:center;">`;

    if (!state.fireplaceGrilleRemoved) {
      html += `
        <p style="margin-bottom:12px;">火室の手前に頑丈な鉄格子がはまっており奥に手が届かない。フックのついた道具があれば外せそうだ。</p>
        <div style="width:120px; height:65px; margin:6px auto; background:#1b1c1e; border:3px solid #34495e; border-radius:6px; display:flex; align-items:center; justify-content:center;">
          <div style="width:100%; height:100%; background:repeating-linear-gradient(90deg, transparent, transparent 16px, #34495e 16px, #34495e 22px);"></div>
        </div>
        ${getItemPickerHtml('鉄格子に使うアイテムを選んでください')}
      `;
    } else if (!state.hasEmblem) {
      html += `
        <p style="color:#58d68d; font-weight:bold; margin-bottom:10px;">★ 鉄格子が外れた！ ★</p>
        <p style="margin-bottom:16px;">灰の中に何か光る金属が埋もれている。</p>
        <button id="btn-take-emblem" class="primary-btn" style="max-width:280px; margin:0 auto;">灰の中から光るメダルを拾い上げる</button>
      `;
    } else {
      html += `
        <div style="background:rgba(202,168,106,0.18); border:1.5px solid var(--accent-gold); border-radius:8px; padding:12px; margin-bottom:14px; box-shadow:0 0 16px rgba(241,196,15,0.25);">
          <p style="color:#ffd700; font-weight:bold; font-size:1.05rem; margin-bottom:4px;">★【青玉の紋章メダル】を入手しました！★</p>
          <p style="color:#ffffff; font-size:0.86rem;">所持品バーに収められました。壊れた鍵の頭部と結合できそうだ。</p>
        </div>
        <p style="color:#b2aba0;">鉄格子が外された暖炉の火室だ。</p>
        <p style="color:#aaa; font-size:0.88rem; margin-top:6px;">灰の中はもう探り尽くした。</p>
      `;
    }

    html += `</div>`;

    openModal('SOUTH / FIREPLACE', '暖炉の火室', html, (container) => {
      if (!state.fireplaceGrilleRemoved) {
        container.querySelectorAll('.item-picker-btn').forEach(btn => {
          btn.onclick = () => {
            const itemId = btn.getAttribute('data-item-id');
            if (itemId === 'poker') {
              soundManager.playUnlock();
              state.fireplaceGrilleRemoved = true;
              setMessage('ガシャン！ 火かき棒を引っ掛けて重い鉄格子を外した！');
              openFireplaceModal();
            } else {
              soundManager.playClick();
              setMessage('この道具では鉄格子を外せない。');
            }
          };
        });
      } else if (!state.hasEmblem) {
        const btnTake = container.querySelector('#btn-take-emblem');
        if (btnTake) {
          btnTake.onclick = () => {
            state.hasEmblem = true;
            addItem('emblem');
            openFireplaceModal();
          };
        }
      }
    });
  }

  // 9. 古時計モーダル
  function openClockModal() {
    const hourAngle = (state.clockHour % 12) * 30 + (state.clockMinute / 60) * 30;
    const minuteAngle = state.clockMinute * 6;

    const cx = 90;
    const cy = 90;
    const hourRad = (hourAngle - 90) * Math.PI / 180;
    const minRad = (minuteAngle - 90) * Math.PI / 180;

    const hx2 = (cx + 34 * Math.cos(hourRad)).toFixed(1);
    const hy2 = (cy + 34 * Math.sin(hourRad)).toFixed(1);
    const mx2 = (cx + 54 * Math.cos(minRad)).toFixed(1);
    const my2 = (cy + 54 * Math.sin(minRad)).toFixed(1);

    const isDark = !state.isLightOn;
    const dialFillOuter = isDark ? '#0d1e2e' : '#fdfbf7';
    const dialFillInner = isDark ? '#10263a' : '#f4ebd9';
    const dialStrokeOuter = isDark ? '#5dade2' : '#8c6a3e';
    const dialStrokeInner = isDark ? '#5dade2' : '#b89344';
    const numColor = isDark ? '#aed6f1' : '#333';
    const hourHandColor = isDark ? '#eaf2f8' : '#2c3e50';
    const minHandColor = isDark ? '#5dade2' : '#b03a2e';

    let html = `
      <div class="clock-display-container">
        <svg class="clock-svg-box" viewBox="0 0 180 180" style="${isDark ? 'filter: drop-shadow(0 0 10px rgba(93, 173, 226, 0.55));' : ''}">
          <circle cx="90" cy="90" r="82" fill="${dialFillOuter}" stroke="${dialStrokeOuter}" stroke-width="7"/>
          <circle cx="90" cy="90" r="75" fill="${dialFillInner}" stroke="${dialStrokeInner}" stroke-width="2"/>
          <text x="90" y="36" font-size="16" font-family="serif" text-anchor="middle" fill="${numColor}" font-weight="bold">12</text>
          <text x="150" y="96" font-size="16" font-family="serif" text-anchor="middle" fill="${numColor}" font-weight="bold">3</text>
          <text x="90" y="156" font-size="16" font-family="serif" text-anchor="middle" fill="${numColor}" font-weight="bold">6</text>
          <text x="30" y="96" font-size="16" font-family="serif" text-anchor="middle" fill="${numColor}" font-weight="bold">9</text>

          <line x1="90" y1="90" x2="${hx2}" y2="${hy2}" stroke="${hourHandColor}" stroke-width="5" stroke-linecap="round"/>
          <line x1="90" y1="90" x2="${mx2}" y2="${my2}" stroke="${minHandColor}" stroke-width="3" stroke-linecap="round"/>
          <circle cx="90" cy="90" r="5" fill="${dialStrokeOuter}"/>
        </svg>
    `;

    if (!state.clockPuzzleSolved) {
      html += `
        <div class="clock-time-digital">
          ${String(state.clockHour).padStart(2, '0')}:${String(state.clockMinute).padStart(2, '0')}
        </div>
        <div class="clock-btn-row" style="margin-bottom:8px;">
          <button id="btn-clock-hour-minus" class="secondary-btn" style="flex:1;">-1 時間</button>
          <button id="btn-clock-hour-plus" class="secondary-btn" style="flex:1;">+1 時間</button>
        </div>
        <div class="clock-btn-row">
          <button id="btn-clock-min-minus" class="secondary-btn" style="flex:1;">-15 分</button>
          <button id="btn-clock-min-plus" class="secondary-btn" style="flex:1;">+15 分</button>
        </div>
        <p style="color:#b2aba0; font-size:0.85rem; text-align:center; margin-top:10px;">
          文字盤の針は手動で動かせそうだ。
        </p>
      `;
    } else {
      html += `
        <div style="text-align:center;">
          <p style="color:#58d68d; font-weight:bold; margin-bottom:8px;">★ 9時15分でからくりが作動した ★</p>
      `;
      if (!state.hasBrokenKey) {
        html += `
          <p style="margin-bottom:12px;">振り子室の底から真鍮の鍵身が落ちてきた！</p>
          <button id="btn-take-broken-key" class="primary-btn" style="max-width:240px; margin:0 auto;">鍵身を拾い上げる</button>
        `;
      } else {
        html += `
          <div style="background:rgba(202,168,106,0.18); border:1.5px solid var(--accent-gold); border-radius:8px; padding:10px 14px; margin:12px auto; max-width:380px; box-shadow:0 0 16px rgba(241,196,15,0.25);">
            <p style="color:#ffd700; font-weight:bold; font-size:1.0rem; margin-bottom:2px;">★【壊れた賢者の鍵】を入手しました！★</p>
            <p style="color:#ffffff; font-size:0.84rem;">頭部の紋章が欠けている。適合する紋章パーツと結合できそうだ。</p>
          </div>
          <p style="color:#aaa; font-size:0.85rem; margin-top:6px;">パーツは回収済みだ。</p>
        `;
      }
      html += `</div>`;
    }

    html += `</div>`;

    openModal('NORTH / ANTIQUE CLOCK', '壁掛けの古時計', html, (container) => {
      if (!state.clockPuzzleSolved) {
        const btnHourPlus = container.querySelector('#btn-clock-hour-plus');
        const btnHourMinus = container.querySelector('#btn-clock-hour-minus');
        const btnMinPlus = container.querySelector('#btn-clock-min-plus');
        const btnMinMinus = container.querySelector('#btn-clock-min-minus');

        if (btnHourPlus) {
          btnHourPlus.onclick = () => {
            soundManager.playTick();
            state.clockHour = (state.clockHour + 1) % 12;
            checkClockSolution();
          };
        }
        if (btnHourMinus) {
          btnHourMinus.onclick = () => {
            soundManager.playTick();
            state.clockHour = (state.clockHour + 11) % 12;
            checkClockSolution();
          };
        }
        if (btnMinPlus) {
          btnMinPlus.onclick = () => {
            soundManager.playTick();
            state.clockMinute += 15;
            if (state.clockMinute >= 60) {
              state.clockMinute -= 60;
              state.clockHour = (state.clockHour + 1) % 12; // 分の繰り上がりで時間を自動連動
            }
            checkClockSolution();
          };
        }
        if (btnMinMinus) {
          btnMinMinus.onclick = () => {
            soundManager.playTick();
            state.clockMinute -= 15;
            if (state.clockMinute < 0) {
              state.clockMinute += 60;
              state.clockHour = (state.clockHour + 11) % 12; // 分の繰り下がりで時間を自動連動
            }
            checkClockSolution();
          };
        }
      } else {
        const btnTake = container.querySelector('#btn-take-broken-key');
        if (btnTake) {
          btnTake.onclick = () => {
            state.hasBrokenKey = true;
            addItem('broken_key');
            openClockModal();
          };
        }
      }
    });
  }

  function checkClockSolution() {
    updateClockHands3D(); // 3D空間の壁掛け時計の針をリアルタイム連動
    if (!state.clockPuzzleSolved && state.clockHour % 12 === 9 && state.clockMinute === 15) {
      soundManager.playSolved();
      state.clockPuzzleSolved = true;
      setMessage('ガチャン！ 時計の中から重厚な金属パーツが落ちてきた！');
    }
    openClockModal();
  }

  // 10. 照明スイッチ盤モーダル
  function openSwitchModal() {
    let html = `<div style="text-align:center;">`;

    if (!state.switchCoverUnlocked) {
      html += `
        <p style="margin-bottom:14px;">大扉の左横にある頑丈な照明端子盤だ。真鍮の鍵穴でカバーが施錠されている。</p>
        <div style="width:90px; height:55px; margin:6px auto; background:#2b303c; border:2px solid var(--brass); border-radius:6px; display:flex; align-items:center; justify-content:center;">
          <span style="display:inline-flex; color:var(--brass-bright);">${UI_ICONS.lockClosed}</span>
        </div>
        ${getItemPickerHtml('カバーの鍵穴に使う鍵を選んでください')}
      `;
    } else {
      html += `
        <p style="margin-bottom:14px;">端子盤のカバーが開き、部屋全体の主電源スイッチが露出している。</p>
        <div style="margin:10px 0;">
          <button id="btn-toggle-light" class="primary-btn" style="max-width:280px; margin:0 auto; font-size:1.05rem;">
            ${state.isLightOn ? UI_ICONS.bulb + '部屋の明かりを消す (OFF)' : UI_ICONS.bulb + '部屋の明かりをつける (ON)'}
          </button>
        </div>
      `;
    }

    html += `</div>`;

    openModal('NORTH / POWER PANEL', '照明スイッチ盤', html, (container) => {
      if (!state.switchCoverUnlocked) {
        container.querySelectorAll('.item-picker-btn').forEach(btn => {
          btn.onclick = () => {
            const itemId = btn.getAttribute('data-item-id');
            if (itemId === 'switch_key') {
              soundManager.playUnlock();
              state.switchCoverUnlocked = true;
              removeItem('switch_key');
              setMessage('カチリ！ 端子盤のカバーが開き、照明スイッチが現れた！');
              openSwitchModal();
            } else {
              soundManager.playClick();
              setMessage('この鍵では合わないようだ。');
            }
          };
        });
      } else {
        const btnToggle = container.querySelector('#btn-toggle-light');
        if (btnToggle) {
          btnToggle.onclick = () => {
            soundManager.playSwitch();
            state.isLightOn = !state.isLightOn;
            updateLightingState();
            if (!state.isLightOn) {
              setMessage('カチッ…部屋の明かりが消灯した。');
            } else {
              setMessage('カチッ…部屋の明かりが点灯した。');
            }
            openSwitchModal();
          };
        }
      }
    });
  }

  // 11. 脱出の大扉モーダル
  function openDoorModal() {
    let html = `
      <div>
        <p style="text-align:center; color:#b2aba0; font-size:0.9rem; margin-bottom:14px;">
          室外へ続く重厚な大扉だ。重厚な鍵穴と4桁の電子ダイヤルが組み合わされているようだ。
        </p>

        <div class="door-locks-grid">
          <div class="lock-card">
            <span class="lock-card-title">1. 賢者の鍵穴</span>
            <div style="display:flex; align-items:center; justify-content:center; height:32px; color:${state.doorKeyUnlocked ? '#58d68d' : 'var(--brass-bright)'};">
              ${state.doorKeyUnlocked ? UI_ICONS.lockOpen : UI_ICONS.lockClosed}
            </div>
            <span style="font-size:0.82rem; font-weight:bold; color:${state.doorKeyUnlocked ? '#58d68d' : '#e74c3c'};">
              ${state.doorKeyUnlocked ? '解錠済み' : '施錠中'}
            </span>
          </div>

          <div class="lock-card">
            <span class="lock-card-title">2. 電子ダイヤル錠 (4桁)</span>
            <div class="dials-row">
              ${state.doorCode.map((val, idx) => `
                <div class="dial-column">
                  <button type="button" class="dial-step-btn" data-action="up" data-idx="${idx}">▲</button>
                  <div class="dial-digit-val">${val}</div>
                  <button type="button" class="dial-step-btn" data-action="down" data-idx="${idx}">▼</button>
                </div>
              `).join('')}
            </div>
            <span style="font-size:0.82rem; font-weight:bold; color:${state.doorCodeUnlocked ? '#58d68d' : '#e74c3c'};">
              ${state.doorCodeUnlocked ? '認証成功' : 'コード未照合'}
            </span>
          </div>
        </div>
    `;

    if (!state.doorKeyUnlocked) {
      html += getItemPickerHtml('鍵穴に使う鍵を選んでください');
    }

    html += `
        <div style="margin-top:10px;">
          <button id="btn-escape-door" class="primary-btn">大扉を開いて脱出する</button>
        </div>
      </div>
    `;

    openModal('NORTH / EXIT DOOR', '脱出の大扉', html, (container) => {
      if (!state.doorKeyUnlocked) {
        container.querySelectorAll('.item-picker-btn').forEach(btn => {
          btn.onclick = () => {
            const itemId = btn.getAttribute('data-item-id');
            if (itemId === 'brass_key') {
              soundManager.playUnlock();
              state.doorKeyUnlocked = true;
              removeItem('brass_key');
              setMessage('ガチャリ！ 賢者の真鍮鍵が大扉のシリンダーを完全に解錠した！');
              openDoorModal();
            } else {
              soundManager.playClick();
              setMessage('この鍵では大扉の鍵穴に合わない。');
            }
          };
        });
      }

      container.querySelectorAll('.dial-step-btn').forEach(btn => {
        btn.onclick = () => {
          soundManager.playTick();
          const idx = parseInt(btn.getAttribute('data-idx'), 10);
          const act = btn.getAttribute('data-action');
          if (act === 'up') {
            state.doorCode[idx] = (state.doorCode[idx] + 1) % 10;
          } else {
            state.doorCode[idx] = (state.doorCode[idx] + 9) % 10;
          }

          const codeStr = state.doorCode.join('');
          state.doorCodeUnlocked = (codeStr === '3928');
          openDoorModal();
        };
      });

      const btnEscape = container.querySelector('#btn-escape-door');
      if (btnEscape) {
        btnEscape.onclick = () => {
          const codeStr = state.doorCode.join('');
          if (!state.doorKeyUnlocked && codeStr !== '3928') {
            soundManager.playClick();
            setMessage('鍵穴も暗証番号も解除されていない！');
          } else if (!state.doorKeyUnlocked) {
            soundManager.playClick();
            setMessage('電子暗証は合っているが、賢者の真鍮鍵で鍵穴を解錠しなければ開かない！');
          } else if (codeStr !== '3928') {
            soundManager.playClick();
            setMessage('鍵穴は開いたが、電子暗証番号（4桁）が正しくない！');
          } else {
            triggerStageClear();
          }
        };
      }
    });
  }

  // --- アイテム詳細モーダル（調べる・分解・合成） ---
  function openItemDetailModal(itemId) {
    const item = ITEMS[itemId];
    if (!item) return;

    document.body.classList.add('modal-open');

    detailedItemId = itemId;
    activeModal = itemDetailModal;

    itemDetailName.textContent = item.name;
    itemDetailIconLarge.innerHTML = item.icon;
    itemDetailDesc.textContent = item.desc;

    itemDetailActionContainer.classList.add('hidden');
    btnItemAction.onclick = null;

    if (itemId === 'music_box') {
      itemDetailActionContainer.classList.remove('hidden');
      btnItemAction.textContent = '精密ドライバーでネジを外す';
      btnItemAction.onclick = handleDisassembleBox;
    } else if (itemId === 'broken_key') {
      itemDetailActionContainer.classList.remove('hidden');
      btnItemAction.textContent = '賢者の青玉紋章と結合する';
      btnItemAction.onclick = handleAssembleKey;
    }

    itemDetailModal.classList.remove('hidden');
    if (controls.isLocked) {
      controls.unlock();
    }
  }

  function closeItemDetailModal(lockControls = true) {
    if (!itemDetailModal) return;
    document.body.classList.remove('modal-open');
    itemDetailModal.classList.add('hidden');
    activeModal = null;
    soundManager.playClick();
    if (lockControls && isGameStarted && menuScreen.classList.contains('hidden') && !state.gameCleared) {
      controls.lock();
    }
  }

  function handleDisassembleBox() {
    if (state.inventory.some(i => i.id === 'screwdriver')) {
      soundManager.playScrewdriver();
      removeItem('music_box');
      state.boxDisassembled = true;
      closeItemDetailModal(false);

      setTimeout(() => {
        addItem('silver_key');
        setTimeout(() => {
          addItem('star_disc');
          setMessage('ドライバーでネジを外すと、中から「銀の鍵」と「星座の円盤」が現れた！');
          controls.lock();
        }, 500);
      }, 300);
    } else {
      soundManager.playClick();
      alert('4隅のネジが固く締まっている。小さなマイナスドライバーが必要だ。');
    }
  }

  function handleAssembleKey() {
    if (state.inventory.some(i => i.id === 'emblem')) {
      soundManager.playSolved();
      removeItem('broken_key');
      removeItem('emblem');
      state.keyAssembled = true;
      closeItemDetailModal(false);

      setTimeout(() => {
        addItem('brass_key');
        setMessage('カチリ！ 鍵身に青玉の紋章が吸い込まれるように結合し、「賢者の真鍮鍵」が完成した！');
        controls.lock();
      }, 400);
    } else {
      soundManager.playClick();
      alert('鍵の頭部に適合する円形パーツ（紋章）が必要だ。');
    }
  }

  // --- 脱出成功演出 ---
  function triggerStageClear() {
    state.gameCleared = true;
    closeModal();

    soundManager.playClear();
    setMessage('ギギギ…！ 二重ロックが解除され、書斎の重厚な大扉が開いた！');

    if (doorPivotGroup) {
      const startRot = doorPivotGroup.rotation.y;
      const targetRot = -Math.PI / 2;
      const duration = 1800;
      const startTime = performance.now();

      if (exitHallGroup) {
        exitHallGroup.visible = true; // 扉開放開始時に出口回廊を可視化
      }

      function animateDoorOpen(now) {
        const progress = Math.min((now - startTime) / duration, 1.0);
        doorPivotGroup.rotation.y = startRot + (targetRot - startRot) * Math.sin(progress * Math.PI / 2);

        // 扉の開き具合に合わせて神々しい逆光ライトを徐々にフェードイン (0 -> 4.0)
        if (exitSunLight) {
          exitSunLight.intensity = progress * 4.0;
        }

        if (progress < 1.0) {
          requestAnimationFrame(animateDoorOpen);
        } else {
          showClearModal();
        }
      }
      requestAnimationFrame(animateDoorOpen);
    } else {
      showClearModal();
    }
  }

  function showClearModal() {
    document.body.classList.remove('modal-open');
    state.gameCleared = true;
    clearMessage();
    const elapsed = Math.floor((Date.now() - state.startTime) / 1000);
    const m = String(Math.floor(elapsed / 60)).padStart(2, '0');
    const s = String(elapsed % 60).padStart(2, '0');
    clearTimeEl.textContent = `${m}:${s}`;

    // メインメニューのステージ1カードのステータス更新
    if (stage1Badge) {
      stage1Badge.textContent = 'CLEARED';
      stage1Badge.classList.add('cleared');
    }
    if (stage1Meta) {
      stage1Meta.textContent = `クリア済み (タイム: ${m}:${s})`;
    }
    if (btnPlayStage1) {
      btnPlayStage1.textContent = 'もう一度遊ぶ';
    }
    if (btnRestartStage1) {
      btnRestartStage1.style.display = 'none';
    }

    soundManager.playDoorOpen();

    activeModal = clearModal;
    clearModal.classList.remove('hidden');
    if (controls.isLocked) {
      controls.unlock();
    }
  }

  // --- 衝突・境界判定 ---
  function resolveCollisions(nextPos, currentPos) {
    nextPos.x = Math.max(-ROOM.wallBoundary, Math.min(ROOM.wallBoundary, nextPos.x));
    nextPos.z = Math.max(-ROOM.wallBoundary, Math.min(ROOM.wallBoundary, nextPos.z));

    const r = PLAYER.radius;
    for (const box of obstacleBoxes) {
      const minX = box.minX - r;
      const maxX = box.maxX + r;
      const minZ = box.minZ - r;
      const maxZ = box.maxZ + r;

      if (nextPos.x > minX && nextPos.x < maxX && nextPos.z > minZ && nextPos.z < maxZ) {
        const canMoveX = !(nextPos.x > minX && nextPos.x < maxX && currentPos.z > minZ && currentPos.z < maxZ);
        const canMoveZ = !(currentPos.x > minX && currentPos.x < maxX && nextPos.z > minZ && nextPos.z < maxZ);

        if (canMoveX) {
          nextPos.z = currentPos.z;
        } else if (canMoveZ) {
          nextPos.x = currentPos.x;
        } else {
          nextPos.x = currentPos.x;
          nextPos.z = currentPos.z;
        }
      }
    }
  }

  // --- Raycaster 照準判定 ---
  const raycaster = new THREE.Raycaster();
  const screenCenter = new THREE.Vector2(0, 0);

  function updateRaycast() {
    if (!controls.isLocked || activeModal) {
      clearHover();
      return;
    }

    raycaster.setFromCamera(screenCenter, camera);
    raycaster.far = PLAYER.interactDistance;

    const hits = raycaster.intersectObjects(interactables, false);
    if (hits.length > 0) {
      const root = hits[0].object.userData.interactiveRoot;
      if (root && root.userData.isInteractiveRoot) {
        setHover(root);
        return;
      }
    }
    clearHover();
  }

  function setHover(root) {
    if (hoveredObject === root) return;
    hoveredObject = root;
    crosshair.classList.add('active');
    targetHintText.textContent = root.userData.name;
    targetHint.classList.remove('hidden');
  }

  function clearHover() {
    if (!hoveredObject) return;
    hoveredObject = null;
    crosshair.classList.remove('active');
    targetHint.classList.add('hidden');
  }

  function updateCompassHUD() {
    const dir = new THREE.Vector3();
    camera.getWorldDirection(dir);
    const angle = Math.atan2(dir.x, -dir.z) * (180 / Math.PI);
    let compass = '北 (脱出の大扉)';
    if (angle > 45 && angle <= 135) {
      compass = '東 (書斎机・本棚)';
    } else if (angle > 135 || angle <= -135) {
      compass = '南 (絵画・暖炉)';
    } else if (angle > -135 && angle <= -45) {
      compass = '西 (革張りソファ・天球儀)';
    }
    hudCompass.textContent = `方位: ${compass}`;
  }

  // --- メインメニュー & 設定モーダル関数 ---
  function resetGameAndPlay() {
    // 1. state を初期化
    state.isLightOn = true;
    state.switchCoverUnlocked = false;
    state.carpetFlipped = false;
    state.hasScrewdriver = false;
    state.sofaBoxFound = false;
    state.boxDisassembled = false;
    state.drawerUnlocked = false;
    state.hasSwitchKey = false;
    state.hasPoker = false;
    state.fireplaceGrilleRemoved = false;
    state.hasEmblem = false;
    state.booksSequence = [];
    state.booksPuzzleSolved = false;
    state.safeDiscInserted = false;
    state.safeAngle = 90;
    state.safeUnlocked = false;
    state.hasArmillaryPin = false;
    state.armillaryPinInserted = false;
    state.armillaryAngle = 90;
    state.armillaryOpened = false;
    state.clockHour = 0;
    state.clockMinute = 0;
    state.clockPuzzleSolved = false;
    state.hasBrokenKey = false;
    state.keyAssembled = false;
    state.doorCode = [0, 0, 0, 0];
    state.doorKeyUnlocked = false;
    state.doorCodeUnlocked = false;
    state.gameCleared = false;
    state.inventory = [];
    state.selectedItem = null;
    state.startTime = Date.now();

    // 2. 3Dシーンとオブジェクトのリセット
    if (bookshelfMeshGroup) {
      bookshelfMeshGroup.position.z = 0;
    }
    const obsIdx = obstacleBoxes.findIndex(b => b.minX === 3.9 && (b.minZ === 0.0 || b.minZ === 1.3));
    if (obsIdx !== -1) {
      obstacleBoxes[obsIdx] = { minX: 3.9, maxX: 5.0, minZ: 0.0, maxZ: 2.4 };
    }
    if (doorPivotGroup) {
      doorPivotGroup.rotation.y = 0;
    }
    if (exitHallGroup) {
      exitHallGroup.visible = false;
    }
    if (exitSunLight) {
      exitSunLight.intensity = 0.0;
    }
    updateLightingState();
    updateClockHands3D();

    // 3. プレイヤーカメラの位置・回転リセット（書斎の中央やや手前、北向き）
    camera.position.set(0, 1.6, 2.8);
    camera.rotation.set(0, 0, 0);

    // 4. UIのリセット
    renderInventory();
    setMessage('古びた書斎に閉じ込められているようだ…部屋を探索して脱出の手がかりを探そう。', 5000);

    // 5. そのまま直ちに探索プレイを開始！
    soundManager.init();
    soundManager.playClick();
    menuScreen.classList.add('hidden');
    crosshair.classList.remove('hidden');
    hudEl.classList.remove('hidden');
    inventoryBarContainer.classList.remove('hidden');
    topMenuEl.classList.remove('hidden');
    isGameStarted = true;
    controls.lock();
  }

  function startOrResumeGame() {
    soundManager.init();
    soundManager.playClick();

    if (state.gameCleared) {
      resetGameAndPlay();
      return;
    }

    menuScreen.classList.add('hidden');
    crosshair.classList.remove('hidden');
    hudEl.classList.remove('hidden');
    inventoryBarContainer.classList.remove('hidden');
    topMenuEl.classList.remove('hidden');

    isGameStarted = true;
    controls.lock();
  }

  function returnToMainMenu() {
    document.body.classList.remove('modal-open');
    if (activeModal) {
      activeModal.classList.add('hidden');
      activeModal = null;
    }
    if (controls.isLocked) {
      controls.unlock();
    }
    soundManager.playClick();

    crosshair.classList.add('hidden');
    hudEl.classList.add('hidden');
    clearMessage();
    inventoryBarContainer.classList.add('hidden');
    topMenuEl.classList.add('hidden');
    document.body.classList.remove('cursor-mode');

    menuScreen.classList.remove('hidden');

    if (state.gameCleared) {
      btnPlayStage1.textContent = 'もう一度遊ぶ';
      btnRestartStage1.style.display = 'none';
    } else if (isGameStarted) {
      btnPlayStage1.textContent = 'つづきから';
      btnRestartStage1.style.display = 'inline-block';
    }
  }

  function updateSoundSettingUI() {
    const muted = soundManager.isMuted;
    if (btnSoundOn && btnSoundOff) {
      btnSoundOn.classList.toggle('active', !muted);
      btnSoundOn.setAttribute('aria-pressed', !muted);
      btnSoundOff.classList.toggle('active', muted);
      btnSoundOff.setAttribute('aria-pressed', muted);
    }
  }

  // --- 視点・カメラ感度設定管理（ローカルストレージ永続化） ---
  // PC版PointerLockControlsの基本感度: Level 5 = 1.0 (デフォルト現在の感度)
  // レベル範囲: 1(超低速 0.4) 〜 5(標準 1.0) 〜 10(最高速 2.0)
  const SENSITIVITY_MIN = 0.4;        // Level 1: 低速
  const SENSITIVITY_DEFAULT = 1.0;    // Level 5: 標準（現在のPointerLock感度そのもの）
  const SENSITIVITY_MAX = 2.0;        // Level 10: 高速
  const SENSITIVITY_STORAGE_KEY = 'escape3d_camera_sensitivity_level';

  let currentSensitivityLevel = 5;
  try {
    const savedLvl = parseInt(localStorage.getItem(SENSITIVITY_STORAGE_KEY), 10);
    if (!isNaN(savedLvl) && savedLvl >= 1 && savedLvl <= 10) {
      currentSensitivityLevel = savedLvl;
    }
  } catch (_) {}

  function getSensitivityFromLevel(lvl) {
    if (lvl <= 5) {
      return SENSITIVITY_MIN + ((lvl - 1) / 4) * (SENSITIVITY_DEFAULT - SENSITIVITY_MIN);
    } else {
      return SENSITIVITY_DEFAULT + ((lvl - 5) / 5) * (SENSITIVITY_MAX - SENSITIVITY_DEFAULT);
    }
  }

  function getSensitivityLabel(lvl) {
    if (lvl === 1) return '1 (極低)';
    if (lvl === 2) return '2 (低)';
    if (lvl === 3) return '3 (やや低)';
    if (lvl === 5) return '5 (標準)';
    if (lvl === 7) return '7 (やや高)';
    if (lvl === 8) return '8 (高)';
    if (lvl === 10) return '10 (最高)';
    return `${lvl}`;
  }

  function applySensitivityLevel(lvl, save = true) {
    currentSensitivityLevel = Math.max(1, Math.min(10, lvl));
    const speed = getSensitivityFromLevel(currentSensitivityLevel);
    if (controls) {
      controls.pointerSpeed = speed;
    }
    if (sliderLookSensitivity) {
      sliderLookSensitivity.value = String(currentSensitivityLevel);
    }
    if (sensitivityValueDisplay) {
      sensitivityValueDisplay.textContent = getSensitivityLabel(currentSensitivityLevel);
    }
    if (save) {
      try {
        localStorage.setItem(SENSITIVITY_STORAGE_KEY, String(currentSensitivityLevel));
      } catch (_) {}
    }
  }

  if (sliderLookSensitivity) {
    sliderLookSensitivity.addEventListener('input', (e) => {
      const lvl = parseInt(e.target.value, 10);
      applySensitivityLevel(lvl, true);
    });
  }

  function openSettingsModal(fromMenu = false) {
    clearMessage();
    soundManager.playClick();

    // メインメニュー経由で開いた場合は「メインメニューへ戻る」「最初からやり直す」を非表示にする
    const isOpenedFromMenu = fromMenu || !menuScreen.classList.contains('hidden');
    if (blockMenuReturn) {
      blockMenuReturn.style.display = isOpenedFromMenu ? 'none' : '';
    }
    if (blockRestartStage) {
      blockRestartStage.style.display = isOpenedFromMenu ? 'none' : '';
    }

    updateSoundSettingUI();
    applySensitivityLevel(currentSensitivityLevel, false);
    document.body.classList.add('modal-open');
    activeModal = settingsModal;
    settingsModal.classList.remove('hidden');
    if (controls.isLocked) {
      controls.unlock();
    }
  }

  function closeSettingsModal() {
    document.body.classList.remove('modal-open');
    settingsModal.classList.add('hidden');
    activeModal = null;
    soundManager.playClick();
    if (isGameStarted && menuScreen.classList.contains('hidden') && !state.gameCleared) {
      controls.lock();
    }
  }

  // --- イベントリスナー ---

  // メインメニュー操作
  btnPlayStage1.addEventListener('click', (e) => {
    e.stopPropagation();
    startOrResumeGame();
  });

  if (btnRestartStage1) {
    btnRestartStage1.addEventListener('click', (e) => {
      e.stopPropagation();
      // はじめからを押したらリロードせず初期化してそのままプレイに直行！
      resetGameAndPlay();
    });
  }

  menuBtnSettings.addEventListener('click', (e) => {
    e.stopPropagation();
    openSettingsModal(true);
  });

  // ゲーム中画面 右上設定ボタン（統合ボタン）
  btnGameSettings.addEventListener('click', (e) => {
    e.stopPropagation();
    openSettingsModal();
  });

  // 設定モーダル内のアクション
  settingsModalClose.addEventListener('click', closeSettingsModal);
  if (btnSettingsClose) {
    btnSettingsClose.addEventListener('click', closeSettingsModal);
  }
  settingsModal.addEventListener('click', (e) => {
    if (e.target === settingsModal) closeSettingsModal();
  });

  if (btnSoundOn) {
    btnSoundOn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (soundManager.isMuted) {
        soundManager.toggleMute();
        updateSoundSettingUI();
        soundManager.playClick();
      }
    });
  }

  if (btnSoundOff) {
    btnSoundOff.addEventListener('click', (e) => {
      e.stopPropagation();
      if (!soundManager.isMuted) {
        soundManager.playClick();
        soundManager.toggleMute();
        updateSoundSettingUI();
      }
    });
  }

  btnSettingToMenu.addEventListener('click', (e) => {
    e.stopPropagation();
    returnToMainMenu();
  });

  btnSettingRestart.addEventListener('click', (e) => {
    e.stopPropagation();
    if (confirm('書斎の探索を初期状態にリセットして最初からやり直しますか？')) {
      closeSettingsModal();
      resetGameAndPlay();
    }
  });

  controls.addEventListener('lock', () => {
    document.body.classList.remove('cursor-mode');
    soundManager.init();
  });

  controls.addEventListener('unlock', () => {
    clearHover();
    // ズーム演出中、ズーム注視中、またはモーダル表示中は設定画面オープンを安全に抑止
    if (cameraZoom.active || cameraZoom.isZoomedIn || activeModal) {
      return;
    }
    if (!state.gameCleared && menuScreen.classList.contains('hidden') && isGameStarted) {
      // 通常探索中にEscキーやブラウザ操作でロックが外れた場合のみ設定画面（CONFIG & MENU）を展開
      openSettingsModal();
    }
  });

  // 右クリックメニュー抑止
  window.addEventListener('contextmenu', (e) => {
    e.preventDefault();
  });

  // マウスクリック処理（常時PointerLock探索、UIモードなし）
  window.addEventListener('mousedown', (e) => {
    if (e.button === 0) {
      isMouseDown = true;
    }
    if (activeModal || !menuScreen.classList.contains('hidden')) return;

    // 左クリック (button === 0)
    if (e.button === 0) {
      if (!controls.isLocked && isGameStarted) {
        // ポインターロックが外れている場合はクリックで探索視点へ復帰
        controls.lock();
        return;
      }

      if (controls.isLocked && hoveredObject) {
        isObjectInteracting = true;
        soundManager.playClick();
        if (typeof hoveredObject.userData.action === 'function') {
          hoveredObject.userData.action();
        }
        if (!cameraZoom.active && !activeModal) {
          isObjectInteracting = false;
        }
      }
    }
  });

  window.addEventListener('mouseup', (e) => {
    if (e.button === 0) {
      isMouseDown = false;
    }
  });

  window.addEventListener('blur', () => {
    isMouseDown = false;
  });

  // モーダル閉じるボタン
  modalCloseBtn.addEventListener('click', closeModal);
  inspectModal.addEventListener('click', (e) => {
    if (e.target === inspectModal) closeModal();
  });

  itemDetailCloseBtn.addEventListener('click', () => {
    closeItemDetailModal(true);
  });
  itemDetailModal.addEventListener('click', (e) => {
    if (e.target === itemDetailModal) closeItemDetailModal(true);
  });

  // クリアモーダルのボタン
  btnReplay.addEventListener('click', () => {
    if (activeModal) {
      activeModal.classList.add('hidden');
      activeModal = null;
    }
    resetGameAndPlay();
  });

  btnClearToMenu.addEventListener('click', () => {
    returnToMainMenu();
  });

  // キーボード移動＆ショートカット（Escで設定画面／モーダル閉じ、数字キー1〜6でアイテム選択・詳細）
  window.addEventListener('keydown', (e) => {
    // ズームイン・ズームアウト演出中、またはオブジェクト操作中はEscを含め一切のキー入力を完全無効化（誤作動防止）
    if (cameraZoom.active || isObjectInteracting) {
      if (e.code === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
      }
      return;
    }

    // Escキーのハンドリング：設定画面の展開 / 設定画面閉じる
    if (e.code === 'Escape') {
      e.preventDefault();

      // 1. 設定モーダルが開いている場合：設定モーダルを閉じる
      if (activeModal === settingsModal) {
        closeSettingsModal();
        return;
      }

      // 2. 調査モーダルまたはアイテム詳細モーダルが開いている場合：
      // ユーザーの指示に従い、中途半端なマウス浮き・停止を防止し、モーダルを閉じて【設定メニュー（CONFIG & MENU）】を開く！
      if (activeModal === inspectModal || activeModal === itemDetailModal) {
        if (activeModal === inspectModal) {
          inspectModal.classList.add('hidden');
        } else {
          itemDetailModal.classList.add('hidden');
        }
        activeModal = null;
        isObjectInteracting = false;

        // カメラがズーム注視中の場合は探索元の視点位置・向きへ即座にリセット
        if (cameraZoom.isZoomedIn) {
          cameraZoom.isZoomedIn = false;
          camera.position.copy(cameraZoom.savedPos);
          camera.quaternion.copy(cameraZoom.savedQuat);
        }

        // 直ちに設定画面を展開（マウスカーソルが出ている理由が明快になり正常に操作可能）
        openSettingsModal();
        return;
      }

      // 3. モーダルがなくカメラがズーム注視中の場合：元の探索視点へズームアウト
      if (cameraZoom.isZoomedIn) {
        startCameraZoomOut();
        return;
      }

      // 4. 通常探索中の場合：設定画面（CONFIG & MENU）を開く
      if (isGameStarted && menuScreen.classList.contains('hidden')) {
        openSettingsModal();
      }
      return;
    }

    if (activeModal) {
      if (e.code === 'Enter') {
        e.preventDefault();
        if (activeModal === inspectModal) closeModal();
        else if (activeModal === itemDetailModal) closeItemDetailModal(true);
        else if (activeModal === settingsModal) closeSettingsModal();
      }
      return;
    }

    if (/^(Digit[1-6]|Numpad[1-6])$/.test(e.code)) {
      const slotNum = parseInt(e.code.replace(/^(Digit|Numpad)/, ''), 10);
      const slotIdx = slotNum - 1;
      const item = state.inventory[slotIdx];
      if (item) {
        soundManager.playClick();
        if (state.selectedItem === item.id) {
          openItemDetailModal(item.id);
        } else {
          state.selectedItem = item.id;
          renderInventory();
          setMessage(`【${item.name}】を選択した。`);
        }
      }
      return;
    }

    if (e.code === 'KeyE' || e.code === 'KeyI') {
      if (state.selectedItem) {
        e.preventDefault();
        soundManager.playClick();
        openItemDetailModal(state.selectedItem);
        return;
      }
    }

    switch (e.code) {
      case 'KeyW':
      case 'ArrowUp':
        moveState.forward = true;
        break;
      case 'KeyS':
      case 'ArrowDown':
        moveState.backward = true;
        break;
      case 'KeyA':
      case 'ArrowLeft':
        moveState.left = true;
        break;
      case 'KeyD':
      case 'ArrowRight':
        moveState.right = true;
        break;
      default:
        break;
    }
  });

  window.addEventListener('keyup', (e) => {
    switch (e.code) {
      case 'KeyW':
      case 'ArrowUp':
        moveState.forward = false;
        break;
      case 'KeyS':
      case 'ArrowDown':
        moveState.backward = false;
        break;
      case 'KeyA':
      case 'ArrowLeft':
        moveState.left = false;
        break;
      case 'KeyD':
      case 'ArrowRight':
        moveState.right = false;
        break;
      default:
        break;
    }
  });

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  // --- アニメーションループ ---
  let prevTime = performance.now();
  let lastFootstepTime = 0;
  const FOOTSTEP_INTERVAL = 400; // 約0.4秒ごとに木の床を踏む歩行音

  function animate() {
    requestAnimationFrame(animate);

    const time = performance.now();
    const delta = Math.min((time - prevTime) / 1000, 0.1);
    prevTime = time;

    // 暖炉の炎の微細な揺らめき（フリッカー）
    if (state.isLightOn && fireplaceLight) {
      fireplaceLight.intensity = 0.85 + Math.sin(time * 0.007) * 0.12 + Math.sin(time * 0.019) * 0.08;
    }

    // 時計の振り子の自然な揺れ
    if (clockPendulumGroup) {
      clockPendulumGroup.rotation.z = Math.sin(time * 0.0035) * 0.16;
    }

    // カメラズームイン・ズームアウト補間アニメーション
    if (cameraZoom.active) {
      const elapsed = time - cameraZoom.startTime;
      const t = Math.min(elapsed / cameraZoom.duration, 1.0);
      // Cubic Ease-In-Out 補間
      const ease = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

      camera.position.lerpVectors(cameraZoom.fromPos, cameraZoom.toPos, ease);
      camera.quaternion.slerpQuaternions(cameraZoom.fromQuat, cameraZoom.toQuat, ease);

      if (t >= 1.0) {
        cameraZoom.active = false;
        const doneCb = cameraZoom.onComplete;
        cameraZoom.onComplete = null;
        if (typeof doneCb === 'function') {
          doneCb();
        }
      }
    } else if (controls.isLocked && !activeModal && !cameraZoom.isZoomedIn) {
      velocity.x -= velocity.x * PLAYER.damping * delta;
      velocity.z -= velocity.z * PLAYER.damping * delta;

      direction.z = Number(moveState.forward) - Number(moveState.backward);
      direction.x = Number(moveState.right) - Number(moveState.left);
      direction.normalize();

      if (moveState.forward || moveState.backward) {
        velocity.z -= direction.z * PLAYER.moveSpeed * PLAYER.damping * delta;
      }
      if (moveState.left || moveState.right) {
        velocity.x -= direction.x * PLAYER.moveSpeed * PLAYER.damping * delta;
      }

      const currentPos = controls.getObject().position.clone();
      controls.moveRight(-velocity.x * delta);
      controls.moveForward(-velocity.z * delta);

      const nextPos = controls.getObject().position;
      resolveCollisions(nextPos, currentPos);
      nextPos.y = PLAYER.eyeHeight;

      // WASD移動中、一定間隔（約0.4秒ごと）で木の床を踏む歩行音を再生
      const isMovingInput = moveState.forward || moveState.backward || moveState.left || moveState.right;
      const movedDistSq =
        (nextPos.x - currentPos.x) * (nextPos.x - currentPos.x) +
        (nextPos.z - currentPos.z) * (nextPos.z - currentPos.z);
      if (isMovingInput && movedDistSq > 0.00001) {
        if (time - lastFootstepTime >= FOOTSTEP_INTERVAL) {
          soundManager.playFootstep();
          lastFootstepTime = time;
        }
      } else if (time - lastFootstepTime > 260) {
        // 次の歩き出しの1歩目が自然に鳴るように待機時間を調整
        lastFootstepTime = time - 260;
      }

      updateRaycast();
      updateCompassHUD();
    }

    renderer.render(scene, camera);
  }

  // --- 起動初期化 ---
  setupLighting();
  buildRoom();
  buildAllObjects();
  renderInventory();
  applySensitivityLevel(currentSensitivityLevel, false);
  animate();
})();
