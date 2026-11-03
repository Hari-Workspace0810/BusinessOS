import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { Play, Pause, RotateCcw, Volume2, VolumeX, Shield, Zap, Package, Award, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Crosshair } from 'lucide-react';

interface GameScore {
  deliveries: number;
  score: number;
  timeRemaining: number;
  battery: number;
}

export const SupplyChainGame3D: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [gameState, setGameState] = useState<'title' | 'playing' | 'paused' | 'gameover' | 'victory'>('title');
  const [score, setScore] = useState<GameScore>({
    deliveries: 0,
    score: 0,
    timeRemaining: 90,
    battery: 100,
  });
  const [highScore, setHighScore] = useState<number>(() => {
    return parseInt(localStorage.getItem('businessos_drone_highscore') || '0', 10);
  });
  const [hasCargo, setHasCargo] = useState<boolean>(false);
  const [altitude, setAltitude] = useState<number>(2.0);
  const [speed, setSpeed] = useState<number>(0);
  const [muted, setMuted] = useState<boolean>(false);
  const [activeZone, setActiveZone] = useState<'pickup' | 'delivery'>('pickup');

  // Internal game engine references
  const gameLoopRef = useRef<number | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const rotorOscRef = useRef<OscillatorNode | null>(null);
  const rotorGainRef = useRef<GainNode | null>(null);

  // Flight simulation state
  const stateRef = useRef({
    dronePos: new THREE.Vector3(0, 2.5, 0),
    droneVel: new THREE.Vector3(0, 0, 0),
    droneRot: new THREE.Euler(0, 0, 0, 'YXZ'),
    targetAltitude: 2.5,
    isCarrying: false,
    keys: {
      KeyW: false,
      KeyS: false,
      KeyA: false,
      KeyD: false,
      ArrowUp: false,
      ArrowDown: false,
      ArrowLeft: false,
      ArrowRight: false,
      Space: false,
      ShiftLeft: false,
      ShiftRight: false,
      KeyE: false,
    },
    deliveries: 0,
    score: 0,
    battery: 100,
    timeLeft: 90,
    gameState: 'title' as 'title' | 'playing' | 'paused' | 'gameover' | 'victory',
    pickupPos: new THREE.Vector3(-14, 0.5, -12),
    deliveryPos: new THREE.Vector3(14, 0.5, 12),
    hazards: [] as Array<{ mesh: THREE.Mesh; axis: 'x' | 'z'; min: number; max: number; speed: number; dir: number }>,
    rotors: [] as THREE.Mesh[],
    cargoMesh: null as THREE.Mesh | null,
    deliveryBeacon: null as THREE.Mesh | null,
    pickupBeacon: null as THREE.Mesh | null,
  });

  // Sound Synthesizer via Web Audio API
  const initAudio = () => {
    if (audioCtxRef.current) return;
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioCtxRef.current = ctx;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(80, ctx.currentTime);
      gain.gain.setValueAtTime(muted ? 0 : 0.05, ctx.currentTime);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();

      rotorOscRef.current = osc;
      rotorGainRef.current = gain;
    } catch (e) {
      console.warn('Web Audio init failed:', e);
    }
  };

  const playPickupSound = () => {
    if (muted || !audioCtxRef.current) return;
    try {
      const ctx = audioCtxRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } catch (e) {
      // ignore
    }
  };

  const playDeliverySound = () => {
    if (muted || !audioCtxRef.current) return;
    try {
      const ctx = audioCtxRef.current;
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.08);
        gain.gain.setValueAtTime(0.15, ctx.currentTime + i * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.08 + 0.2);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + i * 0.08);
        osc.stop(ctx.currentTime + i * 0.08 + 0.2);
      });
    } catch (e) {
      // ignore
    }
  };

  const playHazardBuzz = () => {
    if (muted || !audioCtxRef.current) return;
    try {
      const ctx = audioCtxRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(110, ctx.currentTime);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    } catch (e) {
      // ignore
    }
  };

  // Toggle Mute
  useEffect(() => {
    if (rotorGainRef.current && audioCtxRef.current) {
      rotorGainRef.current.gain.setValueAtTime(
        muted ? 0 : 0.05,
        audioCtxRef.current.currentTime
      );
    }
  }, [muted]);

  // Main Three.js Scene Setup & Simulation Loop
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Detect software WebGL per directives
    const isSoftwareGl = (() => {
      const gl = document.createElement('canvas').getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0f1d);
    scene.fog = new THREE.FogExp2(0x0a0f1d, 0.02);

    const camera = new THREE.PerspectiveCamera(
      60,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    );
    camera.position.set(0, 8, 14);

    // 2. Renderer with Color Pipeline
    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    // 3. Studio Environment Reflection
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // 4. Lighting Rig
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xe0f2fe, 1.4);
    sunLight.position.set(20, 30, 15);
    sunLight.castShadow = !isSoftwareGl;
    sunLight.shadow.mapSize.width = 1024;
    sunLight.shadow.mapSize.height = 1024;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 60;
    sunLight.shadow.camera.left = -25;
    sunLight.shadow.camera.right = 25;
    sunLight.shadow.camera.top = 25;
    sunLight.shadow.camera.bottom = -25;
    scene.add(sunLight);

    // 5. Procedural Warehouse Environment
    // Concrete Floor with Hazard Striping
    const floorGeo = new THREE.PlaneGeometry(60, 60);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.8,
      metalness: 0.2,
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = !isSoftwareGl;
    scene.add(floor);

    // Grid lines
    const grid = new THREE.GridHelper(60, 30, 0x0284c7, 0x334155);
    grid.position.y = 0.01;
    scene.add(grid);

    // Warehouse Shelving Racks & Pallet Stacks
    const rackMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.7, roughness: 0.4 });
    const crateMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.6, metalness: 0.1 });
    const palletGroup = new THREE.Group();

    const rackPositions = [
      { x: -16, z: 0 },
      { x: 16, z: 0 },
      { x: 0, z: -18 },
      { x: 0, z: 18 },
    ];

    rackPositions.forEach((pos) => {
      // Rack uprights
      const rackWidth = 14;
      const rackHeight = 8;
      const rackDepth = 4;
      const rackFrame = new THREE.Group();

      const beamGeo = new THREE.BoxGeometry(rackWidth, 0.2, 0.2);
      const postGeo = new THREE.BoxGeometry(0.2, rackHeight, 0.2);

      // 4 upright posts
      [-rackWidth / 2, rackWidth / 2].forEach((px) => {
        [-rackDepth / 2, rackDepth / 2].forEach((pz) => {
          const post = new THREE.Mesh(postGeo, rackMat);
          post.position.set(px, rackHeight / 2, pz);
          post.castShadow = !isSoftwareGl;
          rackFrame.add(post);
        });
      });

      // 3 horizontal tiers
      [1.5, 4.0, 6.5].forEach((tierY) => {
        const beamFront = new THREE.Mesh(beamGeo, rackMat);
        beamFront.position.set(0, tierY, rackDepth / 2);
        rackFrame.add(beamFront);

        const beamBack = new THREE.Mesh(beamGeo, rackMat);
        beamBack.position.set(0, tierY, -rackDepth / 2);
        rackFrame.add(beamBack);

        // Crates on tiers
        [-4, 0, 4].forEach((cx) => {
          const crateGeo = new THREE.BoxGeometry(1.6, 1.2, 1.6);
          const crate = new THREE.Mesh(crateGeo, crateMat);
          crate.position.set(cx, tierY + 0.6, 0);
          crate.castShadow = !isSoftwareGl;
          rackFrame.add(crate);
        });
      });

      rackFrame.position.set(pos.x, 0, pos.z);
      palletGroup.add(rackFrame);
    });
    scene.add(palletGroup);

    // 6. Drone Composite Model (Group with 8 parts)
    const drone = new THREE.Group();
    drone.position.copy(stateRef.current.dronePos);

    // Fuselage / Central Hub (Hexagonal aerocenter)
    const hubGeo = new THREE.CylinderGeometry(0.7, 0.8, 0.35, 6);
    const hubMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      metalness: 0.85,
      roughness: 0.25,
    });
    const hub = new THREE.Mesh(hubGeo, hubMat);
    hub.castShadow = !isSoftwareGl;
    drone.add(hub);

    // Cockpit sensor dome
    const domeGeo = new THREE.SphereGeometry(0.4, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2);
    const domeMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      metalness: 0.9,
      roughness: 0.1,
    });
    const dome = new THREE.Mesh(domeGeo, domeMat);
    dome.position.y = 0.18;
    drone.add(dome);

    // 4 Carbon-Fiber Tubular Rotor Arms
    const armGeo = new THREE.CylinderGeometry(0.06, 0.06, 1.8);
    const armMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.5,
      metalness: 0.7,
    });
    const rotorAngles = [Math.PI / 4, (3 * Math.PI) / 4, (5 * Math.PI) / 4, (7 * Math.PI) / 4];
    const rotorsList: THREE.Mesh[] = [];

    rotorAngles.forEach((ang) => {
      const arm = new THREE.Mesh(armGeo, armMat);
      arm.rotation.z = Math.PI / 2;
      arm.rotation.y = ang;
      drone.add(arm);

      // Motor Pod
      const motorGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.25, 12);
      const motorMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.9, roughness: 0.3 });
      const motor = new THREE.Mesh(motorGeo, motorMat);
      const motorDist = 0.9;
      motor.position.set(Math.cos(ang) * motorDist, 0.1, Math.sin(ang) * motorDist);
      drone.add(motor);

      // Twin-blade Propeller
      const propGeo = new THREE.BoxGeometry(0.9, 0.02, 0.1);
      const propMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.4, metalness: 0.5 });
      const prop = new THREE.Mesh(propGeo, propMat);
      prop.position.set(Math.cos(ang) * motorDist, 0.25, Math.sin(ang) * motorDist);
      drone.add(prop);
      rotorsList.push(prop);

      // Navigation LED
      const ledColor = ang < Math.PI ? 0xef4444 : 0x10b981; // Red Port, Green Starboard
      const ledGeo = new THREE.SphereGeometry(0.05, 8, 8);
      const ledMat = new THREE.MeshBasicMaterial({ color: ledColor });
      const led = new THREE.Mesh(ledGeo, ledMat);
      led.position.set(Math.cos(ang) * (motorDist + 0.15), 0.1, Math.sin(ang) * (motorDist + 0.15));
      drone.add(led);
    });
    stateRef.current.rotors = rotorsList;

    // Drone Spotlight pointing to floor
    const droneLight = new THREE.SpotLight(0x38bdf8, 4, 15, Math.PI / 5, 0.4, 1.2);
    droneLight.position.set(0, -0.1, 0.2);
    droneLight.target.position.set(0, -10, 2);
    drone.add(droneLight);
    drone.add(droneLight.target);

    // Magnetic Claws undercarriage
    const clawMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.8, roughness: 0.3 });
    const clawL = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.3, 0.1), clawMat);
    clawL.position.set(-0.3, -0.3, 0);
    const clawR = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.3, 0.1), clawMat);
    clawR.position.set(0.3, -0.3, 0);
    drone.add(clawL);
    drone.add(clawR);

    scene.add(drone);

    // 7. Interactive Cargo Crate (Pickup)
    const cargoGeo = new THREE.BoxGeometry(0.9, 0.9, 0.9);
    const cargoCrateMat = new THREE.MeshStandardMaterial({
      color: 0x10b981,
      metalness: 0.4,
      roughness: 0.4,
      emissive: 0x059669,
      emissiveIntensity: 0.3,
    });
    const cargoMesh = new THREE.Mesh(cargoGeo, cargoCrateMat);
    cargoMesh.position.copy(stateRef.current.pickupPos);
    cargoMesh.castShadow = !isSoftwareGl;
    scene.add(cargoMesh);
    stateRef.current.cargoMesh = cargoMesh;

    // 8. Landing Beacons (Pickup Pad & Delivery Pad)
    const padGeo = new THREE.CylinderGeometry(2.5, 2.5, 0.08, 32);

    // Pickup Pad (Blue Glow)
    const pickupPadMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      roughness: 0.5,
      metalness: 0.6,
      emissive: 0x0284c7,
      emissiveIntensity: 0.4,
    });
    const pickupPad = new THREE.Mesh(padGeo, pickupPadMat);
    pickupPad.position.copy(stateRef.current.pickupPos);
    pickupPad.position.y = 0.04;
    scene.add(pickupPad);

    // Pickup Beam
    const beamGeo = new THREE.CylinderGeometry(2.0, 2.0, 10, 16, 1, true);
    const pickupBeamMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.15,
      side: THREE.DoubleSide,
    });
    const pickupBeacon = new THREE.Mesh(beamGeo, pickupBeamMat);
    pickupBeacon.position.copy(stateRef.current.pickupPos);
    pickupBeacon.position.y = 5;
    scene.add(pickupBeacon);
    stateRef.current.pickupBeacon = pickupBeacon;

    // Delivery Pad (Emerald Glow)
    const deliveryPadMat = new THREE.MeshStandardMaterial({
      color: 0x059669,
      roughness: 0.5,
      metalness: 0.6,
      emissive: 0x059669,
      emissiveIntensity: 0.5,
    });
    const deliveryPad = new THREE.Mesh(padGeo, deliveryPadMat);
    deliveryPad.position.copy(stateRef.current.deliveryPos);
    deliveryPad.position.y = 0.04;
    scene.add(deliveryPad);

    // Delivery Beam
    const deliveryBeamMat = new THREE.MeshBasicMaterial({
      color: 0x10b981,
      transparent: true,
      opacity: 0.15,
      side: THREE.DoubleSide,
    });
    const deliveryBeacon = new THREE.Mesh(beamGeo, deliveryBeamMat);
    deliveryBeacon.position.copy(stateRef.current.deliveryPos);
    deliveryBeacon.position.y = 5;
    scene.add(deliveryBeacon);
    stateRef.current.deliveryBeacon = deliveryBeacon;

    // 9. Moving AGVs / Laser Hazards
    const agvMat = new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.4, metalness: 0.6 });
    const hazardsList = [
      {
        mesh: new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.8, 1.8), agvMat),
        axis: 'z' as 'z',
        min: -15,
        max: 15,
        speed: 3.5,
        dir: 1,
      },
      {
        mesh: new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.8, 2.5), agvMat),
        axis: 'x' as 'x',
        min: -15,
        max: 15,
        speed: 4.2,
        dir: -1,
      },
    ];

    hazardsList.forEach((h, idx) => {
      h.mesh.position.set(idx === 0 ? 0 : 0, 0.4, idx === 0 ? -5 : 6);
      h.mesh.castShadow = !isSoftwareGl;
      scene.add(h.mesh);
    });
    stateRef.current.hazards = hazardsList;

    // 10. Event Listeners for Keyboard
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code in stateRef.current.keys) {
        (stateRef.current.keys as any)[e.code] = true;
      }
      if (e.code === 'KeyP' || e.code === 'Escape') {
        setGameState((prev) => (prev === 'playing' ? 'paused' : prev === 'paused' ? 'playing' : prev));
      }
      if (e.code === 'KeyE') {
        toggleCargoAction();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code in stateRef.current.keys) {
        (stateRef.current.keys as any)[e.code] = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // 11. 60FPS Game Loop with Delta Time Clamping
    let lastTime = performance.now();
    let secondAccumulator = 0;

    const animate = (time: number) => {
      gameLoopRef.current = requestAnimationFrame(animate);

      const dt = Math.min((time - lastTime) / 1000, 0.05); // clamped dt
      lastTime = time;

      // Handle pause or non-playing states
      if (stateRef.current.gameState !== 'playing') {
        renderer.render(scene, camera);
        return;
      }

      // Decrement battery and time
      secondAccumulator += dt;
      if (secondAccumulator >= 1.0) {
        secondAccumulator -= 1.0;
        stateRef.current.timeLeft = Math.max(0, stateRef.current.timeLeft - 1);
        stateRef.current.battery = Math.max(0, stateRef.current.battery - 0.25);

        setScore((prev) => ({
          ...prev,
          timeRemaining: stateRef.current.timeLeft,
          battery: Math.round(stateRef.current.battery),
        }));

        if (stateRef.current.timeLeft <= 0 || stateRef.current.battery <= 0) {
          stateRef.current.gameState = 'gameover';
          setGameState('gameover');
        }
      }

      // Physics & Flight Dynamics
      const keys = stateRef.current.keys;
      const accel = 18.0;
      const damping = 3.5;
      const rotSpeed = 2.8;

      // Altitude Control
      if (keys.Space) {
        stateRef.current.targetAltitude = Math.min(6.5, stateRef.current.targetAltitude + 3.0 * dt);
      }
      if (keys.ShiftLeft || keys.ShiftRight) {
        stateRef.current.targetAltitude = Math.max(0.6, stateRef.current.targetAltitude - 3.0 * dt);
      }

      // Yaw Rotation (A / D or Left / Right)
      if (keys.KeyA || keys.ArrowLeft) {
        stateRef.current.droneRot.y += rotSpeed * dt;
      }
      if (keys.KeyD || keys.ArrowRight) {
        stateRef.current.droneRot.y -= rotSpeed * dt;
      }

      // Forward / Backward Thrust (W / S or Up / Down)
      const forwardVec = new THREE.Vector3(0, 0, -1).applyAxisAngle(
        new THREE.Vector3(0, 1, 0),
        stateRef.current.droneRot.y
      );
      if (keys.KeyW || keys.ArrowUp) {
        stateRef.current.droneVel.addScaledVector(forwardVec, accel * dt);
      }
      if (keys.KeyS || keys.ArrowDown) {
        stateRef.current.droneVel.addScaledVector(forwardVec, -accel * 0.7 * dt);
      }

      // Apply Damping
      stateRef.current.droneVel.x -= stateRef.current.droneVel.x * damping * dt;
      stateRef.current.droneVel.z -= stateRef.current.droneVel.z * damping * dt;

      // Altitude Spring Lerp
      const dy = stateRef.current.targetAltitude - stateRef.current.dronePos.y;
      stateRef.current.droneVel.y = dy * 4.0;

      // Update Position
      stateRef.current.dronePos.x += stateRef.current.droneVel.x * dt;
      stateRef.current.dronePos.y += stateRef.current.droneVel.y * dt;
      stateRef.current.dronePos.z += stateRef.current.droneVel.z * dt;

      // Boundary Clamping (Warehouse Perimeter 50x50)
      stateRef.current.dronePos.x = THREE.MathUtils.clamp(stateRef.current.dronePos.x, -26, 26);
      stateRef.current.dronePos.z = THREE.MathUtils.clamp(stateRef.current.dronePos.z, -26, 26);

      // Drone Banking & Tilt
      const tiltX = (keys.KeyW || keys.ArrowUp ? 0.25 : keys.KeyS || keys.ArrowDown ? -0.2 : 0);
      const tiltZ = (keys.KeyA || keys.ArrowLeft ? 0.2 : keys.KeyD || keys.ArrowRight ? -0.2 : 0);
      drone.rotation.set(tiltX, stateRef.current.droneRot.y, tiltZ);
      drone.position.copy(stateRef.current.dronePos);

      // Spin Rotors
      const rotorSpeed = 30.0 + stateRef.current.droneVel.length() * 5.0;
      stateRef.current.rotors.forEach((r, idx) => {
        r.rotation.y += (idx % 2 === 0 ? 1 : -1) * rotorSpeed * dt;
      });

      // Update Audio Frequency based on velocity
      if (rotorOscRef.current && audioCtxRef.current) {
        const targetFreq = 90 + Math.min(180, stateRef.current.droneVel.length() * 18);
        rotorOscRef.current.frequency.setTargetAtTime(targetFreq, audioCtxRef.current.currentTime, 0.05);
      }

      // Move Cargo if carried
      if (stateRef.current.isCarrying && stateRef.current.cargoMesh) {
        stateRef.current.cargoMesh.position.set(
          stateRef.current.dronePos.x,
          stateRef.current.dronePos.y - 0.7,
          stateRef.current.dronePos.z
        );
        stateRef.current.cargoMesh.rotation.y = drone.rotation.y;
      }

      // Animate Moving Hazards & Check Collisions
      stateRef.current.hazards.forEach((h) => {
        if (h.axis === 'z') {
          h.mesh.position.z += h.speed * h.dir * dt;
          if (h.mesh.position.z > h.max || h.mesh.position.z < h.min) {
            h.dir *= -1;
          }
        } else {
          h.mesh.position.x += h.speed * h.dir * dt;
          if (h.mesh.position.x > h.max || h.mesh.position.x < h.min) {
            h.dir *= -1;
          }
        }

        // Collision Check with Drone
        const dist = h.mesh.position.distanceTo(stateRef.current.dronePos);
        if (dist < 2.0 && stateRef.current.dronePos.y < 1.8) {
          playHazardBuzz();
          stateRef.current.battery = Math.max(0, stateRef.current.battery - 8.0);
          stateRef.current.droneVel.multiplyScalar(-1.2);
        }
      });

      // Animate Beacons
      if (stateRef.current.pickupBeacon) {
        stateRef.current.pickupBeacon.rotation.y += 0.02;
      }
      if (stateRef.current.deliveryBeacon) {
        stateRef.current.deliveryBeacon.rotation.y -= 0.02;
      }

      // Smooth Camera Damping (Follow Camera behind and above drone)
      const camOffset = new THREE.Vector3(0, 4.5, 9.0).applyAxisAngle(
        new THREE.Vector3(0, 1, 0),
        stateRef.current.droneRot.y
      );
      const targetCamPos = stateRef.current.dronePos.clone().add(camOffset);
      camera.position.lerp(targetCamPos, 0.08);
      camera.lookAt(stateRef.current.dronePos.clone().add(new THREE.Vector3(0, 0.5, 0)));

      // Update state for HUD display
      setAltitude(parseFloat(stateRef.current.dronePos.y.toFixed(1)));
      setSpeed(parseFloat(stateRef.current.droneVel.length().toFixed(1)));

      renderer.render(scene, camera);
    };

    gameLoopRef.current = requestAnimationFrame(animate);

    // Resize Handler
    const handleResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('resize', handleResize);
      if (rotorOscRef.current) {
        try {
          rotorOscRef.current.stop();
        } catch (e) {
          // ignore
        }
      }
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  // Action: Toggle Cargo Pick/Drop ('E' or Button)
  const toggleCargoAction = () => {
    const s = stateRef.current;
    if (s.gameState !== 'playing') return;

    if (!s.isCarrying) {
      // Check distance to pickup zone
      const dist = s.dronePos.distanceTo(s.pickupPos);
      if (dist < 4.0 && s.dronePos.y <= 2.2) {
        s.isCarrying = true;
        setHasCargo(true);
        setActiveZone('delivery');
        playPickupSound();
      }
    } else {
      // Check distance to delivery zone
      const dist = s.dronePos.distanceTo(s.deliveryPos);
      if (dist < 4.5 && s.dronePos.y <= 2.2) {
        // Successful Delivery!
        s.isCarrying = false;
        setHasCargo(false);
        s.deliveries += 1;
        const pts = 500 + Math.round(s.timeLeft * 5);
        s.score += pts;
        s.timeLeft = Math.min(120, s.timeLeft + 15); // bonus time

        // Reset cargo to a new randomized pickup location
        const randX = (Math.random() - 0.5) * 36;
        const randZ = (Math.random() - 0.5) * 36;
        s.pickupPos.set(randX, 0.5, randZ);
        if (s.cargoMesh) s.cargoMesh.position.copy(s.pickupPos);
        if (s.pickupBeacon) s.pickupBeacon.position.set(randX, 5, randZ);

        setActiveZone('pickup');
        playDeliverySound();

        setScore({
          deliveries: s.deliveries,
          score: s.score,
          timeRemaining: s.timeLeft,
          battery: Math.round(s.battery),
        });

        // Update high score
        if (s.score > highScore) {
          setHighScore(s.score);
          localStorage.setItem('businessos_drone_highscore', s.score.toString());
        }

        // Victory condition: 5 deliveries
        if (s.deliveries >= 5) {
          s.gameState = 'victory';
          setGameState('victory');
        }
      } else {
        // Drop cargo in place
        s.isCarrying = false;
        setHasCargo(false);
        if (s.cargoMesh) {
          s.cargoMesh.position.set(s.dronePos.x, 0.5, s.dronePos.z);
          s.pickupPos.copy(s.cargoMesh.position);
          if (s.pickupBeacon) s.pickupBeacon.position.set(s.dronePos.x, 5, s.dronePos.z);
        }
      }
    }
  };

  // Start / Restart Flight
  const startSimulation = () => {
    initAudio();
    stateRef.current.dronePos.set(0, 2.5, 0);
    stateRef.current.droneVel.set(0, 0, 0);
    stateRef.current.targetAltitude = 2.5;
    stateRef.current.isCarrying = false;
    stateRef.current.deliveries = 0;
    stateRef.current.score = 0;
    stateRef.current.battery = 100;
    stateRef.current.timeLeft = 90;
    stateRef.current.gameState = 'playing';

    if (stateRef.current.cargoMesh) {
      stateRef.current.pickupPos.set(-14, 0.5, -12);
      stateRef.current.cargoMesh.position.copy(stateRef.current.pickupPos);
    }
    if (stateRef.current.pickupBeacon) {
      stateRef.current.pickupBeacon.position.set(-14, 5, -12);
    }

    setHasCargo(false);
    setActiveZone('pickup');
    setScore({
      deliveries: 0,
      score: 0,
      timeRemaining: 90,
      battery: 100,
    });
    setGameState('playing');
  };

  return (
    <div className="relative w-full h-[calc(100vh-4rem)] bg-slate-950 overflow-hidden select-none">
      {/* 3D WebGL Canvas Viewport */}
      <div ref={containerRef} className="absolute inset-0 w-full h-full" />

      {/* Title Screen Overlay */}
      {gameState === 'title' && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-6">
          <div className="max-w-xl w-full bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center shadow-2xl">
            <div className="w-16 h-16 bg-sky-500/10 border border-sky-500/30 rounded-2xl flex items-center justify-center mx-auto mb-5 text-sky-400">
              <Package className="w-8 h-8" />
            </div>

            <h1 className="text-2xl font-bold text-white tracking-tight mb-2">
              AERO-LOGISTICS 3D
            </h1>
            <p className="text-sm text-sky-400 font-mono mb-4">
              Autonomous Drone & Supply Chain Warehouse Simulator
            </p>
            <p className="text-xs text-slate-400 leading-relaxed mb-6">
              Navigate an industrial composite quadcopter drone through the automated fulfilment centre.
              Pick up cargo containers with magnetic clamps, avoid AGVs and shelving racks, and safely deliver to target dispatch pads before battery exhaustion.
            </p>

            {/* High Score & Controls Guide */}
            <div className="grid grid-cols-2 gap-3 bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 mb-6 text-left text-xs">
              <div>
                <span className="text-slate-500 block mb-1">Flight Controls:</span>
                <span className="text-slate-200 block font-mono">W / S · Pitch Forward / Back</span>
                <span className="text-slate-200 block font-mono">A / D · Yaw Rotate</span>
                <span className="text-slate-200 block font-mono">Space · Ascend Climb</span>
                <span className="text-slate-200 block font-mono">Shift · Descend Altitude</span>
                <span className="text-slate-200 block font-mono">E · Magnetic Cargo Clamp</span>
              </div>
              <div className="border-l border-slate-800 pl-4">
                <span className="text-slate-500 block mb-1">Career Record:</span>
                <span className="text-lg font-bold text-emerald-400 font-mono">
                  {highScore.toLocaleString()} PTS
                </span>
                <span className="text-slate-500 block mt-2">Target Quota:</span>
                <span className="text-slate-200 font-mono">5 High-Priority Shipments</span>
              </div>
            </div>

            <button
              onClick={startSimulation}
              className="w-full py-3.5 px-6 bg-sky-500 hover:bg-sky-400 text-slate-950 font-semibold rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-sky-500/20 text-sm cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current" />
              Launch Flight Simulation
            </button>
          </div>
        </div>
      )}

      {/* Game Over Screen */}
      {gameState === 'gameover' && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-6">
          <div className="max-w-md w-full bg-slate-900 border border-red-900/40 rounded-2xl p-8 text-center shadow-2xl">
            <div className="w-16 h-16 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-center justify-center mx-auto mb-4 text-red-400">
              <Zap className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-1">Mission Incomplete</h2>
            <p className="text-xs text-slate-400 mb-6">Battery depleted or shift time expired before quota completion.</p>

            <div className="bg-slate-950/60 rounded-xl p-4 mb-6 text-xs font-mono space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-400">Deliveries Logged:</span>
                <span className="text-white font-bold">{score.deliveries} / 5</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Final Score:</span>
                <span className="text-sky-400 font-bold">{score.score.toLocaleString()} PTS</span>
              </div>
            </div>

            <button
              onClick={startSimulation}
              className="w-full py-3 px-6 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-xl flex items-center justify-center gap-2 text-sm transition-all cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              Retry Mission
            </button>
          </div>
        </div>
      )}

      {/* Victory Screen */}
      {gameState === 'victory' && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-6">
          <div className="max-w-md w-full bg-slate-900 border border-emerald-500/40 rounded-2xl p-8 text-center shadow-2xl">
            <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center justify-center mx-auto mb-4 text-emerald-400">
              <Award className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-1">Shift Quota Fulfilled!</h2>
            <p className="text-xs text-emerald-400/90 font-mono mb-6">Autonomous Logistics Grade: RANK S (Enterprise Certified)</p>

            <div className="bg-slate-950/60 rounded-xl p-4 mb-6 text-xs font-mono space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-400">Deliveries Completed:</span>
                <span className="text-emerald-400 font-bold">5 Shipments</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Remaining Battery:</span>
                <span className="text-white font-bold">{score.battery}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Total Score:</span>
                <span className="text-sky-400 font-bold">{score.score.toLocaleString()} PTS</span>
              </div>
            </div>

            <button
              onClick={startSimulation}
              className="w-full py-3 px-6 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl flex items-center justify-center gap-2 text-sm transition-all cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              Start Next Logistics Shift
            </button>
          </div>
        </div>
      )}

      {/* Pause Screen */}
      {gameState === 'paused' && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-6">
          <div className="max-w-sm w-full bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center shadow-xl">
            <h3 className="text-lg font-bold text-white mb-2">Flight Paused</h3>
            <p className="text-xs text-slate-400 mb-6">Press 'P' or 'Escape' or click below to resume flight telemetry.</p>
            <div className="space-y-3">
              <button
                onClick={() => setGameState('playing')}
                className="w-full py-2.5 bg-sky-500 text-slate-950 font-medium rounded-xl text-sm"
              >
                Resume Flight
              </button>
              <button
                onClick={() => setGameState('title')}
                className="w-full py-2.5 bg-slate-800 text-slate-300 font-medium rounded-xl text-sm"
              >
                Exit to Title
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Playing HUD Overlay */}
      {gameState === 'playing' && (
        <>
          {/* Top Bar HUD */}
          <div className="absolute top-4 left-4 right-4 z-10 flex items-center justify-between pointer-events-none">
            {/* Left: Operational Metrics */}
            <div className="flex items-center gap-2 pointer-events-auto">
              <div className="bg-slate-900/90 border border-slate-800/80 rounded-xl px-3.5 py-2 backdrop-blur-md flex items-center gap-3 text-xs font-mono">
                <div className="flex items-center gap-1.5">
                  <Package className="w-4 h-4 text-sky-400" />
                  <span className="text-slate-400">Cargo:</span>
                  <span className={`font-bold ${hasCargo ? 'text-emerald-400' : 'text-slate-400'}`}>
                    {hasCargo ? 'SECURED' : 'EMPTY'}
                  </span>
                </div>
                <div className="w-px h-4 bg-slate-700" />
                <div className="flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-emerald-400" />
                  <span className="text-slate-400">Shipments:</span>
                  <span className="text-white font-bold">{score.deliveries} / 5</span>
                </div>
              </div>

              <div className="bg-slate-900/90 border border-slate-800/80 rounded-xl px-3.5 py-2 backdrop-blur-md flex items-center gap-2 text-xs font-mono">
                <span className="text-slate-400">Directive:</span>
                <span className="text-amber-400 font-bold">
                  {activeZone === 'pickup' ? 'Fly to Blue Ring & Press E to Clamp' : 'Deliver to Green Ring & Press E'}
                </span>
              </div>
            </div>

            {/* Right: Telemetry & Controls */}
            <div className="flex items-center gap-2 pointer-events-auto">
              <div className="bg-slate-900/90 border border-slate-800/80 rounded-xl px-3.5 py-2 backdrop-blur-md flex items-center gap-3 text-xs font-mono">
                <div>
                  <span className="text-slate-500 mr-1.5">BAT:</span>
                  <span className={`font-bold tabular-nums ${score.battery < 25 ? 'text-red-400' : 'text-emerald-400'}`}>
                    {score.battery}%
                  </span>
                </div>
                <div className="w-px h-4 bg-slate-700" />
                <div>
                  <span className="text-slate-500 mr-1.5">TIME:</span>
                  <span className="text-amber-400 font-bold tabular-nums">{score.timeRemaining}s</span>
                </div>
                <div className="w-px h-4 bg-slate-700" />
                <div>
                  <span className="text-slate-500 mr-1.5">PTS:</span>
                  <span className="text-sky-400 font-bold tabular-nums">{score.score.toLocaleString()}</span>
                </div>
              </div>

              <button
                onClick={() => setMuted(!muted)}
                className="bg-slate-900/90 border border-slate-800 p-2.5 rounded-xl text-slate-300 hover:text-white backdrop-blur-md cursor-pointer"
                title={muted ? 'Unmute Sound' : 'Mute Sound'}
              >
                {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>

              <button
                onClick={() => setGameState('paused')}
                className="bg-slate-900/90 border border-slate-800 p-2.5 rounded-xl text-slate-300 hover:text-white backdrop-blur-md cursor-pointer"
                title="Pause (P or Esc)"
              >
                <Pause className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Bottom Left: Flight Telemetry Dial */}
          <div className="absolute bottom-4 left-4 z-10 pointer-events-none">
            <div className="bg-slate-900/90 border border-slate-800/80 rounded-xl p-3 backdrop-blur-md text-xs font-mono space-y-1">
              <div className="text-slate-500 text-[10px] uppercase tracking-wider mb-1">Flight Telemetry</div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-slate-400">Altitude:</span>
                <span className="text-white font-bold tabular-nums">{altitude} m</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-slate-400">Velocity:</span>
                <span className="text-sky-400 font-bold tabular-nums">{speed} m/s</span>
              </div>
            </div>
          </div>

          {/* Bottom Right: Touch / Fast Action Pad */}
          <div className="absolute bottom-4 right-4 z-10 flex flex-col items-end gap-2 pointer-events-auto">
            {/* Magnetic Clamp Button */}
            <button
              onClick={toggleCargoAction}
              className={`py-3 px-5 rounded-xl font-mono text-xs font-bold flex items-center gap-2 backdrop-blur-md transition-all shadow-lg cursor-pointer ${
                hasCargo
                  ? 'bg-emerald-500/90 text-slate-950 border border-emerald-400 shadow-emerald-500/20'
                  : 'bg-sky-500/90 text-slate-950 border border-sky-400 shadow-sky-500/20'
              }`}
            >
              <Crosshair className="w-4 h-4" />
              {hasCargo ? 'DROP CARGO (E)' : 'ENGAGE CLAMP (E)'}
            </button>

            {/* Quick Virtual Touch Controls for Mobile/Tablet */}
            <div className="md:hidden bg-slate-900/90 border border-slate-800 rounded-xl p-2 grid grid-cols-3 gap-1">
              <div />
              <button
                onTouchStart={() => { stateRef.current.keys.KeyW = true; }}
                onTouchEnd={() => { stateRef.current.keys.KeyW = false; }}
                className="p-3 bg-slate-800 text-white rounded-lg active:bg-sky-600 flex items-center justify-center"
              >
                <ArrowUp className="w-4 h-4" />
              </button>
              <div />

              <button
                onTouchStart={() => { stateRef.current.keys.KeyA = true; }}
                onTouchEnd={() => { stateRef.current.keys.KeyA = false; }}
                className="p-3 bg-slate-800 text-white rounded-lg active:bg-sky-600 flex items-center justify-center"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <button
                onTouchStart={() => { stateRef.current.keys.KeyS = true; }}
                onTouchEnd={() => { stateRef.current.keys.KeyS = false; }}
                className="p-3 bg-slate-800 text-white rounded-lg active:bg-sky-600 flex items-center justify-center"
              >
                <ArrowDown className="w-4 h-4" />
              </button>
              <button
                onTouchStart={() => { stateRef.current.keys.KeyD = true; }}
                onTouchEnd={() => { stateRef.current.keys.KeyD = false; }}
                className="p-3 bg-slate-800 text-white rounded-lg active:bg-sky-600 flex items-center justify-center"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
export default SupplyChainGame3D;
