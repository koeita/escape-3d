/**
 * 密室の謎解き脱出 3D - First-Person Escape Prototype
 * Three.js + PointerLockControls + Raycaster
 */

(() => {
  'use strict';

  // --- DOM Elements ---
  const container = document.getElementById('canvas-container');
  const startOverlay = document.getElementById('start-overlay');
  const startBtn = document.getElementById('start-btn');
  const crosshair = document.getElementById('crosshair');
  const targetHint = document.getElementById('target-hint');
  const targetHintText = document.getElementById('target-hint-text');

  const inspectModal = document.getElementById('inspect-modal');
  const modalCategory = document.getElementById('modal-category');
  const modalTitle = document.getElementById('modal-title');
  const modalDescription = document.getElementById('modal-description');
  const modalCloseBtn = document.getElementById('modal-close-btn');

  // --- Room Constants ---
  const ROOM = {
    width: 10,   // X: -5.0 ~ +5.0
    depth: 10,   // Z: -5.0 ~ +5.0
    height: 4.0, // Y: 0.0 ~ +4.0
    wallBoundary: 4.35, // プレイヤーが壁をすり抜けないための移動境界
  };

  const PLAYER = {
    eyeHeight: 1.65,
    moveSpeed: 4.8,
    damping: 10.0,
    radius: 0.42,
    interactDistance: 3.8,
  };

  // --- Game / UI State ---
  let isModalOpen = false;
  let hoveredInteractive = null;
  const interactables = []; // Raycasterの対象Mesh配列
  const obstacleBoxes = []; // 家具の2D衝突判定用ボックス (minX, maxX, minZ, maxZ)

  // Move input flags
  const moveState = {
    forward: false,
    backward: false,
    left: false,
    right: false,
  };
  const velocity = new THREE.Vector3();
  const direction = new THREE.Vector3();

  // --- Three.js Scene Setup ---
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x101216);
  scene.fog = new THREE.FogExp2(0x101216, 0.045);

  const camera = new THREE.PerspectiveCamera(
    65,
    window.innerWidth / window.innerHeight,
    0.1,
    100
  );
  camera.position.set(0, PLAYER.eyeHeight, 2.2);

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputEncoding = THREE.sRGBEncoding;
  container.appendChild(renderer.domElement);

  // --- PointerLockControls Setup ---
  const controls = new THREE.PointerLockControls(camera, document.body);

  // --- Procedural Canvas Textures (落ち着いたダークグレー＆木目調) ---
  function createWoodTexture(baseColor, grainColor, planks = 8) {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = baseColor;
    ctx.fillRect(0, 0, 512, 512);

    // 木目ライン
    ctx.strokeStyle = grainColor;
    ctx.lineWidth = 2;
    for (let i = 0; i < 140; i++) {
      const y = Math.random() * 512;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.bezierCurveTo(
        170, y + (Math.random() - 0.5) * 14,
        340, y + (Math.random() - 0.5) * 14,
        512, y + (Math.random() - 0.5) * 10
      );
      ctx.stroke();
    }

    // 板の継ぎ目
    if (planks > 0) {
      const step = 512 / planks;
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.38)';
      ctx.lineWidth = 3;
      for (let i = 1; i < planks; i++) {
        const y = i * step;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(512, y);
        ctx.stroke();
      }
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    return texture;
  }

  function createWallTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    // ダークグレーの漆喰・石材調トーン
    ctx.fillStyle = '#262930';
    ctx.fillRect(0, 0, 512, 512);

    for (let i = 0; i < 2500; i++) {
      const x = Math.random() * 512;
      const y = Math.random() * 512;
      const alpha = Math.random() * 0.06;
      ctx.fillStyle = i % 2 === 0 ? `rgba(255,255,255,${alpha})` : `rgba(0,0,0,${alpha * 1.4})`;
      ctx.fillRect(x, y, 3, 3);
    }

    // 控えめな縦ストライプ陰影
    ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
    for (let x = 0; x < 512; x += 32) {
      ctx.fillRect(x, 0, 12, 512);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    return texture;
  }

  // --- Lighting (天井のPointLight + 柔らかいAmbientLight + Shadow) ---
  function setupLighting() {
    // 柔らかい環境光
    const ambientLight = new THREE.AmbientLight(0xd8d2c5, 0.35);
    scene.add(ambientLight);

    // 天井のメイン点光源（暖色系）
    const ceilingLight = new THREE.PointLight(0xffdfad, 1.15, 18, 1.6);
    ceilingLight.position.set(0, ROOM.height - 0.35, 0);
    ceilingLight.castShadow = true;
    ceilingLight.shadow.mapSize.width = 1024;
    ceilingLight.shadow.mapSize.height = 1024;
    ceilingLight.shadow.camera.near = 0.2;
    ceilingLight.shadow.camera.far = 15;
    ceilingLight.shadow.bias = -0.002;
    scene.add(ceilingLight);

    // 天井照明器具（視覚的オブジェクト）
    const fixtureGroup = new THREE.Group();
    const baseGeo = new THREE.CylinderGeometry(0.35, 0.45, 0.12, 24);
    const baseMat = new THREE.MeshStandardMaterial({
      color: 0x22201e,
      roughness: 0.5,
      metalness: 0.7,
    });
    const baseMesh = new THREE.Mesh(baseGeo, baseMat);
    baseMesh.position.y = ROOM.height - 0.06;
    fixtureGroup.add(baseMesh);

    const bulbGeo = new THREE.SphereGeometry(0.18, 16, 16);
    const bulbMat = new THREE.MeshBasicMaterial({ color: 0xfff1cf });
    const bulbMesh = new THREE.Mesh(bulbGeo, bulbMat);
    bulbMesh.position.y = ROOM.height - 0.2;
    fixtureGroup.add(bulbMesh);

    scene.add(fixtureGroup);
  }

  // --- Build Room (床・天井・四方の壁) ---
  function buildRoom() {
    const floorTex = createWoodTexture('#3a271c', '#261810', 8);
    floorTex.repeat.set(4, 4);

    const wallTex = createWallTexture();
    wallTex.repeat.set(3, 1.5);

    const floorMat = new THREE.MeshStandardMaterial({
      map: floorTex,
      roughness: 0.75,
      metalness: 0.05,
    });

    const ceilingMat = new THREE.MeshStandardMaterial({
      color: 0x1b1d22,
      roughness: 0.9,
      metalness: 0.05,
    });

    const wallMat = new THREE.MeshStandardMaterial({
      map: wallTex,
      roughness: 0.85,
      metalness: 0.08,
    });

    // 床
    const floorGeo = new THREE.PlaneGeometry(ROOM.width, ROOM.depth);
    const floorMesh = new THREE.Mesh(floorGeo, floorMat);
    floorMesh.rotation.x = -Math.PI / 2;
    floorMesh.receiveShadow = true;
    scene.add(floorMesh);

    // 天井
    const ceilingMesh = new THREE.Mesh(floorGeo, ceilingMat);
    ceilingMesh.rotation.x = Math.PI / 2;
    ceilingMesh.position.y = ROOM.height;
    ceilingMesh.receiveShadow = true;
    scene.add(ceilingMesh);

    // 四方の壁（厚みを持たせたBoxGeometryで配置）
    const wallThickness = 0.2;
    const nsWallGeo = new THREE.BoxGeometry(ROOM.width + wallThickness * 2, ROOM.height, wallThickness);
    const ewWallGeo = new THREE.BoxGeometry(wallThickness, ROOM.height, ROOM.depth);

    // 北の壁 (Z = -5)
    const northWall = new THREE.Mesh(nsWallGeo, wallMat);
    northWall.position.set(0, ROOM.height / 2, -ROOM.depth / 2 - wallThickness / 2);
    northWall.receiveShadow = true;
    scene.add(northWall);

    // 南の壁 (Z = +5)
    const southWall = new THREE.Mesh(nsWallGeo, wallMat);
    southWall.position.set(0, ROOM.height / 2, ROOM.depth / 2 + wallThickness / 2);
    southWall.receiveShadow = true;
    scene.add(southWall);

    // 東の壁 (X = +5)
    const eastWall = new THREE.Mesh(ewWallGeo, wallMat);
    eastWall.position.set(ROOM.width / 2 + wallThickness / 2, ROOM.height / 2, 0);
    eastWall.receiveShadow = true;
    scene.add(eastWall);

    // 西の壁 (X = -5)
    const westWall = new THREE.Mesh(ewWallGeo, wallMat);
    westWall.position.set(-ROOM.width / 2 - wallThickness / 2, ROOM.height / 2, 0);
    westWall.receiveShadow = true;
    scene.add(westWall);

    // 巾木（ベースボード）で密室の重厚感を演出
    const baseboardMat = new THREE.MeshStandardMaterial({
      color: 0x1e1510,
      roughness: 0.7,
    });
    const bbHeight = 0.14;
    const bbDepth = 0.05;
    const bbNS = new THREE.BoxGeometry(ROOM.width, bbHeight, bbDepth);
    const bbEW = new THREE.BoxGeometry(bbDepth, bbHeight, ROOM.depth);

    const bbNorth = new THREE.Mesh(bbNS, baseboardMat);
    bbNorth.position.set(0, bbHeight / 2, -ROOM.depth / 2 + bbDepth / 2);
    scene.add(bbNorth);

    const bbSouth = new THREE.Mesh(bbNS, baseboardMat);
    bbSouth.position.set(0, bbHeight / 2, ROOM.depth / 2 - bbDepth / 2);
    scene.add(bbSouth);

    const bbEast = new THREE.Mesh(bbEW, baseboardMat);
    bbEast.position.set(ROOM.width / 2 - bbDepth / 2, bbHeight / 2, 0);
    scene.add(bbEast);

    const bbWest = new THREE.Mesh(bbEW, baseboardMat);
    bbWest.position.set(-ROOM.width / 2 + bbDepth / 2, bbHeight / 2, 0);
    scene.add(bbWest);
  }

  // --- Helper: Register Interactive Object ---
  function registerInteractiveGroup(group, metadata, collisionBounds = null) {
    group.userData = {
      isInteractiveRoot: true,
      ...metadata,
    };

    group.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        child.userData.interactiveRoot = group;
        interactables.push(child);
      }
    });

    if (collisionBounds) {
      obstacleBoxes.push(collisionBounds);
    }

    scene.add(group);
  }

  // --- Build Interactive Objects (机、金庫、本棚、鍵のかかった扉) ---
  function buildObjects() {
    const darkWoodTex = createWoodTexture('#4c301e', '#2d1b10', 4);
    const oakWoodTex = createWoodTexture('#5e3d26', '#3a2314', 6);

    // ==========================================
    // 1. 古い机 (Desk) - 北壁側 (X: -1.6, Z: -3.7)
    // ==========================================
    const deskGroup = new THREE.Group();
    deskGroup.position.set(-1.6, 0, -3.7);

    const deskMat = new THREE.MeshStandardMaterial({
      map: darkWoodTex,
      roughness: 0.65,
      metalness: 0.08,
    });
    const brassMat = new THREE.MeshStandardMaterial({
      color: 0xcaa86a,
      roughness: 0.3,
      metalness: 0.85,
    });

    // 天板と本体（BoxGeometry）
    const deskTop = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.1, 1.05), deskMat);
    deskTop.position.set(0, 0.82, 0);
    deskGroup.add(deskTop);

    // 左右の脚パネル兼袖箱
    const leftPedestal = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.78, 0.95), deskMat);
    leftPedestal.position.set(-0.7, 0.39, 0);
    deskGroup.add(leftPedestal);

    const rightPedestal = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.78, 0.95), deskMat);
    rightPedestal.position.set(0.7, 0.39, 0);
    deskGroup.add(rightPedestal);

    // 中央の引き出し＆真鍮の取っ手・鍵穴
    const centerDrawer = new THREE.Mesh(new THREE.BoxGeometry(0.82, 0.18, 0.92), deskMat);
    centerDrawer.position.set(0, 0.68, 0.02);
    deskGroup.add(centerDrawer);

    const drawerHandle = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.04, 0.04), brassMat);
    drawerHandle.position.set(0, 0.68, 0.5);
    deskGroup.add(drawerHandle);

    // 机の上の古い日誌（アクセントBox）
    const diaryMat = new THREE.MeshStandardMaterial({ color: 0x6b2323, roughness: 0.8 });
    const diaryMesh = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.05, 0.48), diaryMat);
    diaryMesh.position.set(-0.25, 0.89, 0.1);
    diaryMesh.rotation.y = 0.22;
    deskGroup.add(diaryMesh);

    registerInteractiveGroup(
      deskGroup,
      {
        id: 'desk',
        name: '古い書斎机',
        category: 'FURNITURE / DESK',
        description:
          '古い机を調べた。引き出しには鍵がかかっている。\n天板の上には革装丁の手記が置かれており、「北の星から順に蔵書を辿れ」と走り書きされている。',
      },
      { minX: -2.7, maxX: -0.5, minZ: -4.3, maxZ: -3.1 }
    );

    // ==========================================
    // 2. 金庫 (Safe) - 東壁側 (X: 4.15, Z: -1.4)
    // ==========================================
    const safeGroup = new THREE.Group();
    safeGroup.position.set(4.15, 0, -1.4);

    // 金庫を載せる台座（BoxGeometry）
    const standMat = new THREE.MeshStandardMaterial({
      color: 0x22252b,
      roughness: 0.8,
      metalness: 0.3,
    });
    const safeStand = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.6, 0.9), standMat);
    safeStand.position.set(0, 0.3, 0);
    safeGroup.add(safeStand);

    // 金庫本体（重厚な鋼鉄BoxGeometry）
    const safeBodyMat = new THREE.MeshStandardMaterial({
      color: 0x353b45,
      roughness: 0.42,
      metalness: 0.75,
    });
    const safeBody = new THREE.Mesh(new THREE.BoxGeometry(0.78, 0.78, 0.78), safeBodyMat);
    safeBody.position.set(0, 0.99, 0);
    safeGroup.add(safeBody);

    // 金庫の扉パネルと4桁テンキー・ダイヤル（西向き = -X面）
    const safeDoorMat = new THREE.MeshStandardMaterial({
      color: 0x282d35,
      roughness: 0.35,
      metalness: 0.8,
    });
    const safeDoor = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.64, 0.64), safeDoorMat);
    safeDoor.position.set(-0.39, 0.99, 0);
    safeGroup.add(safeDoor);

    // テンキーパネル & 真鍮ハンドル
    const keypadMat = new THREE.MeshStandardMaterial({
      color: 0x15181e,
      emissive: 0x163824,
      emissiveIntensity: 0.5,
      roughness: 0.3,
    });
    const keypad = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.22, 0.16), keypadMat);
    keypad.position.set(-0.42, 1.06, -0.12);
    safeGroup.add(keypad);

    const safeDial = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.14, 0.14), brassMat);
    safeDial.position.set(-0.43, 0.95, 0.14);
    safeGroup.add(safeDial);

    registerInteractiveGroup(
      safeGroup,
      {
        id: 'safe',
        name: '重厚な鋼鉄の金庫',
        category: 'SECURITY / SAFE',
        description:
          '金庫がある。4桁の暗証番号が必要だ。\n電子テンキーの横には真鍮のプレートがあり、「賢者の書物が示す4つの数字を入力せよ」と刻印されている。',
      },
      { minX: 3.6, maxX: 4.7, minZ: -1.95, maxZ: -0.85 }
    );

    // ==========================================
    // 3. 本棚 (Bookshelf) - 西壁側 (X: -4.35, Z: 0.4)
    // ==========================================
    const shelfGroup = new THREE.Group();
    shelfGroup.position.set(-4.35, 0, 0.4);

    const shelfMat = new THREE.MeshStandardMaterial({
      map: oakWoodTex,
      roughness: 0.72,
      metalness: 0.05,
    });

    // 本棚本体（BoxGeometry）
    const shelfBody = new THREE.Mesh(new THREE.BoxGeometry(0.75, 2.55, 2.3), shelfMat);
    shelfBody.position.set(0, 1.275, 0);
    shelfGroup.add(shelfBody);

    // 棚の段に並ぶ蔵書群（カラフルな背表紙のBoxGeometry）
    const bookColors = [0x7a2828, 0x25476b, 0x2d5a3c, 0x6e5227, 0x4b2e59];
    const shelfHeights = [0.65, 1.25, 1.85];
    shelfHeights.forEach((h, rowIdx) => {
      for (let i = 0; i < 6; i++) {
        const bColor = bookColors[(rowIdx * 6 + i) % bookColors.length];
        const bookMat = new THREE.MeshStandardMaterial({
          color: bColor,
          roughness: 0.75,
        });
        const bookMesh = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.36, 0.12), bookMat);
        bookMesh.position.set(0.28, h, -0.75 + i * 0.28);
        shelfGroup.add(bookMesh);
      }
    });

    registerInteractiveGroup(
      shelfGroup,
      {
        id: 'bookshelf',
        name: '背の高い木製本棚',
        category: 'ARCHIVE / BOOKSHELF',
        description:
          '天井近くまで届く巨大な本棚を調べた。\n天文学や錬金術に関する古い蔵書が並んでいる。そのうち数冊だけ背表紙のローマ数字が不自然に擦り減っているようだ。',
      },
      { minX: -5.0, maxX: -3.85, minZ: -0.85, maxZ: 1.65 }
    );

    // ==========================================
    // 4. 鍵のかかった扉 (Locked Door) - 南壁中央 (X: 0, Z: 4.88)
    // ==========================================
    const doorGroup = new THREE.Group();
    doorGroup.position.set(0, 0, 4.88);

    const doorFrameMat = new THREE.MeshStandardMaterial({
      color: 0x261710,
      roughness: 0.7,
    });
    const doorPanelMat = new THREE.MeshStandardMaterial({
      map: darkWoodTex,
      roughness: 0.6,
      metalness: 0.1,
    });

    // 扉枠と扉本体（BoxGeometry）
    const doorFrame = new THREE.Mesh(new THREE.BoxGeometry(1.56, 2.55, 0.14), doorFrameMat);
    doorFrame.position.set(0, 1.275, 0);
    doorGroup.add(doorFrame);

    const doorPanel = new THREE.Mesh(new THREE.BoxGeometry(1.36, 2.42, 0.18), doorPanelMat);
    doorPanel.position.set(0, 1.21, -0.02);
    doorGroup.add(doorPanel);

    // 真鍮のドアノブと鍵穴プレート
    const knobPlate = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.28, 0.04), brassMat);
    knobPlate.position.set(0.48, 1.12, -0.12);
    doorGroup.add(knobPlate);

    const doorKnob = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.08, 0.12), brassMat);
    doorKnob.position.set(0.48, 1.15, -0.17);
    doorGroup.add(doorKnob);

    registerInteractiveGroup(
      doorGroup,
      {
        id: 'door',
        name: '重厚な脱出扉',
        category: 'EXIT / LOCKED DOOR',
        description:
          '室外へ続く唯一の重厚な木製扉だ。\n真鍮製のシリンダー錠で固く施錠されており、押しても引いてもびくともしない。脱出するには専用の「賢者の鍵」が必要だ。',
      },
      { minX: -0.85, maxX: 0.85, minZ: 4.65, maxZ: 5.0 }
    );
  }

  // --- Raycaster (画面中央 (0, 0) から常に前方判定) ---
  const raycaster = new THREE.Raycaster();
  const screenCenter = new THREE.Vector2(0, 0);

  function updateRaycast() {
    if (!controls.isLocked || isModalOpen) {
      clearHoverState();
      return;
    }

    raycaster.setFromCamera(screenCenter, camera);
    raycaster.far = PLAYER.interactDistance;

    const intersects = raycaster.intersectObjects(interactables, false);

    if (intersects.length > 0) {
      const hitMesh = intersects[0].object;
      const rootGroup = hitMesh.userData.interactiveRoot;
      if (rootGroup && rootGroup.userData.isInteractiveRoot) {
        setHoverState(rootGroup);
        return;
      }
    }

    clearHoverState();
  }

  function setHoverState(rootGroup) {
    if (hoveredInteractive === rootGroup) return;
    hoveredInteractive = rootGroup;
    crosshair.classList.add('active');
    targetHintText.textContent = `${rootGroup.userData.name} を調べる`;
    targetHint.classList.remove('hidden');
  }

  function clearHoverState() {
    if (!hoveredInteractive) return;
    hoveredInteractive = null;
    crosshair.classList.remove('active');
    targetHint.classList.add('hidden');
  }

  // --- Modal (調べるウィンドウ) Controls ---
  function openInspectModal(data) {
    isModalOpen = true;
    modalCategory.textContent = data.category || 'OBJECT INSPECTION';
    modalTitle.textContent = data.name;
    modalDescription.textContent = data.description;
    inspectModal.classList.remove('hidden');

    // リセット移動入力
    moveState.forward = false;
    moveState.backward = false;
    moveState.left = false;
    moveState.right = false;
    velocity.set(0, 0, 0);

    // モーダル表示中はマウス操作を解除
    if (controls.isLocked) {
      controls.unlock();
    }
  }

  function closeInspectModal() {
    if (!isModalOpen) return;
    isModalOpen = false;
    inspectModal.classList.add('hidden');
    // 閉じると同時に再びPointerLockで探索に復帰
    controls.lock();
  }

  // --- Collision / Boundary Helper ---
  function resolveCollisions(nextPos, currentPos) {
    // 1. 四方の壁との境界判定
    nextPos.x = Math.max(-ROOM.wallBoundary, Math.min(ROOM.wallBoundary, nextPos.x));
    nextPos.z = Math.max(-ROOM.wallBoundary, Math.min(ROOM.wallBoundary, nextPos.z));

    // 2. 室内オブジェクト（机・金庫・本棚・扉）との簡易AABB押し戻し判定
    const r = PLAYER.radius;
    for (const box of obstacleBoxes) {
      const minX = box.minX - r;
      const maxX = box.maxX + r;
      const minZ = box.minZ - r;
      const maxZ = box.maxZ + r;

      if (nextPos.x > minX && nextPos.x < maxX && nextPos.z > minZ && nextPos.z < maxZ) {
        // X移動のみ許容できるかチェック
        const canMoveX = !(
          nextPos.x > minX &&
          nextPos.x < maxX &&
          currentPos.z > minZ &&
          currentPos.z < maxZ
        );
        // Z移動のみ許容できるかチェック
        const canMoveZ = !(
          currentPos.x > minX &&
          currentPos.x < maxX &&
          nextPos.z > minZ &&
          nextPos.z < maxZ
        );

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

  // --- Event Listeners ---
  // 1. 開始画面クリックでPointerLock開始
  startOverlay.addEventListener('click', () => {
    if (!isModalOpen) {
      controls.lock();
    }
  });

  startBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (!isModalOpen) {
      controls.lock();
    }
  });

  controls.addEventListener('lock', () => {
    startOverlay.classList.add('hidden');
    inspectModal.classList.add('hidden');
    isModalOpen = false;
  });

  controls.addEventListener('unlock', () => {
    clearHoverState();
    // モーダルを開いたことによるUnlockでなければ、開始（一時停止）オーバーレイを表示
    if (!isModalOpen) {
      startOverlay.classList.remove('hidden');
    }
  });

  // 2. マウスクリックで照準のオブジェクトを調査
  window.addEventListener('mousedown', (e) => {
    if (e.button !== 0) return; // 左クリックのみ
    if (isModalOpen) return;

    if (controls.isLocked && hoveredInteractive) {
      openInspectModal(hoveredInteractive.userData);
    }
  });

  // 3. モーダルを閉じる操作（ボタンクリック / モーダル背景クリック / Enterキー）
  modalCloseBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    closeInspectModal();
  });

  inspectModal.addEventListener('click', (e) => {
    if (e.target === inspectModal) {
      closeInspectModal();
    }
  });

  // 4. キーボード操作 (WASD + 矢印キー + Enterでモーダルを閉じる)
  window.addEventListener('keydown', (e) => {
    if (isModalOpen) {
      if (e.code === 'Enter' || e.code === 'Space' || e.code === 'Escape') {
        e.preventDefault();
        closeInspectModal();
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

  // 5. 画面リサイズ処理
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  // --- Animation Loop ---
  let prevTime = performance.now();

  function animate() {
    requestAnimationFrame(animate);

    const time = performance.now();
    const delta = Math.min((time - prevTime) / 1000, 0.1);
    prevTime = time;

    if (controls.isLocked && !isModalOpen) {
      // 減衰処理
      velocity.x -= velocity.x * PLAYER.damping * delta;
      velocity.z -= velocity.z * PLAYER.damping * delta;

      // 向いている方向基準の前後左右ベクトル計算
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

      // PointerLockControlsの前後左右移動を適用
      controls.moveRight(-velocity.x * delta);
      controls.moveForward(-velocity.z * delta);

      // 壁および家具との衝突・境界判定
      const nextPos = controls.getObject().position;
      resolveCollisions(nextPos, currentPos);
      nextPos.y = PLAYER.eyeHeight;

      // Raycasterによる照準判定の更新
      updateRaycast();
    }

    renderer.render(scene, camera);
  }

  // --- Initialize Scene ---
  setupLighting();
  buildRoom();
  buildObjects();
  animate();
})();
