import * as THREE from 'three';
import { BlockType, Direction, GRID_SIZE, CELL_SIZE, VOXEL_SIZE, type Block, type Particle } from './types';

// ============ LEVEL MAP ============
// 0=empty, 1=brick, 2=steel, 3=water, 4=tree, 5=base(eagle)
const LEVEL_MAP: number[][] = [
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,1,1,0,0,1,1,0,0,1,1,0,0,1,1,0,0,1,1,0,0,1,1,0,0],
  [0,0,1,1,0,0,1,1,0,0,1,1,0,0,1,1,0,0,1,1,0,0,1,1,0,0],
  [0,0,1,1,0,0,1,1,0,0,1,1,2,2,1,1,0,0,1,1,0,0,1,1,0,0],
  [0,0,1,1,0,0,1,1,0,0,1,1,0,0,1,1,0,0,1,1,0,0,1,1,0,0],
  [0,0,1,1,0,0,1,1,0,0,0,0,0,0,0,0,0,0,1,1,0,0,1,1,0,0],
  [0,0,1,1,0,0,1,1,0,0,0,0,0,0,0,0,0,0,1,1,0,0,1,1,0,0],
  [0,0,0,0,0,0,0,0,0,0,1,1,0,0,1,1,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,1,1,0,0,1,1,0,0,0,0,0,0,0,0,0,0],
  [0,0,1,1,0,0,0,0,1,1,0,0,0,0,0,0,1,1,0,0,0,0,1,1,0,0],
  [0,0,1,1,0,0,0,0,1,1,0,0,0,0,0,0,1,1,0,0,0,0,1,1,0,0],
  [0,0,1,1,0,0,1,1,1,1,0,0,1,1,0,0,1,1,1,1,0,0,1,1,0,0],
  [0,0,0,0,0,0,1,1,0,0,0,0,1,1,0,0,0,0,1,1,0,0,0,0,0,0],
  [0,0,0,0,0,0,1,1,0,0,0,0,1,1,0,0,0,0,1,1,0,0,0,0,0,0],
  [0,0,1,1,0,0,0,0,0,0,1,1,0,0,1,1,0,0,0,0,0,0,1,1,0,0],
  [0,0,1,1,0,0,0,0,0,0,1,1,0,0,1,1,0,0,0,0,0,0,1,1,0,0],
  [0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0],
  [0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,1,0,5,0,0,1,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
];

// ============ COLORS ============
const COLORS = {
  brick: 0xc4622d,
  brickDark: 0x8b4513,
  steel: 0x8899aa,
  steelLight: 0xaabbcc,
  water: 0x2288cc,
  tree: 0x2d8b2d,
  treeDark: 0x1a5c1a,
  base: 0xffcc00,
  playerBody: 0x44aa44,
  playerTurret: 0x338833,
  playerTrack: 0x333333,
  enemyBody: 0xcc4444,
  enemyTurret: 0x993333,
  bullet: 0xffff44,
  ground: 0x1a1a2e,
  explosion: [0xff4400, 0xff8800, 0xffcc00, 0xff6600],
};

// ============ GAME ENGINE ============
export class GameEngine {
  private scene: THREE.Scene;
  private camera: THREE.OrthographicCamera;
  private renderer: THREE.WebGLRenderer;
  private container: HTMLElement;

  // Game state
  private grid: Block[][] = [];
  private blockMeshes: Map<string, THREE.Mesh> = new Map();
  private playerTank: THREE.Group | null = null;
  private playerPos = { x: 8, z: 24 };
  private playerDir: Direction = Direction.UP;
  private playerMoving = false;
  private playerSpeed = 4;
  private playerAlive = true;
  private lastShotTime = 0;
  private shotCooldown = 500;

  // Enemies
  private enemies: { group: THREE.Group; pos: { x: number; z: number }; dir: Direction; alive: boolean; moveTimer: number; shootTimer: number }[] = [];
  private enemySpawnTimer = 0;
  private enemySpawnInterval = 5000;
  private maxEnemies = 4;
  private enemiesKilled = 0;

  // Bullets
  private bullets: { mesh: THREE.Mesh; pos: THREE.Vector3; dir: Direction; speed: number; owner: 'player' | 'enemy' }[] = [];

  // Particles
  private particles: Particle[] = [];

  // Input
  private keys: Set<string> = new Set();

  // Animation
  private clock = new THREE.Clock();
  private animFrame = 0;
  private running = false;
  private score = 0;
  private lives = 3;

