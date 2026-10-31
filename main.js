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
    // 照明フラグ
    isLightOn: true,
    switchCoverUnlocked: false,
    
    // アイテム・ギミック進行フラグ
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

    // インベントリ
    inventory: [], // [{ id, name, icon, desc }]
    selectedItem: null,
    
    // 時間計測
    startTime: Date.now(),
  };

  // --- DOM Elements ---
  const container = document.getElementById('canvas-container');
  const startOverlay = document.getElementById('start-overlay');
  const startBtn = document.getElementById('start-btn');
  const crosshair = document.getElementById('crosshair');
  const targetHint = document.getElementById('target-hint');
  const targetHintText = document.getElementById('target-hint-text');
  const darknessVignette = document.getElementById('darkness-vignette');
  const hudCompass = document.getElementById('hud-compass');
  const messageText = document.getElementById('message-text');

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

  let activeModal = null; // 現在開いているモーダル要素
  let detailedItemId = null; // アイテム詳細モーダルで表示中のアイテムID

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
  scene.background = new THREE.Color(0x0e1014);
  scene.fog = new THREE.FogExp2(0x0e1014, 0.04);

  const camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set(0, PLAYER.eyeHeight, 1.8);

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
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

  // 動的アニメーション参照
  let doorPivotGroup = null; // 脱出大扉の回転軸グループ
  let bookshelfMeshGroup = null; // 本棚のスライドグループ
  let carpetCornerMesh = null; // 絨毯のめくれる角
  let ceilingPointLight = null; // 天井照明
  let ambientLight = null; // 環境光
  let paintingCanvasMesh = null; // 南の絵画メッシュ

  // --- プロシージャルテクスチャ生成 ---
  function createWoodTexture(baseColor, grainColor, planks = 8) {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = baseColor;
    ctx.fillRect(0, 0, 512, 512);

    ctx.strokeStyle = grainColor;
    ctx.lineWidth = 2;
    for (let i = 0; i < 150; i++) {
      const y = Math.random() * 512;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.bezierCurveTo(
        170, y + (Math.random() - 0.5) * 16,
        340, y + (Math.random() - 0.5) * 16,
        512, y + (Math.random() - 0.5) * 10
      );
      ctx.stroke();
    }

    if (planks > 0) {
      const step = 512 / planks;
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.4)';
      ctx.lineWidth = 3;
      for (let i = 1; i < planks; i++) {
        const y = i * step;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(512, y);
        ctx.stroke();
      }
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    return tex;
  }

  function createWallTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#22252c';
    ctx.fillRect(0, 0, 512, 512);

    for (let i = 0; i < 3000; i++) {
      const x = Math.random() * 512;
      const y = Math.random() * 512;
      const alpha = Math.random() * 0.05;
      ctx.fillStyle = i % 2 === 0 ? `rgba(255,255,255,${alpha})` : `rgba(0,0,0,${alpha * 1.5})`;
      ctx.fillRect(x, y, 3, 3);
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    return tex;
  }

  function createPersianRugTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    // 深紅の背景
    ctx.fillStyle = '#6b1b1b';
    ctx.fillRect(0, 0, 512, 512);

    // 外枠とゴールドの縁飾り
    ctx.strokeStyle = '#caa86a';
    ctx.lineWidth = 16;
    ctx.strokeRect(16, 16, 480, 480);

    ctx.strokeStyle = '#1b2631';
    ctx.lineWidth = 8;
    ctx.strokeRect(36, 36, 440, 440);

    // ダイヤ柄・メダリオン
    ctx.fillStyle = '#caa86a';
    ctx.beginPath();
    ctx.moveTo(256, 100);
    ctx.lineTo(380, 256);
    ctx.lineTo(256, 412);
    ctx.lineTo(132, 256);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#1b2631';
    ctx.beginPath();
    ctx.arc(256, 256, 60, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#e8c988';
    ctx.beginPath();
    ctx.arc(256, 256, 25, 0, Math.PI * 2);
    ctx.fill();

    return new THREE.CanvasTexture(canvas);
  }

  // 絵画『星辰の夜』テクスチャ生成（明かりON/OFFで切り替え）
  function createPaintingTexture(isLightOn) {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 384;
    const ctx = canvas.getContext('2d');

    // 夜空のグラデーション
    const skyGrad = ctx.createLinearGradient(0, 0, 0, 384);
    if (isLightOn) {
      skyGrad.addColorStop(0, '#0f1a2e');
      skyGrad.addColorStop(1, '#1b2d4b');
    } else {
      skyGrad.addColorStop(0, '#050a12');
      skyGrad.addColorStop(1, '#0a1220');
    }
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, 512, 384);

    // 山並み
    ctx.fillStyle = '#1a2332';
    ctx.beginPath();
    ctx.moveTo(0, 384);
    ctx.lineTo(120, 240);
    ctx.lineTo(240, 300);
    ctx.lineTo(400, 200);
    ctx.lineTo(512, 260);
    ctx.lineTo(512, 384);
    ctx.closePath();
    ctx.fill();

    // 満月
    ctx.fillStyle = isLightOn ? '#f9e79f' : '#627084';
    ctx.beginPath();
    ctx.arc(380, 130, 56, 0, Math.PI * 2);
    ctx.fill();

    // 古塔のシルエット
    ctx.fillStyle = '#080a0e';
    ctx.beginPath();
    ctx.moveTo(350, 384);
    ctx.lineTo(350, 210);
    ctx.lineTo(380, 80);
    ctx.lineTo(410, 210);
    ctx.lineTo(410, 384);
    ctx.closePath();
    ctx.fill();

    // 暗闇モード時の蓄光星辰ライン（白羊 → 獅子 → 天蠍 → 射手）
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

      // 各星の発光ドット
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

  // --- ライティング構築 ---
  function setupLighting() {
    ambientLight = new THREE.AmbientLight(0xd8d2c5, 0.4);
    scene.add(ambientLight);

    ceilingPointLight = new THREE.PointLight(0xffdfad, 1.25, 20, 1.5);
    ceilingPointLight.position.set(0, ROOM.height - 0.35, 0);
    ceilingPointLight.castShadow = true;
    ceilingPointLight.shadow.mapSize.width = 1024;
    ceilingPointLight.shadow.mapSize.height = 1024;
    ceilingPointLight.shadow.bias = -0.002;
    scene.add(ceilingPointLight);

    // 天井照明の視覚的器具
    const fixtureGroup = new THREE.Group();
    const baseMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(0.35, 0.45, 0.12, 24),
      new THREE.MeshStandardMaterial({ color: 0x22201e, roughness: 0.5, metalness: 0.7 })
    );
    baseMesh.position.y = ROOM.height - 0.06;
    fixtureGroup.add(baseMesh);

    const bulbMesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.18, 16, 16),
      new THREE.MeshBasicMaterial({ color: 0xfff1cf })
    );
    bulbMesh.position.y = ROOM.height - 0.2;
    fixtureGroup.add(bulbMesh);
    scene.add(fixtureGroup);
  }

  // 照明ON/OFFトグル
  function updateLightingState() {
    if (state.isLightOn) {
      ceilingPointLight.intensity = 1.25;
      ambientLight.intensity = 0.4;
      darknessVignette.classList.add('hidden');
      scene.background.set(0x0e1014);
      scene.fog.color.set(0x0e1014);
    } else {
      ceilingPointLight.intensity = 0.04;
      ambientLight.intensity = 0.07;
      darknessVignette.classList.remove('hidden');
      scene.background.set(0x030406);
      scene.fog.color.set(0x030406);
    }

    // 絵画のテクスチャ更新
    if (paintingCanvasMesh) {
      paintingCanvasMesh.material.map = createPaintingTexture(state.isLightOn);
      paintingCanvasMesh.material.needsUpdate = true;
      if (!state.isLightOn) {
        paintingCanvasMesh.material.emissive = new THREE.Color(0x3a6080);
        paintingCanvasMesh.material.emissiveIntensity = 0.6;
      } else {
        paintingCanvasMesh.material.emissive = new THREE.Color(0x000000);
        paintingCanvasMesh.material.emissiveIntensity = 0;
      }
    }
  }

  // --- 密室空間（壁・床・天井）構築 ---
  function buildRoom() {
    const floorTex = createWoodTexture('#3a271c', '#261810', 8);
    floorTex.repeat.set(4, 4);

    const wallTex = createWallTexture();
    wallTex.repeat.set(3, 1.5);

    const floorMat = new THREE.MeshStandardMaterial({ map: floorTex, roughness: 0.8, metalness: 0.05 });
    const ceilingMat = new THREE.MeshStandardMaterial({ color: 0x181a1f, roughness: 0.9 });
    const wallMat = new THREE.MeshStandardMaterial({ map: wallTex, roughness: 0.85, metalness: 0.08 });

    // 床
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(ROOM.width, ROOM.depth), floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    // 天井
    const ceiling = new THREE.Mesh(new THREE.PlaneGeometry(ROOM.width, ROOM.depth), ceilingMat);
    ceiling.rotation.x = Math.PI / 2;
    ceiling.position.y = ROOM.height;
    ceiling.receiveShadow = true;
    scene.add(ceiling);

    // 壁
    const thick = 0.2;
    const nsGeo = new THREE.BoxGeometry(ROOM.width + thick * 2, ROOM.height, thick);
    const ewGeo = new THREE.BoxGeometry(thick, ROOM.height, ROOM.depth);

    // 北壁 (Z = -5)
    const north = new THREE.Mesh(nsGeo, wallMat);
    north.position.set(0, ROOM.height / 2, -ROOM.depth / 2 - thick / 2);
    north.receiveShadow = true;
    scene.add(north);

    // 南壁 (Z = +5)
    const south = new THREE.Mesh(nsGeo, wallMat);
    south.position.set(0, ROOM.height / 2, ROOM.depth / 2 + thick / 2);
    south.receiveShadow = true;
    scene.add(south);

    // 東壁 (X = +5)
    const east = new THREE.Mesh(ewGeo, wallMat);
    east.position.set(ROOM.width / 2 + thick / 2, ROOM.height / 2, 0);
    east.receiveShadow = true;
    scene.add(east);

    // 西壁 (X = -5)
    const west = new THREE.Mesh(ewGeo, wallMat);
    west.position.set(-ROOM.width / 2 - thick / 2, ROOM.height / 2, 0);
    west.receiveShadow = true;
    scene.add(west);
  }

  // --- インタラクティブ登録ヘルパー ---
  function registerInteractive(group, metadata, collision = null) {
    group.userData = { isInteractiveRoot: true, ...metadata };
    group.traverse((c) => {
      if (c.isMesh) {
        c.castShadow = true;
        c.receiveShadow = true;
        c.userData.interactiveRoot = group;
        interactables.push(c);
      }
    });
    if (collision) {
      obstacleBoxes.push(collision);
    }
    scene.add(group);
  }

  // --- 東西南北のオブジェクト構築 ---
  function buildAllObjects() {
    const darkWoodTex = createWoodTexture('#452b1b', '#28170d', 4);
    const oakWoodTex = createWoodTexture('#5c3d26', '#352113', 6);
    const brassMat = new THREE.MeshStandardMaterial({ color: 0xcaa86a, roughness: 0.35, metalness: 0.85 });

    // ==========================================
    // 【1. 北の壁 (North)】
    // ==========================================

    // A. 脱出の大扉 (中央: X: 0, Z: -4.85)
    const doorSystemGroup = new THREE.Group();
    doorSystemGroup.position.set(0, 0, -4.85);

    // 枠
    const frameMat = new THREE.MeshStandardMaterial({ color: 0x22160f, roughness: 0.7 });
    const frame = new THREE.Mesh(new THREE.BoxGeometry(1.68, 2.7, 0.16), frameMat);
    frame.position.set(0, 1.35, 0);
    doorSystemGroup.add(frame);

    // 回転軸用ピボットグループ（左ヒンジ X: -0.7）
    doorPivotGroup = new THREE.Group();
    doorPivotGroup.position.set(-0.7, 0, 0);

    const doorMat = new THREE.MeshStandardMaterial({ map: darkWoodTex, roughness: 0.6, metalness: 0.1 });
    const doorLeaf = new THREE.Mesh(new THREE.BoxGeometry(1.4, 2.54, 0.14), doorMat);
    doorLeaf.position.set(0.7, 1.32, 0.02);
    doorPivotGroup.add(doorLeaf);

    // 電子錠プレート（「● LOCKED」表示）
    const lockPlateMat = new THREE.MeshStandardMaterial({ color: 0x151820, roughness: 0.4, metalness: 0.7 });
    const lockPlate = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.44, 0.04), lockPlateMat);
    lockPlate.position.set(0.7, 1.35, 0.1);
    doorPivotGroup.add(lockPlate);

    const lockLedMat = new THREE.MeshBasicMaterial({ color: 0xe74c3c });
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

    // B. 照明スイッチ盤 (扉の左脇: X: -2.0, Y: 1.5, Z: -4.88)
    const switchGroup = new THREE.Group();
    switchGroup.position.set(-2.0, 1.5, -4.88);

    const panelBox = new THREE.Mesh(
      new THREE.BoxGeometry(0.42, 0.58, 0.08),
      new THREE.MeshStandardMaterial({ color: 0x2b303c, roughness: 0.4, metalness: 0.8 })
    );
    switchGroup.add(panelBox);

    // 鍵穴シリンダー付きカバー
    const coverMesh = new THREE.Mesh(
      new THREE.BoxGeometry(0.36, 0.5, 0.04),
      new THREE.MeshStandardMaterial({ color: 0xcaa86a, roughness: 0.5, metalness: 0.7 })
    );
    coverMesh.position.z = 0.05;
    switchGroup.add(coverMesh);

    registerInteractive(switchGroup, {
      id: 'switch_panel',
      name: '照明スイッチ盤',
      category: 'NORTH / POWER PANEL',
      action: openSwitchModal
    });

    // C. 壁掛けの古時計 (扉の右側: X: 2.2, Y: 2.2, Z: -4.88)
    const clockGroup = new THREE.Group();
    clockGroup.position.set(2.2, 2.2, -4.88);

    // 時計本体ケース
    const clockCase = new THREE.Mesh(
      new THREE.BoxGeometry(0.68, 1.35, 0.16),
      new THREE.MeshStandardMaterial({ map: darkWoodTex, roughness: 0.65 })
    );
    clockGroup.add(clockCase);

    // 文字盤
    const faceMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(0.24, 0.24, 0.03, 32),
      new THREE.MeshStandardMaterial({ color: 0xfdfaf2, roughness: 0.3 })
    );
    faceMesh.rotation.x = Math.PI / 2;
    faceMesh.position.set(0, 0.25, 0.09);
    clockGroup.add(faceMesh);

    // 振り子窓
    const pendWindow = new THREE.Mesh(
      new THREE.BoxGeometry(0.36, 0.48, 0.04),
      new THREE.MeshStandardMaterial({ color: 0x111317, roughness: 0.2, metalness: 0.6 })
    );
    pendWindow.position.set(0, -0.32, 0.08);
    clockGroup.add(pendWindow);

    registerInteractive(clockGroup, {
      id: 'clock',
      name: '壁掛けの古時計',
      category: 'NORTH / ANTIQUE CLOCK',
      action: openClockModal
    });

    // ==========================================
    // 【2. 東の壁 (East)】
    // ==========================================

    // A. アンティーク書斎机 (X: 3.8, Z: -2.0)
    const deskGroup = new THREE.Group();
    deskGroup.position.set(3.8, 0, -2.0);

    const deskMat = new THREE.MeshStandardMaterial({ map: darkWoodTex, roughness: 0.65 });
    // 天板
    const deskTop = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.1, 2.2), deskMat);
    deskTop.position.set(0, 0.82, 0);
    deskGroup.add(deskTop);

    // 脚パネル兼引き出し
    const legLeft = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.78, 0.55), deskMat);
    legLeft.position.set(0, 0.39, -0.75);
    deskGroup.add(legLeft);

    const legRight = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.78, 0.55), deskMat);
    legRight.position.set(0, 0.39, 0.75);
    deskGroup.add(legRight);

    // 中央引き出し＆取っ手（西向き＝プレイヤー側）
    const drawer = new THREE.Mesh(new THREE.BoxGeometry(1.05, 0.18, 0.82), deskMat);
    drawer.position.set(-0.02, 0.68, 0);
    deskGroup.add(drawer);

    const handle = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.04, 0.16), brassMat);
    handle.position.set(-0.56, 0.68, 0);
    deskGroup.add(handle);

    // 机の上の天体日誌
    const diary = new THREE.Mesh(
      new THREE.BoxGeometry(0.44, 0.05, 0.34),
      new THREE.MeshStandardMaterial({ color: 0x78281f, roughness: 0.7 })
    );
    diary.position.set(-0.1, 0.89, -0.2);
    diary.rotation.y = 0.2;
    deskGroup.add(diary);

    // デスクライト
    const lampBase = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.14, 0.03, 16), brassMat);
    lampBase.position.set(0.15, 0.88, 0.65);
    deskGroup.add(lampBase);

    const lampShade = new THREE.Mesh(
      new THREE.ConeGeometry(0.16, 0.18, 16),
      new THREE.MeshStandardMaterial({ color: 0x1b4f72, roughness: 0.4 })
    );
    lampShade.position.set(0.15, 1.15, 0.65);
    deskGroup.add(lampShade);

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

    // B. 本棚 (X: 4.5, Z: 1.2) ＆ スライド後の隠し壁金庫
    const shelfSystem = new THREE.Group();
    shelfSystem.position.set(4.5, 0, 1.2);

    bookshelfMeshGroup = new THREE.Group();
    const shelfBody = new THREE.Mesh(
      new THREE.BoxGeometry(0.75, 2.7, 2.2),
      new THREE.MeshStandardMaterial({ map: oakWoodTex, roughness: 0.7 })
    );
    shelfBody.position.set(0, 1.35, 0);
    bookshelfMeshGroup.add(shelfBody);

    // 7冊の星座本
    const bookColors = [0x5c261e, 0x2d4030, 0x4a3b2c, 0x512e5f, 0x1b3d54, 0x194d2e, 0x5e4912];
    for (let i = 0; i < 7; i++) {
      const bookMesh = new THREE.Mesh(
        new THREE.BoxGeometry(0.3, 0.42, 0.14),
        new THREE.MeshStandardMaterial({ color: bookColors[i], roughness: 0.6 })
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

    // C. 壁金庫 (本棚奥の壁: X: 4.88, Y: 1.4, Z: 1.2)
    const safeGroup = new THREE.Group();
    safeGroup.position.set(4.88, 1.4, 1.2);

    const safePlate = new THREE.Mesh(
      new THREE.BoxGeometry(0.08, 0.85, 0.85),
      new THREE.MeshStandardMaterial({ color: 0x262a33, roughness: 0.4, metalness: 0.8 })
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

    // A. 壁の絵画『星辰の夜』 (中央: X: 0, Y: 2.2, Z: 4.88)
    const paintingGroup = new THREE.Group();
    paintingGroup.position.set(0, 2.2, 4.88);

    // 額縁
    const frameMesh = new THREE.Mesh(
      new THREE.BoxGeometry(2.1, 1.55, 0.08),
      brassMat
    );
    paintingGroup.add(frameMesh);

    // キャンバス
    paintingCanvasMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(1.9, 1.35),
      new THREE.MeshStandardMaterial({
        map: createPaintingTexture(true),
        roughness: 0.5
      })
    );
    paintingCanvasMesh.rotation.y = Math.PI; // 北を向く
    paintingCanvasMesh.position.z = -0.045;
    paintingGroup.add(paintingCanvasMesh);

    registerInteractive(paintingGroup, {
      id: 'painting',
      name: '油絵『星辰の夜』',
      category: 'SOUTH / OIL PAINTING',
      action: openPaintingModal
    });

    // B. 暖炉 (X: -2.5, Z: 4.4)
    const fireplaceGroup = new THREE.Group();
    fireplaceGroup.position.set(-2.5, 0, 4.4);

    const brickMat = new THREE.MeshStandardMaterial({ color: 0x422d26, roughness: 0.9 });
    // 外枠マントルピース
    const fpTop = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.16, 0.8), brickMat);
    fpTop.position.set(0, 1.45, 0);
    fireplaceGroup.add(fpTop);

    const fpLeft = new THREE.Mesh(new THREE.BoxGeometry(0.38, 1.4, 0.7), brickMat);
    fpLeft.position.set(-0.75, 0.7, 0);
    fireplaceGroup.add(fpLeft);

    const fpRight = new THREE.Mesh(new THREE.BoxGeometry(0.38, 1.4, 0.7), brickMat);
    fpRight.position.set(0.75, 0.7, 0);
    fireplaceGroup.add(fpRight);

    // 火室内部（黒）
    const firebox = new THREE.Mesh(
      new THREE.BoxGeometry(1.15, 1.1, 0.6),
      new THREE.MeshStandardMaterial({ color: 0x14161a, roughness: 0.9 })
    );
    firebox.position.set(0, 0.55, 0.05);
    fireplaceGroup.add(firebox);

    // 鉄格子
    const grilleMat = new THREE.MeshStandardMaterial({ color: 0x22252a, roughness: 0.6, metalness: 0.8 });
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

    // A. 高級革張りソファ (X: -3.8, Z: -1.0)
    const sofaGroup = new THREE.Group();
    sofaGroup.position.set(-3.8, 0, -1.0);

    const leatherMat = new THREE.MeshStandardMaterial({ color: 0x58181f, roughness: 0.6, metalness: 0.1 });
    // 座面
    const seat = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.45, 2.3), leatherMat);
    seat.position.set(0, 0.28, 0);
    sofaGroup.add(seat);

    // 背もたれ
    const back = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.9, 2.3), leatherMat);
    back.position.set(-0.38, 0.7, 0);
    sofaGroup.add(back);

    // 肘掛け
    const armNorth = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.68, 0.32), leatherMat);
    armNorth.position.set(0, 0.45, -1.1);
    sofaGroup.add(armNorth);

    const armSouth = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.68, 0.32), leatherMat);
    armSouth.position.set(0, 0.45, 1.1);
    sofaGroup.add(armSouth);

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

    // B. サイドテーブルと天球儀 (X: -3.8, Z: 1.8)
    const globeGroup = new THREE.Group();
    globeGroup.position.set(-3.8, 0, 1.8);

    // 丸テーブル
    const tableTop = new THREE.Mesh(
      new THREE.CylinderGeometry(0.5, 0.5, 0.06, 24),
      new THREE.MeshStandardMaterial({ map: darkWoodTex, roughness: 0.6 })
    );
    tableTop.position.set(0, 0.72, 0);
    globeGroup.add(tableTop);

    const tableLeg = new THREE.Mesh(
      new THREE.CylinderGeometry(0.08, 0.12, 0.7, 16),
      new THREE.MeshStandardMaterial({ map: darkWoodTex, roughness: 0.6 })
    );
    tableLeg.position.set(0, 0.35, 0);
    globeGroup.add(tableLeg);

    // 天球儀（リング構造）
    const armRingOuter = new THREE.Mesh(new THREE.TorusGeometry(0.24, 0.02, 16, 32), brassMat);
    armRingOuter.position.set(0, 1.05, 0);
    globeGroup.add(armRingOuter);

    const armRingInner = new THREE.Mesh(new THREE.TorusGeometry(0.18, 0.015, 16, 32), brassMat);
    armRingInner.rotation.x = Math.PI / 3;
    armRingInner.position.set(0, 1.05, 0);
    globeGroup.add(armRingInner);

    const globeCore = new THREE.Mesh(
      new THREE.SphereGeometry(0.06, 16, 16),
      new THREE.MeshStandardMaterial({ color: 0x1b4f72, roughness: 0.3 })
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

    // C. ペルシャ風絨毯 (ソファ手前床: X: -2.3, Z: -0.8)
    const carpetGroup = new THREE.Group();
    carpetGroup.position.set(-2.3, 0.008, -0.8);

    const rugTex = createPersianRugTexture();
    const rugMat = new THREE.MeshStandardMaterial({ map: rugTex, roughness: 0.9 });
    const rugMesh = new THREE.Mesh(new THREE.PlaneGeometry(2.0, 2.8), rugMat);
    rugMesh.rotation.x = -Math.PI / 2;
    rugMesh.receiveShadow = true;
    carpetGroup.add(rugMesh);

    // めくれる北東の角（アクセント）
    carpetCornerMesh = new THREE.Mesh(
      new THREE.BufferGeometry(),
      new THREE.MeshStandardMaterial({ color: 0x501414, roughness: 0.9 })
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
        slot.title = item.name;
        if (state.selectedItem === item.id) {
          slot.classList.add('selected');
        }

        slot.onclick = (e) => {
          e.stopPropagation();
          soundManager.playClick();
          if (state.selectedItem === item.id) {
            // 選択中のアイテムをもう一度クリックすると詳細モーダル表示
            openItemDetailModal(item.id);
          } else {
            state.selectedItem = item.id;
            renderInventory();
            setMessage(`【${item.name}】を選択した。`);
          }
        };
      } else {
        slot.title = '空スロット';
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

  // アイテムピッカーUI生成ヘルパー（モーダル内でアイテムを選択させる場合）
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

  // 天体日誌モーダル
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

    // SVGで油絵『星辰の夜』を再現（明かりON/OFFで表示変化）
    html += `
      <svg viewBox="0 0 280 210" style="display:block; width:100%; background:${isLightOn ? '#152238' : '#080d17'};">
        <polygon points="0,210 60,130 130,170 220,105 280,140 280,210" fill="#2c3e50"/>
        <circle cx="200" cy="75" r="34" fill="${isLightOn ? '#f9e79f' : '#85929e'}" opacity="0.95"/>
        <path d="M 185,210 L 185,120 L 200,45 L 215,120 L 215,210 Z" fill="#0b0e14"/>
        <text x="140" y="195" font-size="16" fill="#ecf0f1" font-family="Shippori Mincho, serif" text-anchor="middle" opacity="0.8">『星辰の夜』</text>
    `;

    if (!isLightOn) {
      // 暗闇時の蓄光星辰ライン
      html += `
        <line x1="45" y1="95" x2="95" y2="60" stroke="#5dade2" stroke-width="2.5" stroke-dasharray="4,4" />
        <line x1="95" y1="60" x2="145" y2="85" stroke="#5dade2" stroke-width="2.5" stroke-dasharray="4,4" />
        <line x1="145" y1="85" x2="245" y2="50" stroke="#5dade2" stroke-width="2.5" stroke-dasharray="4,4" />

        <!-- 1. 白羊 -->
        <circle cx="45" cy="95" r="6" fill="#eaf2f8" />
        <text x="45" y="82" font-size="11" fill="#aed6f1" text-anchor="middle" font-family="serif">白羊</text>

        <!-- 2. 獅子 -->
        <circle cx="95" cy="60" r="6" fill="#eaf2f8" />
        <text x="95" y="48" font-size="11" fill="#aed6f1" text-anchor="middle" font-family="serif">獅子</text>

        <!-- 3. 天蠍 -->
        <circle cx="145" cy="85" r="6" fill="#eaf2f8" />
        <text x="145" y="72" font-size="11" fill="#aed6f1" text-anchor="middle" font-family="serif">天蠍</text>

        <!-- 4. 射手 -->
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
                  // 3D空間の本棚を横にスライド
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
    // 9時15分で解除
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
          <!-- 1. 賢者の鍵穴 -->
          <div class="lock-card">
            <span class="lock-card-title">1. 賢者の鍵穴</span>
            <div style="font-size:2rem;">
              ${state.doorKeyUnlocked ? '🔓' : '🔒'}
            </div>
            <span style="font-size:0.82rem; font-weight:bold; color:${state.doorKeyUnlocked ? '#58d68d' : '#e74c3c'};">
              ${state.doorKeyUnlocked ? '解錠済み' : '施錠中'}
            </span>
          </div>

          <!-- 2. 電子ダイヤル錠 -->
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
      // 鍵穴アイテム使用
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

      // ダイヤル変更
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

          // 3928 で照合
          const codeStr = state.doorCode.join('');
          state.doorCodeUnlocked = (codeStr === '3928');
          openDoorModal();
        };
      });

      // 脱出ボタン
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
            // 両方解除成功！
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

    // アクションボタン（分解・合成）の判定
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

    // 扉の回転アニメーション（奥へ90度開く）
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
    // 1. 四方の壁境界
    nextPos.x = Math.max(-ROOM.wallBoundary, Math.min(ROOM.wallBoundary, nextPos.x));
    nextPos.z = Math.max(-ROOM.wallBoundary, Math.min(ROOM.wallBoundary, nextPos.z));

    // 2. 家具ボックスとのAABB判定
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

  // 方位HUD更新（カメラの回転角から計算）
  function updateCompassHUD() {
    const dir = new THREE.Vector3();
    camera.getWorldDirection(dir);
    const angle = Math.atan2(dir.x, -dir.z) * (180 / Math.PI); // 北が0度
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
    if (!activeModal) controls.lock();
  });
  startBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (!activeModal) controls.lock();
  });

  controls.addEventListener('lock', () => {
    startOverlay.classList.add('hidden');
    soundManager.init();
  });

  controls.addEventListener('unlock', () => {
    clearHover();
    if (!activeModal && !state.gameCleared) {
      startOverlay.classList.remove('hidden');
    }
  });

  // マウスクリックで調査
  window.addEventListener('mousedown', (e) => {
    if (e.button !== 0) return;
    if (activeModal) return;

    if (controls.isLocked && hoveredObject) {
      soundManager.playClick();
      if (typeof hoveredObject.userData.action === 'function') {
        hoveredObject.userData.action();
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
  btnSoundToggle.addEventListener('click', () => {
    const isMuted = soundManager.toggleMute();
    btnSoundToggle.textContent = isMuted ? '🔇' : '🔊';
  });

  btnHelpToggle.addEventListener('click', () => {
    soundManager.playClick();
    activeModal = helpModal;
    helpModal.classList.remove('hidden');
    if (controls.isLocked) controls.unlock();
  });

  btnResetGame.addEventListener('click', () => {
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

  // ウィンドウリサイズ
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
