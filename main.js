/**
 * 密室の謎解き脱出 3D - 『古びた書斎と賢者の鍵』完全移植版
 * Three.js (r128) + PointerLockControls + Web Audio API (se.js)
 */

(() => {
  'use strict';

  // --- サウンドマネージャー初期化 ---
  const soundManager = new SoundManager();

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
      desc: '小箱の中から出てきた銀色の鍵。机の引き出しに合いそうだ。'
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
      desc: '机の引き出しに入っていた小さな真鍮鍵。扉の左横にある照明端子盤カバーを開けられそうだ。'
    },
    armillary_pin: {
      id: 'armillary_pin',
      name: '星型の真鍮ピン',
      icon: `<svg viewBox="0 0 40 40"><polygon points="20,6 23,15 32,15 25,20 27,29 20,24 13,29 15,20 8,15 17,15" fill="#f1c40f" stroke="#caa86a" stroke-width="1.5"/><line x1="20" y1="24" x2="20" y2="34" stroke="#e8c988" stroke-width="3" stroke-linecap="round"/></svg>`,
      desc: '壁金庫の中に納められていた小さな真鍮ピン。天球儀のロック穴にぴったり合いそうだ。'
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
    clockHour: 12,
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
  const startOverlay = document.getElementById('start-overlay');
  const startBtn = document.getElementById('start-btn');
  const cursorModeBanner = document.getElementById('cursor-mode-banner');
  const btnResumeExplore = document.getElementById('btn-resume-explore');
  const crosshair = document.getElementById('crosshair');
  const targetHint = document.getElementById('target-hint');
  const targetHintText = document.getElementById('target-hint-text');
  const darknessVignette = document.getElementById('darkness-vignette');
  const hudCompass = document.getElementById('hud-compass');
  const messageText = document.getElementById('message-text');

  let isGameStarted = false;

  // メニュー
  const btnSoundToggle = document.getElementById('btn-sound-toggle');
  const btnHelpToggle = document.getElementById('btn-help-toggle');
  const btnResetGame = document.getElementById('btn-reset-game');

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

  const helpModal = document.getElementById('help-modal');
  const helpCloseBtn = document.getElementById('help-close-btn');

  const clearModal = document.getElementById('clear-modal');
  const clearTimeEl = document.getElementById('clear-time');
  const btnReplay = document.getElementById('btn-replay');

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
  let bookshelfMeshGroup = null;
  let carpetCornerMesh = null;
  let ceilingPointLight = null; // 主光源（中央天井）
  let ambientLight = null;      // 環境光
  let fireplaceLight = null;    // 暖炉の揺らめく補助光
  let deskSpotLight = null;     // 書斎机のスポットライト
  let ceilingBulbMesh = null;   // 天井電球
  let deskBulbMesh = null;      // デスク電球
  let clockPendulumGroup = null;// 時計の振り子
  let paintingCanvasMesh = null;// 南の絵画メッシュ

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

    // 3. 補助光源 A：暖炉（South）の赤橙色 PointLight（炎の揺らめき）
    fireplaceLight = new THREE.PointLight(0xff4a11, 0.95, 6.5, 1.8);
    fireplaceLight.position.set(-2.5, 0.48, 4.15);
    fireplaceLight.castShadow = true;
    fireplaceLight.shadow.mapSize.width = 512;
    fireplaceLight.shadow.mapSize.height = 512;
    fireplaceLight.shadow.bias = -0.002;
    scene.add(fireplaceLight);

    // 4. 補助光源 B：書斎机（East）のデスクライト SpotLight（天板と手帳を下向き照射）
    deskSpotLight = new THREE.SpotLight(0xffd599, 1.35, 4.5, Math.PI / 4, 0.45, 1.6);
    deskSpotLight.position.set(3.95, 1.25, -1.35);
    deskSpotLight.target.position.set(3.65, 0.82, -1.8);
    deskSpotLight.castShadow = true;
    deskSpotLight.shadow.mapSize.width = 512;
    deskSpotLight.shadow.mapSize.height = 512;
    deskSpotLight.shadow.bias = -0.002;
    scene.add(deskSpotLight);
    scene.add(deskSpotLight.target);
  }

  function updateLightingState() {
    if (state.isLightOn) {
      ceilingPointLight.intensity = 1.45;
      ambientLight.intensity = 0.52;
      deskSpotLight.intensity = 1.35;
      fireplaceLight.intensity = 0.95;

      if (ceilingBulbMesh) ceilingBulbMesh.material.emissiveIntensity = 1.25;
      if (deskBulbMesh) deskBulbMesh.material.emissiveIntensity = 1.3;

      darknessVignette.classList.add('hidden');
      scene.background.set(0x140e09);
      scene.fog.color.set(0x140e09);
    } else {
      // 暗闇モード（蓄光ギミックが浮かび上がる最小限の明かり）
      ceilingPointLight.intensity = 0.02;
      ambientLight.intensity = 0.08;
      deskSpotLight.intensity = 0.0;
      fireplaceLight.intensity = 0.15; // 暖炉の微かな残り火

      if (ceilingBulbMesh) ceilingBulbMesh.material.emissiveIntensity = 0.05;
      if (deskBulbMesh) deskBulbMesh.material.emissiveIntensity = 0.0;

      darknessVignette.classList.remove('hidden');
      scene.background.set(0x040507);
      scene.fog.color.set(0x040507);
    }

    if (paintingCanvasMesh) {
      paintingCanvasMesh.material.map = createPaintingTexture(state.isLightOn);
      paintingCanvasMesh.material.needsUpdate = true;
      if (!state.isLightOn) {
        paintingCanvasMesh.material.emissive = new THREE.Color(0x3a6588);
        paintingCanvasMesh.material.emissiveIntensity = 0.85;
      } else {
        paintingCanvasMesh.material.emissive = new THREE.Color(0x000000);
        paintingCanvasMesh.material.emissiveIntensity = 0;
      }
    }
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

    // 北壁
    const north = new THREE.Mesh(nsGeo, wallMat);
    north.position.set(0, ROOM.height / 2, -ROOM.depth / 2 - thick / 2);
    north.receiveShadow = true;
    scene.add(north);

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

    const bbN = new THREE.Mesh(bbNS, bbMat);
    bbN.position.set(0, bbHeight / 2, -ROOM.depth / 2 + bbDepth / 2);
    scene.add(bbN);

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

    // ==========================================
    // 【1. 北の壁 (North)】
    // ==========================================

    // A. 脱出の大扉
    const doorSystemGroup = new THREE.Group();
    doorSystemGroup.position.set(0, 0, -4.85);

    const frameMat = new THREE.MeshStandardMaterial({ color: 0x1f130b, roughness: 0.7 });
    const frame = new THREE.Mesh(new THREE.BoxGeometry(1.68, 2.7, 0.16), frameMat);
    frame.position.set(0, 1.35, 0);
    doorSystemGroup.add(frame);

    doorPivotGroup = new THREE.Group();
    doorPivotGroup.position.set(-0.7, 0, 0);

    const doorLeaf = new THREE.Mesh(new THREE.BoxGeometry(1.4, 2.54, 0.14), darkWoodMat);
    doorLeaf.position.set(0.7, 1.32, 0.02);
    doorPivotGroup.add(doorLeaf);

    // 電子錠プレート
    const lockPlateMat = new THREE.MeshStandardMaterial({ color: 0x181c22, roughness: 0.35, metalness: 0.8 });
    const lockPlate = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.44, 0.04), lockPlateMat);
    lockPlate.position.set(0.7, 1.35, 0.1);
    doorPivotGroup.add(lockPlate);

    // LED（光と影に反応するMeshStandardMaterial + emissive）
    const lockLedMat = new THREE.MeshStandardMaterial({
      color: 0x330000,
      emissive: 0xe74c3c,
      emissiveIntensity: 0.9,
      roughness: 0.3
    });
    const lockLed = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.06, 0.02), lockLedMat);
    lockLed.position.set(0.7, 1.45, 0.13);
    doorPivotGroup.add(lockLed);

    // 真鍮ノブ＆鍵穴
    const knob = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.18, 0.08), brassMat);
    knob.position.set(1.28, 1.15, 0.11);
    doorPivotGroup.add(knob);

    doorSystemGroup.add(doorPivotGroup);

    registerInteractive(
      doorSystemGroup,
      {
        id: 'door',
        name: '脱出の大扉',
        category: 'NORTH / EXIT DOOR',
        action: openDoorModal
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
      brassMat
    );
    coverMesh.position.z = 0.05;
    switchGroup.add(coverMesh);

    registerInteractive(switchGroup, {
      id: 'switch_panel',
      name: '照明スイッチ盤',
      category: 'NORTH / POWER PANEL',
      action: openSwitchModal
    });

    // C. 壁掛けの古時計（振り子付き）
    const clockGroup = new THREE.Group();
    clockGroup.position.set(2.2, 2.2, -4.88);

    const clockCase = new THREE.Mesh(new THREE.BoxGeometry(0.68, 1.35, 0.16), darkWoodMat);
    clockGroup.add(clockCase);

    // 文字盤
    const faceMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(0.24, 0.24, 0.03, 32),
      new THREE.MeshStandardMaterial({ color: 0xf6efe4, roughness: 0.35, metalness: 0.1 })
    );
    faceMesh.rotation.x = Math.PI / 2;
    faceMesh.position.set(0, 0.25, 0.09);
    clockGroup.add(faceMesh);

    const faceRing = new THREE.Mesh(new THREE.TorusGeometry(0.24, 0.016, 16, 32), brassMat);
    faceRing.position.set(0, 0.25, 0.1);
    clockGroup.add(faceRing);

    // 振り子窓
    const pendWindow = new THREE.Mesh(
      new THREE.BoxGeometry(0.36, 0.48, 0.04),
      new THREE.MeshStandardMaterial({ color: 0x0f1115, roughness: 0.2, metalness: 0.7 })
    );
    pendWindow.position.set(0, -0.32, 0.08);
    clockGroup.add(pendWindow);

    // 真鍮の振り子
    clockPendulumGroup = new THREE.Group();
    clockPendulumGroup.position.set(0, -0.15, 0.07);

    const rodMesh = new THREE.Mesh(new THREE.BoxGeometry(0.018, 0.28, 0.01), brassMat);
    rodMesh.position.set(0, -0.12, 0);
    clockPendulumGroup.add(rodMesh);

    const bobMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.065, 0.02, 24), brassMat);
    bobMesh.rotation.x = Math.PI / 2;
    bobMesh.position.set(0, -0.26, 0);
    clockPendulumGroup.add(bobMesh);

    clockGroup.add(clockPendulumGroup);

    registerInteractive(clockGroup, {
      id: 'clock',
      name: '壁掛けの古時計',
      category: 'NORTH / ANTIQUE CLOCK',
      action: openClockModal
    });

    // ==========================================
    // 【2. 東の壁 (East)】
    // ==========================================

    // A. アンティーク書斎机（GLTFLoaderによる外部3Dモデル assets/models/desk.glb 読み込み＆不可視バウンディングボックス判定）
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

    // 既存の仮置きCube机オブジェクト群（非表示化・フォールバック用）
    const deskPlaceholderGroup = new THREE.Group();
    deskPlaceholderGroup.visible = false; // 外部3Dモデル（desk.glb）への差し替えのため非表示

    const deskTop = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.1, 2.2), darkWoodMat);
    deskTop.position.set(0, 0.82, 0);
    deskPlaceholderGroup.add(deskTop);

    const legLeft = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.78, 0.55), darkWoodMat);
    legLeft.position.set(0, 0.39, -0.75);
    deskPlaceholderGroup.add(legLeft);

    const legRight = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.78, 0.55), darkWoodMat);
    legRight.position.set(0, 0.39, 0.75);
    deskPlaceholderGroup.add(legRight);

    const drawer = new THREE.Mesh(new THREE.BoxGeometry(1.05, 0.18, 0.82), darkWoodMat);
    drawer.position.set(-0.02, 0.68, 0);
    deskPlaceholderGroup.add(drawer);

    const handle = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.04, 0.16), brassMat);
    handle.position.set(-0.56, 0.68, 0);
    deskPlaceholderGroup.add(handle);

    const diary = new THREE.Mesh(
      new THREE.BoxGeometry(0.44, 0.05, 0.34),
      new THREE.MeshStandardMaterial({ color: 0x6e241c, roughness: 0.65, metalness: 0.08 })
    );
    diary.position.set(-0.1, 0.89, -0.2);
    diary.rotation.y = 0.2;
    deskPlaceholderGroup.add(diary);

    const lampBase = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.14, 0.03, 16), brassMat);
    lampBase.position.set(0.15, 0.88, 0.65);
    deskPlaceholderGroup.add(lampBase);

    const lampArm = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.35, 12), brassMat);
    lampArm.position.set(0.15, 1.05, 0.65);
    deskPlaceholderGroup.add(lampArm);

    const lampShade = new THREE.Mesh(
      new THREE.ConeGeometry(0.16, 0.18, 16),
      new THREE.MeshStandardMaterial({ color: 0x163f2e, roughness: 0.35, metalness: 0.2 })
    );
    lampShade.position.set(0.15, 1.2, 0.65);
    deskPlaceholderGroup.add(lampShade);

    deskGroup.add(deskPlaceholderGroup);

    // デスクライトの発光電球（暗闇モード連動用）
    deskBulbMesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.04, 12, 12),
      new THREE.MeshStandardMaterial({
        color: 0x332211,
        emissive: 0xffaa44,
        emissiveIntensity: 1.3,
        roughness: 0.2
      })
    );
    deskBulbMesh.position.set(0.15, 1.15, 0.65);
    deskGroup.add(deskBulbMesh);

    registerInteractive(
      deskGroup,
      {
        id: 'desk',
        name: 'アンティーク書斎机',
        category: 'EAST / STUDY DESK',
        action: openDeskModal
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

          // 読み込んだ3Dモデルの全メッシュに影設定（castShadow / receiveShadow）とRaycaster判定を適用
          deskModel.traverse((child) => {
            if (child.isMesh) {
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

    // B. 本棚
    const shelfSystem = new THREE.Group();
    shelfSystem.position.set(4.5, 0, 1.2);

    bookshelfMeshGroup = new THREE.Group();
    const shelfBody = new THREE.Mesh(new THREE.BoxGeometry(0.75, 2.7, 2.2), oakWoodMat);
    shelfBody.position.set(0, 1.35, 0);
    bookshelfMeshGroup.add(shelfBody);

    // 7冊の星座本
    const bookColors = [0x5c261e, 0x2d4030, 0x4a3b2c, 0x512e5f, 0x1b3d54, 0x194d2e, 0x5e4912];
    for (let i = 0; i < 7; i++) {
      const bookMesh = new THREE.Mesh(
        new THREE.BoxGeometry(0.3, 0.42, 0.14),
        new THREE.MeshStandardMaterial({ color: bookColors[i], roughness: 0.6, metalness: 0.05 })
      );
      bookMesh.position.set(-0.25, 1.35, -0.7 + i * 0.23);
      bookshelfMeshGroup.add(bookMesh);
    }
    shelfSystem.add(bookshelfMeshGroup);

    registerInteractive(
      shelfSystem,
      {
        id: 'bookshelf',
        name: '本棚の蔵書',
        category: 'EAST / BOOKSHELF',
        action: openBookshelfModal
      },
      { minX: 3.9, maxX: 5.0, minZ: 0.0, maxZ: 2.4 }
    );

    // C. 壁金庫
    const safeGroup = new THREE.Group();
    safeGroup.position.set(4.88, 1.4, 1.2);

    const safePlate = new THREE.Mesh(
      new THREE.BoxGeometry(0.08, 0.85, 0.85),
      new THREE.MeshStandardMaterial({ color: 0x22262d, roughness: 0.4, metalness: 0.8 })
    );
    safeGroup.add(safePlate);

    const safeCylinder = new THREE.Mesh(
      new THREE.CylinderGeometry(0.24, 0.24, 0.08, 32),
      brassMat
    );
    safeCylinder.rotation.z = Math.PI / 2;
    safeCylinder.position.x = -0.04;
    safeGroup.add(safeCylinder);

    registerInteractive(safeGroup, {
      id: 'wall_safe',
      name: '本棚奥の壁金庫',
      category: 'EAST / HIDDEN SAFE',
      action: openSafeModal
    });

    // ==========================================
    // 【3. 南の壁 (South)】
    // ==========================================

    // A. 壁の絵画『星辰の夜』
    const paintingGroup = new THREE.Group();
    paintingGroup.position.set(0, 2.2, 4.88);

    const frameMesh = new THREE.Mesh(new THREE.BoxGeometry(2.1, 1.55, 0.08), brassMat);
    paintingGroup.add(frameMesh);

    paintingCanvasMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(1.9, 1.35),
      new THREE.MeshStandardMaterial({
        map: createPaintingTexture(true),
        roughness: 0.6,
        metalness: 0.05
      })
    );
    paintingCanvasMesh.rotation.y = Math.PI;
    paintingCanvasMesh.position.z = -0.045;
    paintingGroup.add(paintingCanvasMesh);

    registerInteractive(paintingGroup, {
      id: 'painting',
      name: '油絵『星辰の夜』',
      category: 'SOUTH / OIL PAINTING',
      action: openPaintingModal
    });

    // B. 暖炉
    const fireplaceGroup = new THREE.Group();
    fireplaceGroup.position.set(-2.5, 0, 4.4);

    const brickMat = new THREE.MeshStandardMaterial({ color: 0x3d2720, roughness: 0.9, metalness: 0.02 });
    const fpTop = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.16, 0.8), brickMat);
    fpTop.position.set(0, 1.45, 0);
    fireplaceGroup.add(fpTop);

    const fpLeft = new THREE.Mesh(new THREE.BoxGeometry(0.38, 1.4, 0.7), brickMat);
    fpLeft.position.set(-0.75, 0.7, 0);
    fireplaceGroup.add(fpLeft);

    const fpRight = new THREE.Mesh(new THREE.BoxGeometry(0.38, 1.4, 0.7), brickMat);
    fpRight.position.set(0.75, 0.7, 0);
    fireplaceGroup.add(fpRight);

    // 火室内部（暗部）
    const firebox = new THREE.Mesh(
      new THREE.BoxGeometry(1.15, 1.1, 0.6),
      new THREE.MeshStandardMaterial({ color: 0x111317, roughness: 0.95 })
    );
    firebox.position.set(0, 0.55, 0.05);
    fireplaceGroup.add(firebox);

    // 暖炉の炭・薪（赤く発光するemissive）
    const coalsMat = new THREE.MeshStandardMaterial({
      color: 0x1a0502,
      emissive: 0xbb3305,
      emissiveIntensity: 0.75,
      roughness: 0.85
    });
    const coalsMesh = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.12, 0.35), coalsMat);
    coalsMesh.position.set(0, 0.08, 0.05);
    fireplaceGroup.add(coalsMesh);

    // 鉄格子（鋳鉄メタル感 metalness: 0.75, roughness: 0.6）
    const grilleMat = new THREE.MeshStandardMaterial({ color: 0x1d2024, roughness: 0.6, metalness: 0.75 });
    const grille = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.9, 0.04), grilleMat);
    grille.position.set(0, 0.55, -0.25);
    fireplaceGroup.add(grille);

    registerInteractive(
      fireplaceGroup,
      {
        id: 'fireplace',
        name: '暖炉の火室',
        category: 'SOUTH / FIREPLACE',
        action: openFireplaceModal
      },
      { minX: -3.6, maxX: -1.4, minZ: 3.9, maxZ: 5.0 }
    );

    // ==========================================
    // 【4. 西の壁 (West)】
    // ==========================================

    // A. 高級革張りソファ（深いワインレッド、roughness: 0.5, metalness: 0.1）
    const sofaGroup = new THREE.Group();
    sofaGroup.position.set(-3.8, 0, -1.0);

    const leatherMat = new THREE.MeshStandardMaterial({
      color: 0x481419,
      roughness: 0.5,
      metalness: 0.1,
    });

    const seat = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.45, 2.3), leatherMat);
    seat.position.set(0, 0.28, 0);
    sofaGroup.add(seat);

    const back = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.9, 2.3), leatherMat);
    back.position.set(-0.38, 0.7, 0);
    sofaGroup.add(back);

    const armNorth = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.68, 0.32), leatherMat);
    armNorth.position.set(0, 0.45, -1.1);
    sofaGroup.add(armNorth);

    const armSouth = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.68, 0.32), leatherMat);
    armSouth.position.set(0, 0.45, 1.1);
    sofaGroup.add(armSouth);

    // クッションボタン留めのアクセント
    const buttonMat = new THREE.MeshStandardMaterial({ color: 0x2d0b0f, roughness: 0.4, metalness: 0.2 });
    for (let bz = -0.7; bz <= 0.7; bz += 0.46) {
      const btn = new THREE.Mesh(new THREE.SphereGeometry(0.024, 8, 8), buttonMat);
      btn.position.set(-0.19, 0.75, bz);
      sofaGroup.add(btn);
    }

    registerInteractive(
      sofaGroup,
      {
        id: 'sofa',
        name: '高級革張りソファ',
        category: 'WEST / LEATHER SOFA',
        action: openSofaModal
      },
      { minX: -4.6, maxX: -3.1, minZ: -2.4, maxZ: 0.4 }
    );

    // B. サイドテーブルと天球儀
    const globeGroup = new THREE.Group();
    globeGroup.position.set(-3.8, 0, 1.8);

    const tableTop = new THREE.Mesh(
      new THREE.CylinderGeometry(0.5, 0.5, 0.06, 24),
      darkWoodMat
    );
    tableTop.position.set(0, 0.72, 0);
    globeGroup.add(tableTop);

    const tableLeg = new THREE.Mesh(
      new THREE.CylinderGeometry(0.08, 0.12, 0.7, 16),
      darkWoodMat
    );
    tableLeg.position.set(0, 0.35, 0);
    globeGroup.add(tableLeg);

    // 天球儀（真鍮ゴールド）
    const armRingOuter = new THREE.Mesh(new THREE.TorusGeometry(0.24, 0.02, 16, 32), brassMat);
    armRingOuter.position.set(0, 1.05, 0);
    globeGroup.add(armRingOuter);

    const armRingInner = new THREE.Mesh(new THREE.TorusGeometry(0.18, 0.015, 16, 32), brassMat);
    armRingInner.rotation.x = Math.PI / 3;
    armRingInner.position.set(0, 1.05, 0);
    globeGroup.add(armRingInner);

    const globeCore = new THREE.Mesh(
      new THREE.SphereGeometry(0.06, 16, 16),
      new THREE.MeshStandardMaterial({ color: 0x153e5e, roughness: 0.35, metalness: 0.3 })
    );
    globeCore.position.set(0, 1.05, 0);
    globeGroup.add(globeCore);

    registerInteractive(
      globeGroup,
      {
        id: 'armillary',
        name: '真鍮の天球儀',
        category: 'WEST / ARMILLARY SPHERE',
        action: openArmillaryModal
      },
      { minX: -4.4, maxX: -3.2, minZ: 1.2, maxZ: 2.4 }
    );

    // C. ペルシャ風絨毯
    const carpetGroup = new THREE.Group();
    carpetGroup.position.set(-2.3, 0.008, -0.8);

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
      action: openCarpetModal
    });
  }

  // --- メッセージ表示ヘルパー ---
  function setMessage(text) {
    messageText.innerHTML = text.replace(/\n/g, '<br>');
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
    setMessage(`【${def.name}】を手に入れた！`);
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
    activeModal.classList.add('hidden');
    activeModal = null;
    soundManager.playClick();
    controls.lock();
  }

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

  // 1. 机モーダル
  function openDeskModal() {
    let bodyHtml = `
      <div style="text-align:center;">
    `;

    if (!state.drawerUnlocked) {
      bodyHtml += `
        <p style="margin-bottom:12px;">上段の引き出しには銀色の小さな鍵穴がついている。</p>
        <div style="width:120px; height:60px; margin:12px auto; background:#22150f; border:2px solid #5c3d26; border-radius:6px; display:flex; align-items:center; justify-content:center;">
          <span style="font-size:1.8rem; color:#bdc3c7;">🔒</span>
        </div>
        ${getItemPickerHtml('引き出しの鍵穴に使うアイテムを選んでください')}
      `;
    } else {
      bodyHtml += `
        <p style="color:#58d68d; font-weight:bold; margin-bottom:10px;">★ 引き出しは解錠されている ★</p>
      `;
      if (!state.hasSwitchKey) {
        bodyHtml += `
          <div style="margin:16px 0;">
            <p style="font-size:0.9rem; margin-bottom:10px;">引き出しの奥に真鍮の小さな鍵が収められている！</p>
            <button id="btn-take-switch-key" class="primary-btn" style="max-width:240px; margin:0 auto;">端子盤の鍵を取る</button>
          </div>
        `;
      } else {
        bodyHtml += `<p style="color:#888; font-size:0.88rem;">引き出しの中はもう空だ。</p>`;
      }
    }

    bodyHtml += `
        <div style="margin-top:20px; border-top:1px solid rgba(202,168,106,0.3); padding-top:14px;">
          <button id="btn-read-diary" class="secondary-btn">机の上の天体日誌を開く</button>
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
      <div class="diary-book">
        <div class="diary-title">書斎主の天体日誌</div>
        <p>『かつて賢者は、古時計の二つの針を大いなる天体の運行になぞらえた。』</p>
        <div class="diary-poem">
          重厚なる短針は、黄昏の陽が沈みゆく【西】の地平へ。<br>
          軽やかなる長針は、黎明の光が生まれ出ずる【東】の空へ。<br>
          二つの針が正しく天の運行を指し示し時、古時計は賢者への捧げ物を落とすであろう。
        </div>
        <p style="font-size:0.82rem; color:#6e5227; text-align:right;">— 賢者の書斎録より</p>
      </div>
    `;
    openModal('MANUSCRIPT / ASTRONOMY', '天体日誌の記述', html);
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
        <div style="width:100%; max-width:440px; margin:0 auto 14px auto; border:4px solid var(--brass); border-radius:6px; overflow:hidden;">
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
      html += `<p style="color:#b2aba0;">月夜の古塔が描かれた重厚な油絵だ。<br>（部屋の明かりを消すと、夜空に何かが浮かび上がるかもしれない…）</p>`;
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
        <p style="font-size:0.82rem; color:${!state.isLightOn ? '#5dade2' : '#a8947d'};">
          ${!state.isLightOn ? '★ 暗闇の中で背表紙が青白く微かに発光している！' : '（絵画『星辰の夜』の軌跡に従って本を押してみよう）'}
        </p>

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
        <div style="width:110px; height:110px; margin:14px auto; background:#1b2028; border:3px dashed var(--brass); border-radius:50%; display:flex; align-items:center; justify-content:center; color:#888;">
          円盤スロット
        </div>
        ${getItemPickerHtml('スロットにはめるアイテムを選んでください')}
      `;
    } else if (!state.safeUnlocked) {
      html += `
        <p style="margin-bottom:12px;">円盤がはまった。タップして回転させ、星の向きを真上に合わせよう。</p>
        <div class="safe-rotator-container">
          <svg class="safe-disc-interactive" id="btn-rotate-safe-disc" viewBox="0 0 40 40" style="transform: rotate(${state.safeAngle}deg);">
            <circle cx="20" cy="20" r="18" fill="#1b2631" stroke="#f1c40f" stroke-width="3"/>
            <polygon points="20,7 23,15 31,15 25,20 27,28 20,23 13,28 15,20 9,15 17,15" fill="#f1c40f"/>
            <circle cx="20" cy="20" r="3" fill="#1b2631"/>
          </svg>
          <span style="font-size:0.85rem; color:var(--brass-bright);">現在角度: ${state.safeAngle}度（0度で真上）</span>
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
        html += `<p style="color:#888; font-size:0.85rem;">ピンは回収済みだ。</p>`;
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
              setMessage('レバーが重くて動かない。星の角度が合っていないようだ。');
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
        <div style="width:120px; height:120px; margin:12px auto; display:flex; align-items:center; justify-content:center;">
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
        <p style="margin-bottom:12px;">星型ピンでロックが解除された！ リングをタップして回転させ、天頂（0度）に合わせよう。</p>
        <div style="display:flex; flex-direction:column; align-items:center; gap:12px; margin:16px 0;">
          <svg id="btn-rotate-armillary" viewBox="0 0 100 100" style="width:140px; height:140px; cursor:pointer; transform:rotate(${state.armillaryAngle}deg); transition:transform 0.25s ease;">
            <circle cx="50" cy="50" r="42" fill="none" stroke="#b78727" stroke-width="3"/>
            <ellipse cx="50" cy="50" rx="42" ry="16" fill="none" stroke="#f1c40f" stroke-width="3"/>
            <polygon points="50,6 45,14 55,14" fill="#3498db" stroke="#2980b9" stroke-width="1"/>
            <circle cx="50" cy="50" r="6" fill="#f39c12"/>
          </svg>
          <span style="font-size:0.85rem; color:var(--brass-bright);">現在角度: ${state.armillaryAngle}度（0度で真上）</span>
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
              setMessage('まだ球体が固定されている。天頂の角度（0度）に合わせよう。');
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
        <div style="width:160px; height:100px; margin:12px auto; background:#1b1c1e; border:3px solid #34495e; border-radius:6px; display:flex; align-items:center; justify-content:center;">
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
        <p style="color:#b2aba0;">鉄格子が外された暖炉の火室だ。</p>
        <p style="color:#888; font-size:0.88rem; margin-top:8px;">灰の中はもう探り尽くした。</p>
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

    let html = `
      <div class="clock-display-container">
        <svg class="clock-svg-box" viewBox="0 0 180 180">
          <circle cx="90" cy="90" r="82" fill="#fdfbf7" stroke="#8c6a3e" stroke-width="7"/>
          <circle cx="90" cy="90" r="75" fill="#f4ebd9" stroke="#b89344" stroke-width="2"/>
          <text x="90" y="36" font-size="16" font-family="serif" text-anchor="middle" fill="#333" font-weight="bold">12</text>
          <text x="150" y="96" font-size="16" font-family="serif" text-anchor="middle" fill="#333" font-weight="bold">3</text>
          <text x="90" y="156" font-size="16" font-family="serif" text-anchor="middle" fill="#333" font-weight="bold">6</text>
          <text x="30" y="96" font-size="16" font-family="serif" text-anchor="middle" fill="#333" font-weight="bold">9</text>

          <line x1="90" y1="90" x2="${hx2}" y2="${hy2}" stroke="#2c3e50" stroke-width="5" stroke-linecap="round"/>
          <line x1="90" y1="90" x2="${mx2}" y2="${my2}" stroke="#b03a2e" stroke-width="3" stroke-linecap="round"/>
          <circle cx="90" cy="90" r="5" fill="#8c6a3e"/>
        </svg>
    `;

    if (!state.clockPuzzleSolved) {
      html += `
        <div class="clock-time-digital">
          ${String(state.clockHour).padStart(2, '0')}:${String(state.clockMinute).padStart(2, '0')}
        </div>
        <div class="clock-btn-row">
          <button id="btn-clock-hour" class="secondary-btn">+1 時間</button>
          <button id="btn-clock-min" class="secondary-btn">+15 分</button>
        </div>
        <p style="color:#b2aba0; font-size:0.85rem; text-align:center;">
          天体日誌の詩：「短針は沈む【西】へ、長針は昇る【東】へ」
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
        html += `<p style="color:#888; font-size:0.85rem;">パーツは回収済みだ。</p>`;
      }
      html += `</div>`;
    }

    html += `</div>`;

    openModal('NORTH / ANTIQUE CLOCK', '壁掛けの古時計', html, (container) => {
      if (!state.clockPuzzleSolved) {
        const btnHour = container.querySelector('#btn-clock-hour');
        const btnMin = container.querySelector('#btn-clock-min');
        if (btnHour) {
          btnHour.onclick = () => {
            soundManager.playTick();
            state.clockHour = (state.clockHour % 12) + 1;
            checkClockSolution();
          };
        }
        if (btnMin) {
          btnMin.onclick = () => {
            soundManager.playTick();
            state.clockMinute = (state.clockMinute + 15) % 60;
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
    if (state.clockHour === 9 && state.clockMinute === 15) {
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
        <div style="width:120px; height:80px; margin:14px auto; background:#2b303c; border:2px solid var(--brass); border-radius:6px; display:flex; align-items:center; justify-content:center;">
          <span style="font-size:1.8rem; color:var(--brass-bright);">🔒</span>
        </div>
        ${getItemPickerHtml('カバーの鍵穴に使う鍵を選んでください')}
      `;
    } else {
      html += `
        <p style="margin-bottom:14px;">端子盤のカバーが開き、部屋全体の主電源スイッチが露出している。</p>
        <div style="margin:20px 0;">
          <button id="btn-toggle-light" class="primary-btn" style="max-width:280px; margin:0 auto; font-size:1.05rem;">
            ${state.isLightOn ? '💡 部屋の明かりを消す (OFF)' : '💡 部屋の明かりをつける (ON)'}
          </button>
        </div>
        <p style="font-size:0.85rem; color:#b2aba0;">
          ※ 暗闇にすることで、蓄光塗料で描かれた隠し絵画や暗号が浮かび上がります。
        </p>
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
              setMessage('カチッ…部屋の明かりが消え、暗闇に包まれた。どこかが青白く発光している…？');
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
          室外へ続く唯一の重厚な大扉だ。【賢者の鍵】と【電子暗証番号】の二重ロックがかかっている。
        </p>

        <div class="door-locks-grid">
          <div class="lock-card">
            <span class="lock-card-title">1. 賢者の鍵穴</span>
            <div style="font-size:2rem;">
              ${state.doorKeyUnlocked ? '🔓' : '🔒'}
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
        <div style="margin-top:16px;">
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
            setMessage('鍵穴は開いたが、電子暗証番号（4桁）が正しくない！ 金庫の暗号を確かめよう。');
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

  function handleDisassembleBox() {
    if (state.inventory.some(i => i.id === 'screwdriver')) {
      soundManager.playScrewdriver();
      removeItem('music_box');
      state.boxDisassembled = true;
      itemDetailModal.classList.add('hidden');
      activeModal = null;

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
      itemDetailModal.classList.add('hidden');
      activeModal = null;

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

      function animateDoorOpen(now) {
        const progress = Math.min((now - startTime) / duration, 1.0);
        doorPivotGroup.rotation.y = startRot + (targetRot - startRot) * Math.sin(progress * Math.PI / 2);
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
    const elapsed = Math.floor((Date.now() - state.startTime) / 1000);
    const m = String(Math.floor(elapsed / 60)).padStart(2, '0');
    const s = String(elapsed % 60).padStart(2, '0');
    clearTimeEl.textContent = `${m}:${s}`;

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
    targetHintText.textContent = `${root.userData.name} を調べる`;
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

  // --- イベントリスナー ---

  // 開始画面クリック
  startOverlay.addEventListener('click', () => {
    if (!activeModal) {
      isGameStarted = true;
      controls.lock();
    }
  });

  startBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (!activeModal) {
      isGameStarted = true;
      controls.lock();
    }
  });

  // UI操作モードバナーの「探索視点に戻る」ボタン
  if (btnResumeExplore) {
    btnResumeExplore.addEventListener('click', (e) => {
      e.stopPropagation();
      if (!activeModal) {
        controls.lock();
      }
    });
  }

  controls.addEventListener('lock', () => {
    startOverlay.classList.add('hidden');
    if (cursorModeBanner) cursorModeBanner.classList.add('hidden');
    document.body.classList.remove('cursor-mode');
    soundManager.init();
  });

  controls.addEventListener('unlock', () => {
    clearHover();
    if (!activeModal && !state.gameCleared) {
      if (!isGameStarted) {
        startOverlay.classList.remove('hidden');
      } else {
        if (cursorModeBanner) cursorModeBanner.classList.remove('hidden');
        document.body.classList.add('cursor-mode');
      }
    }
  });

  // 右クリックメニュー抑止
  window.addEventListener('contextmenu', (e) => {
    e.preventDefault();
  });

  // マウスクリック処理
  window.addEventListener('mousedown', (e) => {
    if (activeModal) return;

    // 右クリック (button === 2) で視点操作とUI操作を即座にトグル
    if (e.button === 2) {
      e.preventDefault();
      soundManager.playClick();
      if (controls.isLocked) {
        controls.unlock();
      } else if (isGameStarted) {
        controls.lock();
      }
      return;
    }

    // 左クリック (button === 0)
    if (e.button === 0) {
      if (controls.isLocked) {
        if (hoveredObject) {
          soundManager.playClick();
          if (typeof hoveredObject.userData.action === 'function') {
            hoveredObject.userData.action();
          }
        }
      } else if (isGameStarted) {
        const clickedEl = e.target;
        const isUI = clickedEl.closest('#top-menu') ||
                    clickedEl.closest('#inventory-bar-container') ||
                    clickedEl.closest('.modal') ||
                    clickedEl.closest('#start-overlay') ||
                    clickedEl.closest('#cursor-mode-banner');
        if (!isUI) {
          controls.lock();
        }
      }
    }
  });

  // モーダル閉じるボタン
  modalCloseBtn.addEventListener('click', closeModal);
  inspectModal.addEventListener('click', (e) => {
    if (e.target === inspectModal) closeModal();
  });

  itemDetailCloseBtn.addEventListener('click', () => {
    itemDetailModal.classList.add('hidden');
    activeModal = null;
    soundManager.playClick();
    controls.lock();
  });

  helpCloseBtn.addEventListener('click', () => {
    helpModal.classList.add('hidden');
    activeModal = null;
    soundManager.playClick();
    controls.lock();
  });

  // メニュー操作
  btnSoundToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    const isMuted = soundManager.toggleMute();
    btnSoundToggle.textContent = isMuted ? '🔇' : '🔊';
  });

  btnHelpToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    soundManager.playClick();
    activeModal = helpModal;
    helpModal.classList.remove('hidden');
    if (controls.isLocked) controls.unlock();
  });

  btnResetGame.addEventListener('click', (e) => {
    e.stopPropagation();
    if (confirm('ゲームを初期状態にリセットしますか？')) {
      location.reload();
    }
  });

  btnReplay.addEventListener('click', () => {
    location.reload();
  });

  // キーボード移動＆ショートカット
  window.addEventListener('keydown', (e) => {
    if (activeModal) {
      if (e.code === 'Enter' || e.code === 'Escape') {
        e.preventDefault();
        if (activeModal === inspectModal) closeModal();
        else if (activeModal === itemDetailModal) {
          itemDetailModal.classList.add('hidden');
          activeModal = null;
          controls.lock();
        } else if (activeModal === helpModal) {
          helpModal.classList.add('hidden');
          activeModal = null;
          controls.lock();
        }
      }
      return;
    }

    if (e.code === 'Tab') {
      e.preventDefault();
      soundManager.playClick();
      if (controls.isLocked) {
        controls.unlock();
      } else if (isGameStarted) {
        controls.lock();
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

    if (controls.isLocked && !activeModal) {
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
  animate();
})();