  // Callbacks
  private onScoreChange?: (score: number) => void;
  private onLivesChange?: (lives: number) => void;
  private onGameOver?: () => void;
  private onEnemyCountChange?: (count: number) => void;

  // Bound handlers
  private boundResize = () => {};
  private boundKeydown = (_e: KeyboardEvent) => {};
  private boundKeyup = (_e: KeyboardEvent) => {};

  constructor(container: HTMLElement) {
    this.container = container;
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0a0a1a);
    this.scene.fog = new THREE.Fog(0x0a0a1a, 30, 50);

    // Isometric camera
    const aspect = container.clientWidth / container.clientHeight;
    const frustum = 14;
    this.camera = new THREE.OrthographicCamera(
      -frustum * aspect, frustum * aspect,
      frustum, -frustum,
      0.1, 100
    );
    this.camera.position.set(20, 20, 20);
    this.camera.lookAt(GRID_SIZE / 2, 0, GRID_SIZE / 2);

    // Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(this.renderer.domElement);

    this.setupLights();
    this.initGrid();
    this.buildMap();
    this.createPlayerTank();
    this.spawnInitialEnemies();
    this.setupInput();

    this.boundResize = this.onResize.bind(this);
    window.addEventListener('resize', this.boundResize);
  }

  setCallbacks(callbacks: {
    onScoreChange?: (s: number) => void;
    onLivesChange?: (l: number) => void;
    onGameOver?: () => void;
    onEnemyCountChange?: (c: number) => void;
  }) {
    this.onScoreChange = callbacks.onScoreChange;
    this.onLivesChange = callbacks.onLivesChange;
    this.onGameOver = callbacks.onGameOver;
    this.onEnemyCountChange = callbacks.onEnemyCountChange;
  }

  private setupLights() {
    const ambient = new THREE.AmbientLight(0x404060, 0.6);
    this.scene.add(ambient);

    const dirLight = new THREE.DirectionalLight(0xffeedd, 1.2);
    dirLight.position.set(15, 25, 10);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.set(2048, 2048);
    dirLight.shadow.camera.left = -20;
    dirLight.shadow.camera.right = 20;
    dirLight.shadow.camera.top = 20;
    dirLight.shadow.camera.bottom = -20;
    this.scene.add(dirLight);

    const fillLight = new THREE.DirectionalLight(0x4488ff, 0.3);
    fillLight.position.set(-10, 10, -10);
    this.scene.add(fillLight);

    // Ground
    const groundGeo = new THREE.PlaneGeometry(GRID_SIZE + 4, GRID_SIZE + 4);
    const groundMat = new THREE.MeshStandardMaterial({ color: COLORS.ground, roughness: 0.9 });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.set(GRID_SIZE / 2, -0.01, GRID_SIZE / 2);
    ground.receiveShadow = true;
    this.scene.add(ground);

    // Grid lines
    const gridHelper = new THREE.GridHelper(GRID_SIZE, GRID_SIZE, 0x222244, 0x111133);
    gridHelper.position.set(GRID_SIZE / 2, 0.01, GRID_SIZE / 2);
    this.scene.add(gridHelper);
  }

  private initGrid() {
    this.grid = [];
    for (let z = 0; z < GRID_SIZE; z++) {
      this.grid[z] = [];
      for (let x = 0; x < GRID_SIZE; x++) {
        const type = LEVEL_MAP[z]?.[x] ?? 0;
        this.grid[z][x] = {
          type: type as BlockType,
          health: type === BlockType.STEEL ? 3 : type === BlockType.BRICK ? 2 : 1,
        };
      }
    }
  }

  private createVoxelBox(w: number, h: number, d: number, color: number, darkColor?: number): THREE.Group {
    const group = new THREE.Group();
    const geo = new THREE.BoxGeometry(w, h, d);
    const mat = new THREE.MeshStandardMaterial({ color, roughness: 0.7, metalness: 0.1 });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    group.add(mesh);

    // Add edge highlight
    if (darkColor !== undefined) {
      const edgeGeo = new THREE.BoxGeometry(w + 0.02, h + 0.02, d + 0.02);
      const edgeMat = new THREE.MeshStandardMaterial({ color: darkColor, roughness: 0.9, transparent: true, opacity: 0.3 });
      const edge = new THREE.Mesh(edgeGeo, edgeMat);
      group.add(edge);
    }

    return group;
  }

  private buildMap() {
    for (let z = 0; z < GRID_SIZE; z++) {
      for (let x = 0; x < GRID_SIZE; x++) {
        const block = this.grid[z][x];
        if (block.type === BlockType.EMPTY) continue;
        this.createBlockMesh(x, z, block.type);
      }
    }
  }

  private createBlockMesh(x: number, z: number, type: BlockType) {
    const key = `${x},${z}`;
    let group: THREE.Group;

    switch (type) {
      case BlockType.BRICK: {
        group = new THREE.Group();
        // 2x2 brick pattern
        for (let bz = 0; bz < 2; bz++) {
          for (let bx = 0; bx < 2; bx++) {
            const brick = new THREE.Mesh(
              new THREE.BoxGeometry(0.45, 0.5, 0.45),
              new THREE.MeshStandardMaterial({
                color: (bx + bz) % 2 === 0 ? COLORS.brick : COLORS.brickDark,
                roughness: 0.8
              })
            );
            brick.position.set(bx * 0.48 - 0.24, 0.25, bz * 0.48 - 0.24);
            brick.castShadow = true;
            brick.receiveShadow = true;
            group.add(brick);
          }
        }
        break;
      }
      case BlockType.STEEL: {
        group = new THREE.Group();
        const steel = new THREE.Mesh(
          new THREE.BoxGeometry(0.9, 0.7, 0.9),
          new THREE.MeshStandardMaterial({ color: COLORS.steel, roughness: 0.3, metalness: 0.8 })
        );
        steel.position.y = 0.35;
        steel.castShadow = true;
        steel.receiveShadow = true;
        group.add(steel);
        // Rivet details
        const rivetGeo = new THREE.CylinderGeometry(0.05, 0.05, 0.1, 6);
        const rivetMat = new THREE.MeshStandardMaterial({ color: COLORS.steelLight, metalness: 0.9 });
        [[-0.3, -0.3], [0.3, -0.3], [-0.3, 0.3], [0.3, 0.3]].forEach(([rx, rz]) => {
          const rivet = new THREE.Mesh(rivetGeo, rivetMat);
          rivet.position.set(rx, 0.72, rz);
          group.add(rivet);
        });
        break;
      }
      case BlockType.WATER: {
        group = new THREE.Group();
        const water = new THREE.Mesh(
          new THREE.BoxGeometry(0.9, 0.3, 0.9),
          new THREE.MeshStandardMaterial({ color: COLORS.water, roughness: 0.1, metalness: 0.3, transparent: true, opacity: 0.7 })
        );
        water.position.y = 0.15;
        group.add(water);
        break;
      }
      case BlockType.TREE: {
        group = new THREE.Group();
        for (let ty = 0; ty < 3; ty++) {
          const leaf = new THREE.Mesh(
            new THREE.BoxGeometry(0.8 - ty * 0.15, 0.3, 0.8 - ty * 0.15),
            new THREE.MeshStandardMaterial({ color: ty === 2 ? COLORS.treeDark : COLORS.tree, roughness: 0.9 })
          );
          leaf.position.y = 0.3 + ty * 0.3;
          leaf.castShadow = true;
          group.add(leaf);
        }
        break;
      }
      case BlockType.BASE: {
        group = new THREE.Group();
        // Eagle/base
        const base = new THREE.Mesh(
          new THREE.BoxGeometry(0.8, 0.8, 0.8),
          new THREE.MeshStandardMaterial({ color: COLORS.base, roughness: 0.3, metalness: 0.5, emissive: COLORS.base, emissiveIntensity: 0.2 })
        );
        base.position.y = 0.4;
        base.castShadow = true;
        group.add(base);
        // Wings
        const wingGeo = new THREE.BoxGeometry(0.3, 0.1, 0.6);
        const wingMat = new THREE.MeshStandardMaterial({ color: 0xffaa00, metalness: 0.6 });
        const leftWing = new THREE.Mesh(wingGeo, wingMat);
        leftWing.position.set(-0.5, 0.5, 0);
        group.add(leftWing);
        const rightWing = new THREE.Mesh(wingGeo, wingMat);
        rightWing.position.set(0.5, 0.5, 0);
        group.add(rightWing);
        break;
      }
      default:
        return;
    }

    group.position.set(x + 0.5, 0, z + 0.5);
    this.scene.add(group);
    this.blockMeshes.set(key, group as unknown as THREE.Mesh);
  }

  private removeBlockMesh(x: number, z: number) {
    const key = `${x},${z}`;
    const mesh = this.blockMeshes.get(key);
    if (mesh) {
      this.scene.remove(mesh);
      this.blockMeshes.delete(key);
    }
  }

  private createPlayerTank() {
    this.playerTank = this.buildTank(COLORS.playerBody, COLORS.playerTurret, COLORS.playerTrack);
    this.playerTank.position.set(this.playerPos.x + 0.5, 0, this.playerPos.z + 0.5);
    this.scene.add(this.playerTank!);
  }

  private buildTank(bodyColor: number, turretColor: number, trackColor: number): THREE.Group {
    const tank = new THREE.Group();

    // Tracks
    const trackGeo = new THREE.BoxGeometry(0.25, 0.2, 0.8);
    const trackMat = new THREE.MeshStandardMaterial({ color: trackColor, roughness: 0.9 });
    const leftTrack = new THREE.Mesh(trackGeo, trackMat);
    leftTrack.position.set(-0.35, 0.1, 0);
    leftTrack.castShadow = true;
    tank.add(leftTrack);
    const rightTrack = new THREE.Mesh(trackGeo, trackMat);
    rightTrack.position.set(0.35, 0.1, 0);
    rightTrack.castShadow = true;
    tank.add(rightTrack);

    // Track details (little bumps)
    for (let i = 0; i < 4; i++) {
      const bump = new THREE.Mesh(
        new THREE.BoxGeometry(0.28, 0.05, 0.08),
        new THREE.MeshStandardMaterial({ color: 0x222222 })
      );
      bump.position.set(-0.35, 0.22, -0.3 + i * 0.2);
      tank.add(bump);
      const bump2 = bump.clone();
      bump2.position.set(0.35, 0.22, -0.3 + i * 0.2);
      tank.add(bump2);
    }

    // Body
    const bodyGeo = new THREE.BoxGeometry(0.55, 0.25, 0.6);
    const bodyMat = new THREE.MeshStandardMaterial({ color: bodyColor, roughness: 0.6, metalness: 0.2 });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = 0.3;
    body.castShadow = true;
    tank.add(body);

    // Turret base
    const turretBase = new THREE.Mesh(
      new THREE.BoxGeometry(0.4, 0.15, 0.4),
      new THREE.MeshStandardMaterial({ color: turretColor, roughness: 0.5, metalness: 0.3 })
    );
    turretBase.position.y = 0.5;
    turretBase.castShadow = true;
    tank.add(turretBase);

    // Barrel
    const barrel = new THREE.Mesh(
      new THREE.BoxGeometry(0.1, 0.1, 0.5),
      new THREE.MeshStandardMaterial({ color: turretColor, roughness: 0.4, metalness: 0.5 })
    );
    barrel.position.set(0, 0.5, -0.4);
    barrel.castShadow = true;
    tank.add(barrel);

    // Barrel tip
    const tip = new THREE.Mesh(
      new THREE.BoxGeometry(0.14, 0.14, 0.08),
      new THREE.MeshStandardMaterial({ color: 0x222222, metalness: 0.8 })
    );
    tip.position.set(0, 0.5, -0.65);
    tank.add(tip);

    return tank;
  }

  private spawnInitialEnemies() {
    const spawnPoints = [
      { x: 0, z: 0 },
      { x: 12, z: 0 },
      { x: 24, z: 0 },
    ];
    for (let i = 0; i < 2; i++) {
      this.spawnEnemy(spawnPoints[i % spawnPoints.length]);
    }
  }

  private spawnEnemy(spawn: { x: number; z: number }) {
    if (this.enemies.filter(e => e.alive).length >= this.maxEnemies) return;

    const tank = this.buildTank(COLORS.enemyBody, COLORS.enemyTurret, 0x444444);
    tank.position.set(spawn.x + 0.5, 0, spawn.z + 0.5);
    this.scene.add(tank);

    this.enemies.push({
      group: tank,
      pos: { x: spawn.x, z: spawn.z },
      dir: Direction.DOWN,
      alive: true,
      moveTimer: 0,
      shootTimer: Math.random() * 2000 + 1000,
    });
  }

  private setupInput() {
    this.boundKeydown = (e: KeyboardEvent) => {
      this.keys.add(e.key.toLowerCase());
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        this.playerShoot();
      }
    };
    this.boundKeyup = (e: KeyboardEvent) => {
      this.keys.delete(e.key.toLowerCase());
    };
    window.addEventListener('keydown', this.boundKeydown);
    window.addEventListener('keyup', this.boundKeyup);
  }

  private playerShoot() {
    const now = Date.now();
    if (now - this.lastShotTime < this.shotCooldown) return;
    if (!this.playerAlive) return;
    this.lastShotTime = now;
    this.shootBullet(this.playerPos.x + 0.5, this.playerPos.z + 0.5, this.playerDir, 'player');
  }

  private shootBullet(x: number, z: number, dir: Direction, owner: 'player' | 'enemy') {
    const bulletGeo = new THREE.BoxGeometry(0.15, 0.15, 0.15);
    const bulletMat = new THREE.MeshStandardMaterial({
      color: COLORS.bullet,
      emissive: COLORS.bullet,
      emissiveIntensity: 0.8,
    });
    const bullet = new THREE.Mesh(bulletGeo, bulletMat);

    const offset = this.getDirectionOffset(dir, 0.6);
    bullet.position.set(x + offset.x, 0.4, z + offset.z);

    // Add glow
    const glowGeo = new THREE.BoxGeometry(0.25, 0.25, 0.25);
    const glowMat = new THREE.MeshBasicMaterial({ color: COLORS.bullet, transparent: true, opacity: 0.3 });
    const glow = new THREE.Mesh(glowGeo, glowMat);
    bullet.add(glow);

    this.scene.add(bullet);
    this.bullets.push({
      mesh: bullet,
      pos: bullet.position.clone(),
      dir,
      speed: 12,
      owner,
    });
  }

  private getDirectionOffset(dir: Direction, dist: number): { x: number; z: number } {
    switch (dir) {
      case Direction.UP: return { x: 0, z: -dist };
      case Direction.DOWN: return { x: 0, z: dist };
      case Direction.LEFT: return { x: -dist, z: 0 };
      case Direction.RIGHT: return { x: dist, z: 0 };
    }
  }

  private getDirectionVector(dir: Direction): { x: number; z: number } {
    switch (dir) {
      case Direction.UP: return { x: 0, z: -1 };
      case Direction.DOWN: return { x: 0, z: 1 };
      case Direction.LEFT: return { x: -1, z: 0 };
      case Direction.RIGHT: return { x: 1, z: 0 };
    }
  }

  private spawnExplosion(x: number, y: number, z: number, size: number = 1) {
    const count = Math.floor(8 * size);
    for (let i = 0; i < count; i++) {
      const s = 0.1 + Math.random() * 0.15 * size;
      const geo = new THREE.BoxGeometry(s, s, s);
      const color = COLORS.explosion[Math.floor(Math.random() * COLORS.explosion.length)];
      const mat = new THREE.MeshBasicMaterial({ color });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(x, y, z);
      this.scene.add(mesh);

      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 4 * size;
      const vy = 2 + Math.random() * 5;

      this.particles.push({
        mesh,
        velocity: new THREE.Vector3(
          Math.cos(angle) * speed,
          vy,
          Math.sin(angle) * speed
        ),
        life: 0.5 + Math.random() * 0.5,
        maxLife: 1,
      });
    }

    // Flash light
    const light = new THREE.PointLight(0xff6600, 3 * size, 5);
    light.position.set(x, y + 1, z);
    this.scene.add(light);
    setTimeout(() => this.scene.remove(light), 150);
  }

  private updatePlayer(delta: number) {
    if (!this.playerAlive || !this.playerTank) return;

    let dx = 0, dz = 0;
    let newDir = this.playerDir;
    this.playerMoving = false;

    if (this.keys.has('w') || this.keys.has('arrowup')) { newDir = Direction.UP; dz = -1; this.playerMoving = true; }
    else if (this.keys.has('s') || this.keys.has('arrowdown')) { newDir = Direction.DOWN; dz = 1; this.playerMoving = true; }
    else if (this.keys.has('a') || this.keys.has('arrowleft')) { newDir = Direction.LEFT; dx = -1; this.playerMoving = true; }
    else if (this.keys.has('d') || this.keys.has('arrowright')) { newDir = Direction.RIGHT; dx = 1; this.playerMoving = true; }

    this.playerDir = newDir;

    // Rotate tank
    const targetRotY = [0, -Math.PI / 2, Math.PI, Math.PI / 2][newDir];
    this.playerTank.rotation.y += (targetRotY - this.playerTank.rotation.y) * 0.2;

    if (this.playerMoving) {
      const newX = this.playerPos.x + dx * this.playerSpeed * delta;
      const newZ = this.playerPos.z + dz * this.playerSpeed * delta;

      // Collision check
      if (this.canMoveTo(newX, newZ)) {
        this.playerPos.x = newX;
        this.playerPos.z = newZ;
      } else if (dx !== 0 && this.canMoveTo(newX, this.playerPos.z)) {
        this.playerPos.x = newX;
      } else if (dz !== 0 && this.canMoveTo(this.playerPos.x, newZ)) {
        this.playerPos.z = newZ;
      }

      this.playerTank.position.set(this.playerPos.x + 0.5, 0, this.playerPos.z + 0.5);

      // Bob animation
      this.playerTank.position.y = Math.sin(Date.now() * 0.01) * 0.02;
    }
  }

  private canMoveTo(x: number, z: number): boolean {
    // Check bounds
    if (x < 0 || x > GRID_SIZE - 1 || z < 0 || z > GRID_SIZE - 1) return false;

    // Check all 4 corners of the tank (tank is ~0.8 wide)
    const halfSize = 0.35;
    const corners = [
      { x: x - halfSize, z: z - halfSize },
      { x: x + halfSize, z: z - halfSize },
      { x: x - halfSize, z: z + halfSize },
      { x: x + halfSize, z: z + halfSize },
    ];

    for (const corner of corners) {
      const gx = Math.floor(corner.x);
      const gz = Math.floor(corner.z);
      if (gx < 0 || gx >= GRID_SIZE || gz < 0 || gz >= GRID_SIZE) return false;
      const block = this.grid[gz][gx];
      if (block.type === BlockType.BRICK || block.type === BlockType.STEEL || block.type === BlockType.WATER || block.type === BlockType.BASE) {
        return false;
      }
    }

    // Check enemy collision
    for (const enemy of this.enemies) {
      if (!enemy.alive) continue;
      const dist = Math.abs(x - enemy.pos.x) + Math.abs(z - enemy.pos.z);
      if (dist < 0.8) return false;
    }

    return true;
  }

  private updateEnemies(delta: number) {
    this.enemySpawnTimer += delta * 1000;
    if (this.enemySpawnTimer > this.enemySpawnInterval) {
      this.enemySpawnTimer = 0;
      const spawnPoints = [{ x: 0, z: 0 }, { x: 12, z: 0 }, { x: 24, z: 0 }];
      this.spawnEnemy(spawnPoints[Math.floor(Math.random() * spawnPoints.length)]);
    }

    for (const enemy of this.enemies) {
      if (!enemy.alive) continue;

      enemy.moveTimer += delta * 1000;
      enemy.shootTimer -= delta * 1000;

      // Change direction periodically
      if (enemy.moveTimer > 1500 + Math.random() * 2000) {
        enemy.moveTimer = 0;
        // Sometimes aim toward player
        if (Math.random() < 0.4) {
          const dx = this.playerPos.x - enemy.pos.x;
          const dz = this.playerPos.z - enemy.pos.z;
          if (Math.abs(dx) > Math.abs(dz)) {
            enemy.dir = dx > 0 ? Direction.RIGHT : Direction.LEFT;
          } else {
            enemy.dir = dz > 0 ? Direction.DOWN : Direction.UP;
          }
        } else {
          enemy.dir = Math.floor(Math.random() * 4) as Direction;
        }
      }

      // Move
      const vec = this.getDirectionVector(enemy.dir);
      const newX = enemy.pos.x + vec.x * 2 * delta;
      const newZ = enemy.pos.z + vec.z * 2 * delta;

      if (this.canMoveToEnemy(newX, newZ, enemy)) {
        enemy.pos.x = newX;
        enemy.pos.z = newZ;
      } else {
        enemy.moveTimer = 99999; // Force direction change
      }

      enemy.group.position.set(enemy.pos.x + 0.5, 0, enemy.pos.z + 0.5);
      const targetRotY = [0, -Math.PI / 2, Math.PI, Math.PI / 2][enemy.dir];
      enemy.group.rotation.y += (targetRotY - enemy.group.rotation.y) * 0.15;
      enemy.group.position.y = Math.sin(Date.now() * 0.008 + enemy.pos.x) * 0.02;

      // Shoot
      if (enemy.shootTimer <= 0) {
        enemy.shootTimer = 1500 + Math.random() * 2000;
        this.shootBullet(enemy.pos.x + 0.5, enemy.pos.z + 0.5, enemy.dir, 'enemy');
      }
    }
  }

  private canMoveToEnemy(x: number, z: number, self: typeof this.enemies[0]): boolean {
    if (x < 0 || x > GRID_SIZE - 1 || z < 0 || z > GRID_SIZE - 1) return false;
    const halfSize = 0.35;
    const corners = [
      { x: x - halfSize, z: z - halfSize },
      { x: x + halfSize, z: z - halfSize },
      { x: x - halfSize, z: z + halfSize },
      { x: x + halfSize, z: z + halfSize },
    ];
    for (const corner of corners) {
      const gx = Math.floor(corner.x);
      const gz = Math.floor(corner.z);
      if (gx < 0 || gx >= GRID_SIZE || gz < 0 || gz >= GRID_SIZE) return false;
      const block = this.grid[gz][gx];
      if (block.type === BlockType.BRICK || block.type === BlockType.STEEL || block.type === BlockType.WATER || block.type === BlockType.BASE) {
        return false;
      }
    }
    // Check other enemies
    for (const other of this.enemies) {
      if (other === self || !other.alive) continue;
      if (Math.abs(x - other.pos.x) < 0.8 && Math.abs(z - other.pos.z) < 0.8) return false;
    }
    // Check player
    if (this.playerAlive && Math.abs(x - this.playerPos.x) < 0.8 && Math.abs(z - this.playerPos.z) < 0.8) return false;
    return true;
  }

  private updateBullets(delta: number) {
    for (let i = this.bullets.length - 1; i >= 0; i--) {
      const bullet = this.bullets[i];
      const vec = this.getDirectionVector(bullet.dir);
      bullet.pos.x += vec.x * bullet.speed * delta;
      bullet.pos.z += vec.z * bullet.speed * delta;
      bullet.mesh.position.copy(bullet.pos);

      // Check bounds
      if (bullet.pos.x < 0 || bullet.pos.x > GRID_SIZE || bullet.pos.z < 0 || bullet.pos.z > GRID_SIZE) {
        this.scene.remove(bullet.mesh);
        this.bullets.splice(i, 1);
        this.spawnExplosion(bullet.pos.x, 0.3, bullet.pos.z, 0.5);
        continue;
      }

      // Check block collision
      const gx = Math.floor(bullet.pos.x);
      const gz = Math.floor(bullet.pos.z);
      if (gx >= 0 && gx < GRID_SIZE && gz >= 0 && gz < GRID_SIZE) {
        const block = this.grid[gz][gx];
        if (block.type === BlockType.BRICK) {
          block.health--;
          if (block.health <= 0) {
            block.type = BlockType.EMPTY;
            this.removeBlockMesh(gx, gz);
            this.spawnExplosion(gx + 0.5, 0.3, gz + 0.5, 0.7);
          } else {
            this.spawnExplosion(bullet.pos.x, 0.3, bullet.pos.z, 0.3);
          }
          this.scene.remove(bullet.mesh);
          this.bullets.splice(i, 1);
          continue;
        }
        if (block.type === BlockType.STEEL) {
          block.health--;
          if (block.health <= 0) {
            block.type = BlockType.EMPTY;
            this.removeBlockMesh(gx, gz);
          }
          this.spawnExplosion(bullet.pos.x, 0.3, bullet.pos.z, 0.4);
          this.scene.remove(bullet.mesh);
          this.bullets.splice(i, 1);
          continue;
        }
        if (block.type === BlockType.BASE) {
          block.type = BlockType.EMPTY;
          this.removeBlockMesh(gx, gz);
          this.spawnExplosion(gx + 0.5, 0.5, gz + 0.5, 2);
          this.scene.remove(bullet.mesh);
          this.bullets.splice(i, 1);
          this.gameOver();
          continue;
        }
      }

      // Check enemy hit (player bullets)
      if (bullet.owner === 'player') {
        for (const enemy of this.enemies) {
          if (!enemy.alive) continue;
          const dist = Math.abs(bullet.pos.x - (enemy.pos.x + 0.5)) + Math.abs(bullet.pos.z - (enemy.pos.z + 0.5));
          if (dist < 0.6) {
            enemy.alive = false;
            this.scene.remove(enemy.group);
            this.spawnExplosion(enemy.pos.x + 0.5, 0.5, enemy.pos.z + 0.5, 1.5);
            this.scene.remove(bullet.mesh);
            this.bullets.splice(i, 1);
            this.score += 100;
            this.enemiesKilled++;
            this.onScoreChange?.(this.score);
            this.onEnemyCountChange?.(this.enemies.filter(e => e.alive).length);
            break;
          }
        }
      }

      // Check player hit (enemy bullets)
      if (bullet.owner === 'enemy' && this.playerAlive) {
        const dist = Math.abs(bullet.pos.x - (this.playerPos.x + 0.5)) + Math.abs(bullet.pos.z - (this.playerPos.z + 0.5));
        if (dist < 0.6) {
          this.spawnExplosion(this.playerPos.x + 0.5, 0.5, this.playerPos.z + 0.5, 1.5);
          this.scene.remove(bullet.mesh);
          this.bullets.splice(i, 1);
          this.playerHit();
          continue;
        }
      }
    }
  }

  private playerHit() {
    this.lives--;
    this.onLivesChange?.(this.lives);
    if (this.lives <= 0) {
      this.playerAlive = false;
      if (this.playerTank) {
        this.scene.remove(this.playerTank);
        this.playerTank = null;
      }
      this.gameOver();
    } else {
      // Respawn
      this.playerPos = { x: 8, z: 24 };
      this.playerDir = Direction.UP;
      if (this.playerTank) {
        this.playerTank.position.set(this.playerPos.x + 0.5, 0, this.playerPos.z + 0.5);
        this.playerTank.rotation.y = 0;
      }
    }
  }

  private gameOver() {
    this.running = false;
    this.onGameOver?.();
  }

  private updateParticles(delta: number) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life -= delta;
      if (p.life <= 0) {
        this.scene.remove(p.mesh);
        this.particles.splice(i, 1);
        continue;
      }
      p.velocity.y -= 9.8 * delta;
      p.mesh.position.add(p.velocity.clone().multiplyScalar(delta));
      p.mesh.rotation.x += delta * 5;
      p.mesh.rotation.z += delta * 3;
      const scale = p.life / p.maxLife;
      p.mesh.scale.setScalar(scale);
      if (p.mesh.position.y < 0) {
        p.mesh.position.y = 0;
        p.velocity.y *= -0.3;
        p.velocity.x *= 0.7;
        p.velocity.z *= 0.7;
      }
    }
  }

  private updateCamera() {
    if (!this.playerTank) return;
    const target = new THREE.Vector3(this.playerPos.x + 0.5, 0, this.playerPos.z + 0.5);
    const offset = new THREE.Vector3(15, 15, 15);
    const desired = target.clone().add(offset);
    this.camera.position.lerp(desired, 0.05);
    this.camera.lookAt(target);
  }

  start() {
    this.running = true;
    this.clock.start();
    this.animate();
  }

  stop() {
    this.running = false;
  }

  restart() {
    // Clear everything
    this.bullets.forEach(b => this.scene.remove(b.mesh));
    this.bullets = [];
    this.particles.forEach(p => this.scene.remove(p.mesh));
    this.particles = [];
    this.enemies.forEach(e => { if (e.group.parent) this.scene.remove(e.group); });
    this.enemies = [];

    // Reset grid
    this.blockMeshes.forEach((mesh) => this.scene.remove(mesh));
    this.blockMeshes.clear();
    this.initGrid();
    this.buildMap();

    // Reset player
    this.playerPos = { x: 8, z: 24 };
    this.playerDir = Direction.UP;
    this.playerAlive = true;
    this.lives = 3;
    this.score = 0;
    this.enemiesKilled = 0;
    this.onScoreChange?.(0);
    this.onLivesChange?.(3);

    if (this.playerTank) this.scene.remove(this.playerTank);
    this.createPlayerTank();
    this.spawnInitialEnemies();

    this.running = true;
    this.clock.start();
    this.animate();
  }

  private animate() {
    if (!this.running) return;
    requestAnimationFrame(this.animate.bind(this));

    const delta = Math.min(this.clock.getDelta(), 0.05);
    this.animFrame++;

    this.updatePlayer(delta);
    this.updateEnemies(delta);
    this.updateBullets(delta);
    this.updateParticles(delta);
    this.updateCamera();

    // Water animation
    if (this.animFrame % 30 === 0) {
      this.blockMeshes.forEach((mesh, key) => {
        const [x, z] = key.split(',').map(Number);
        if (this.grid[z]?.[x]?.type === BlockType.WATER) {
          mesh.position.y = Math.sin(Date.now() * 0.003 + x + z) * 0.05;
        }
      });
    }

    this.renderer.render(this.scene, this.camera);
  }

  private onResize() {
    const w = this.container.clientWidth;
    const h = this.container.clientHeight;
    const aspect = w / h;
    const frustum = 14;
    this.camera.left = -frustum * aspect;
    this.camera.right = frustum * aspect;
    this.camera.top = frustum;
    this.camera.bottom = -frustum;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  }

  dispose() {
    this.running = false;
    window.removeEventListener('resize', this.boundResize);
    window.removeEventListener('keydown', this.boundKeydown);
    window.removeEventListener('keyup', this.boundKeyup);
    this.renderer.dispose();
    if (this.renderer.domElement.parentElement) {
      this.renderer.domElement.parentElement.removeChild(this.renderer.domElement);
    }
  }

  getScore() { return this.score; }
  getLives() { return this.lives; }
  getEnemiesAlive() { return this.enemies.filter(e => e.alive).length; }
}
