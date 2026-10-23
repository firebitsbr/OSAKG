import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { UniverseNodeSpatial, UniverseEdgeSpatial, ClaimState } from '../types';
import { NodeColors, UITheme } from '../theme';

interface Universe3DProps {
  nodes: UniverseNodeSpatial[];
  edges: UniverseEdgeSpatial[];
  selectedNode: UniverseNodeSpatial | null;
  onSelectNode: (node: UniverseNodeSpatial) => void;
  filterClaim: ClaimState | 'all';
  showAttackPaths?: boolean;
  onSemanticZoomChange?: (lvl: number) => void;
  theme: UITheme;
  nodeColors: NodeColors;
}

interface HoveredNodeInfo {
  node: UniverseNodeSpatial;
  screenX: number;
  screenY: number;
}

function createTextSprite(
  text: string,
  borderColor: string,
  bgColor: string,
  textColor: string
): THREE.Sprite {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;

  // Rounded pill background
  ctx.fillStyle = bgColor;
  ctx.beginPath();
  if (ctx.roundRect) {
    ctx.roundRect(10, 16, canvas.width - 20, canvas.height - 32, 28);
  } else {
    ctx.rect(10, 16, canvas.width - 20, canvas.height - 32);
  }
  ctx.fill();
  ctx.lineWidth = 4;
  ctx.strokeStyle = borderColor;
  ctx.stroke();

  // Typography
  ctx.font = 'bold 32px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillStyle = textColor;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Truncate if too long
  const display = text.length > 28 ? text.substring(0, 26) + '...' : text;
  ctx.fillText(display, canvas.width / 2, canvas.height / 2);

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  const spriteMat = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    depthTest: false,
    opacity: 0.92,
  });

  const sprite = new THREE.Sprite(spriteMat);
  sprite.scale.set(13, 3.25, 1);
  return sprite;
}

export const Universe3D: React.FC<Universe3DProps> = ({
  nodes,
  edges,
  selectedNode,
  onSelectNode,
  filterClaim,
  showAttackPaths = false,
  onSemanticZoomChange,
  theme,
  nodeColors,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const nodeMeshesRef = useRef<Map<string, THREE.Mesh>>(new Map());
  const labelSpritesRef = useRef<Array<{ sprite: THREE.Sprite; minLOD: number; pos: THREE.Vector3 }>>([]);
  const pulseRingsRef = useRef<THREE.Mesh[]>([]);
  const targetCamPosRef = useRef<THREE.Vector3 | null>(null);
  const targetLookAtRef = useRef<THREE.Vector3>(new THREE.Vector3(0, 0, 0));
  const currentLookAtRef = useRef<THREE.Vector3>(new THREE.Vector3(0, 0, 0));
  const sphericalRef = useRef({ radius: 175, theta: 0.5, phi: Math.PI / 3 });

  const sphereMeshRef = useRef<THREE.Mesh | null>(null);
  const innerMeshRef = useRef<THREE.Mesh | null>(null);
  const starFieldRef = useRef<THREE.Points | null>(null);

  const [hoveredNode, setHoveredNode] = useState<HoveredNodeInfo | null>(null);
  const [altitudeKm, setAltitudeKm] = useState(175);
  const [currentLOD, setCurrentLOD] = useState(0);

  // Initialize Scene, Camera, Lights, Orbiting Controls
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(theme.sceneBg);
    scene.fog = new THREE.FogExp2(theme.sceneFog, 0.0018);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 2000);
    camera.position.set(0, 45, 175);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // 2. High-Performance WebGL Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    rendererRef.current = renderer;
    container.replaceChildren(renderer.domElement);

    // 3. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.95);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0x38bdf8, 1.4);
    dirLight1.position.set(120, 160, 100);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0xa855f7, 0.85);
    dirLight2.position.set(-120, -80, -100);
    scene.add(dirLight2);

    // 4. Cosmic Starfield Background (2,500 Particle Stars)
    const starGeo = new THREE.BufferGeometry();
    const starCount = 2500;
    const starPositions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i += 3) {
      starPositions[i] = (Math.random() - 0.5) * 1400;
      starPositions[i + 1] = (Math.random() - 0.5) * 1400;
      starPositions[i + 2] = (Math.random() - 0.5) * 1400;
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    const starMat = new THREE.PointsMaterial({
      color: theme.starColor,
      size: 1.5,
      transparent: true,
      opacity: theme.mode === 'dark' ? 0.75 : 0.35,
    });
    const starField = new THREE.Points(starGeo, starMat);
    starFieldRef.current = starField;
    scene.add(starField);

    // 5. Central Organization Core Globe (Google Earth Org Base)
    const sphereGeo = new THREE.SphereGeometry(45, 48, 48);
    const sphereMat = new THREE.MeshBasicMaterial({
      color: theme.globeWireframe,
      wireframe: true,
      transparent: true,
      opacity: theme.mode === 'dark' ? 0.22 : 0.45,
    });
    const sphereMesh = new THREE.Mesh(sphereGeo, sphereMat);
    sphereMeshRef.current = sphereMesh;
    scene.add(sphereMesh);

    // Atmospheric Inner Globe
    const innerGeo = new THREE.SphereGeometry(43.8, 36, 36);
    const innerMat = new THREE.MeshBasicMaterial({
      color: theme.globeSolid,
      transparent: true,
      opacity: theme.mode === 'dark' ? 0.82 : 0.65,
    });
    const innerMesh = new THREE.Mesh(innerGeo, innerMat);
    innerMeshRef.current = innerMesh;
    scene.add(innerMesh);

    // Planetary Orbital Guide Rings
    [68, 92, 125].forEach((radius) => {
      const ringGeo = new THREE.RingGeometry(radius - 0.25, radius + 0.25, 64);
      const ringMat = new THREE.MeshBasicMaterial({
        color: theme.mode === 'dark' ? 0x334155 : 0xcbd5e1,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: theme.mode === 'dark' ? 0.25 : 0.4,
      });
      const orbitGuide = new THREE.Mesh(ringGeo, ringMat);
      orbitGuide.rotation.x = Math.PI / 2;
      scene.add(orbitGuide);
    });

    // 6. Camera Orbiting and Flight Controller
    const spherical = sphericalRef.current;
    let isDragging = false;
    let isPanning = false;
    let prevMouseX = 0;
    let prevMouseY = 0;

    const updateCameraFromSpherical = () => {
      const lookAt = currentLookAtRef.current;
      camera.position.x = lookAt.x + spherical.radius * Math.sin(spherical.phi) * Math.sin(spherical.theta);
      camera.position.y = lookAt.y + spherical.radius * Math.cos(spherical.phi);
      camera.position.z = lookAt.z + spherical.radius * Math.sin(spherical.phi) * Math.cos(spherical.theta);
      camera.lookAt(lookAt);

      const alt = Math.round(spherical.radius);
      setAltitudeKm(alt);

      let lod = 0;
      if (alt >= 170) lod = 0;
      else if (alt >= 115) lod = 1;
      else if (alt >= 62) lod = 2;
      else lod = 3;

      setCurrentLOD(lod);
      onSemanticZoomChange?.(lod);
    };
    updateCameraFromSpherical();

    const onMouseDown = (e: MouseEvent) => {
      if (e.button === 0) isDragging = true;
      if (e.button === 2) isPanning = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - prevMouseX;
      const deltaY = e.clientY - prevMouseY;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;

      if (isDragging) {
        spherical.theta -= deltaX * 0.005;
        spherical.phi = Math.max(0.08, Math.min(Math.PI - 0.08, spherical.phi - deltaY * 0.005));
        targetCamPosRef.current = null;
        updateCameraFromSpherical();
      } else if (isPanning) {
        const panSpeed = spherical.radius * 0.001;
        currentLookAtRef.current.x -= deltaX * panSpeed;
        currentLookAtRef.current.y += deltaY * panSpeed;
        updateCameraFromSpherical();
      } else {
        const rect = renderer.domElement.getBoundingClientRect();
        mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);
        const meshes = Array.from(nodeMeshesRef.current.values());
        const intersects = raycaster.intersectObjects(meshes, false);

        if (intersects.length > 0) {
          const hit = intersects[0].object;
          const nodeId = hit.userData.nodeId;
          const foundNode = nodes.find((n) => n.id === nodeId);
          if (foundNode) {
            setHoveredNode({
              node: foundNode,
              screenX: e.clientX,
              screenY: e.clientY,
            });
            return;
          }
        }
        setHoveredNode(null);
      }
    };

    const onMouseUp = () => {
      isDragging = false;
      isPanning = false;
    };

    const onContextMenu = (e: MouseEvent) => e.preventDefault();

    // Continuous Google-Earth Style Wheel Zoom
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      spherical.radius = Math.max(16, Math.min(480, spherical.radius + e.deltaY * 0.15));
      targetCamPosRef.current = null;
      updateCameraFromSpherical();
    };

    const onClick = (e: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const meshes = Array.from(nodeMeshesRef.current.values());
      const intersects = raycaster.intersectObjects(meshes, false);

      if (intersects.length > 0) {
        const hit = intersects[0].object;
        const nodeId = hit.userData.nodeId;
        const targetNode = nodes.find((n) => n.id === nodeId);
        if (targetNode) {
          onSelectNode(targetNode);

          const targetVec = new THREE.Vector3(targetNode.x, targetNode.y, targetNode.z);
          targetLookAtRef.current.copy(targetVec);

          const normal = targetVec.clone().normalize();
          const targetDist = Math.max(16, targetNode.radius * 5.0);
          targetCamPosRef.current = targetVec.clone().add(normal.multiplyScalar(targetDist));
        }
      }
    };

    const dom = renderer.domElement;
    dom.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    dom.addEventListener('contextmenu', onContextMenu);
    dom.addEventListener('wheel', onWheel, { passive: false });
    dom.addEventListener('click', onClick);

    const onResize = () => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', onResize);

    // Continuous Animation Loop
    let animId: number;
    let pulseTime = 0;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      pulseTime += 0.04;

      if (!isDragging && !isPanning && !targetCamPosRef.current) {
        spherical.theta += 0.0005;
        updateCameraFromSpherical();
      }

      if (targetCamPosRef.current) {
        camera.position.lerp(targetCamPosRef.current, 0.08);
        currentLookAtRef.current.lerp(targetLookAtRef.current, 0.08);
        camera.lookAt(currentLookAtRef.current);

        if (camera.position.distanceTo(targetCamPosRef.current) < 0.4) {
          targetCamPosRef.current = null;
        }
      }

      pulseRingsRef.current.forEach((ring, idx) => {
        const scale = 1.0 + Math.sin(pulseTime * 2.5 + idx) * 0.22;
        ring.scale.set(scale, scale, 1);
      });

      labelSpritesRef.current.forEach(({ sprite, minLOD, pos }) => {
        const dist = camera.position.distanceTo(pos);

        if (minLOD > 0 && dist > 180) {
          sprite.visible = false;
        } else if (minLOD > 1 && dist > 110) {
          sprite.visible = false;
        } else if (minLOD > 2 && dist > 60) {
          sprite.visible = false;
        } else {
          sprite.visible = true;
          if (dist > 160) {
            sprite.material.opacity = 0.4;
          } else if (dist > 90) {
            sprite.material.opacity = 0.75;
          } else {
            sprite.material.opacity = 0.95;
          }
        }
      });

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animId);
      dom.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      dom.removeEventListener('contextmenu', onContextMenu);
      dom.removeEventListener('wheel', onWheel);
      dom.removeEventListener('click', onClick);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
    };
  }, []);

  // Sync scene colors with theme changes
  useEffect(() => {
    if (!sceneRef.current) return;
    sceneRef.current.background = new THREE.Color(theme.sceneBg);
    sceneRef.current.fog = new THREE.FogExp2(theme.sceneFog, 0.0018);

    if (sphereMeshRef.current) {
      (sphereMeshRef.current.material as THREE.MeshBasicMaterial).color.setHex(theme.globeWireframe);
      (sphereMeshRef.current.material as THREE.MeshBasicMaterial).opacity = theme.mode === 'dark' ? 0.22 : 0.45;
    }
    if (innerMeshRef.current) {
      (innerMeshRef.current.material as THREE.MeshBasicMaterial).color.setHex(theme.globeSolid);
      (innerMeshRef.current.material as THREE.MeshBasicMaterial).opacity = theme.mode === 'dark' ? 0.82 : 0.65;
    }
    if (starFieldRef.current) {
      (starFieldRef.current.material as THREE.PointsMaterial).color.setHex(theme.starColor);
      (starFieldRef.current.material as THREE.PointsMaterial).opacity = theme.mode === 'dark' ? 0.75 : 0.35;
    }
  }, [theme]);

  // Update nodes, 3D Geometries, Curved Arcs, Sprite Labels, and Attack Overlays
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    // Clean up previous meshes
    nodeMeshesRef.current.forEach((mesh) => scene.remove(mesh));
    nodeMeshesRef.current.clear();

    labelSpritesRef.current.forEach(({ sprite }) => scene.remove(sprite));
    labelSpritesRef.current = [];

    pulseRingsRef.current.forEach((ring) => scene.remove(ring));
    pulseRingsRef.current = [];

    const dynamicObjects: THREE.Object3D[] = [];
    scene.children.forEach((c) => {
      if (c.userData && (c.userData.isEdge || c.userData.isNode || c.userData.isHalo || c.userData.isLabel || c.userData.isPulse)) {
        dynamicObjects.push(c);
      }
    });
    dynamicObjects.forEach((c) => scene.remove(c));

    const visibleNodes = nodes.filter(
      (n) => filterClaim === 'all' || n.claim_state === filterClaim
    );
    const nodePositionMap = new Map<string, THREE.Vector3>();

    // Identify attack path node IDs
    const attackEdgeNodeIds = new Set<string>();
    edges.forEach((e) => {
      if ((e as any).is_attack_path) {
        attackEdgeNodeIds.add(e.source);
        attackEdgeNodeIds.add(e.target);
      }
    });

    // Add Nodes
    visibleNodes.forEach((node) => {
      const pos = new THREE.Vector3(node.x, node.y, node.z);
      nodePositionMap.set(node.id, pos);

      const isSelected = selectedNode?.id === node.id;
      const isAttackNode = attackEdgeNodeIds.has(node.id) || node.kind === 'ThreatActor' || node.kind === 'Finding';
      const radius = isSelected ? node.radius * 1.4 : node.radius;

      // Geometries per kind
      let geometry: THREE.BufferGeometry;
      if (node.kind === 'DataStore' || node.kind === 'DataAsset') {
        geometry = new THREE.BoxGeometry(radius * 1.5, radius * 1.5, radius * 1.5);
      } else if (node.kind === 'Endpoint') {
        geometry = new THREE.OctahedronGeometry(radius * 1.3);
      } else if (node.kind === 'Control') {
        geometry = new THREE.IcosahedronGeometry(radius * 1.2);
      } else if (node.kind === 'TrustBoundary') {
        geometry = new THREE.TorusGeometry(radius * 1.4, radius * 0.35, 12, 24);
      } else if (node.kind === 'Directory') {
        geometry = new THREE.CylinderGeometry(radius * 1.1, radius * 1.1, radius * 0.8, 16);
      } else {
        geometry = new THREE.SphereGeometry(radius, 24, 24);
      }

      // Live customizable node color
      const colorHex = nodeColors[node.kind] || node.color_hint;
      const isDimmed = showAttackPaths && !isAttackNode;
      const nodeColor = isAttackNode ? (node.kind === 'ThreatActor' ? 0xdc2626 : 0xef4444) : new THREE.Color(colorHex);

      const material = new THREE.MeshStandardMaterial({
        color: nodeColor,
        emissive: nodeColor,
        emissiveIntensity: isSelected ? 0.95 : isAttackNode ? 0.8 : (isDimmed ? 0.08 : 0.35),
        transparent: isDimmed,
        opacity: isDimmed ? 0.15 : 1.0,
        roughness: 0.25,
        metalness: 0.3,
      });

      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.copy(pos);
      mesh.userData = { isNode: true, nodeId: node.id };
      scene.add(mesh);
      nodeMeshesRef.current.set(node.id, mesh);

      // Selected Halo or Critical Alert / Attack Ring
      if (isSelected || isAttackNode || node.risk_level === 'critical') {
        const ringGeo = new THREE.RingGeometry(radius + 1.2, radius + 2.2, 32);
        const ringMat = new THREE.MeshBasicMaterial({
          color: isAttackNode ? 0xef4444 : node.risk_level === 'critical' ? 0xf97316 : 0x38bdf8,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.85,
        });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.position.copy(pos);
        ring.lookAt(0, 0, 0);
        ring.userData = { isPulse: true };
        scene.add(ring);
        pulseRingsRef.current.push(ring);
      }

      // 3D Billboard Text Label with LOD tag
      const minLOD = (node.metrics?.min_level as number) ?? 0;
      const shouldShowLabel =
        node.kind === 'Repository' ||
        node.kind === 'AIModel' ||
        node.kind === 'TrustBoundary' ||
        node.kind === 'Finding' ||
        node.kind === 'ThreatActor' ||
        node.kind === 'Endpoint' ||
        isSelected ||
        (showAttackPaths && isAttackNode);

      if (shouldShowLabel && (!showAttackPaths || isAttackNode || isSelected)) {
        const labelText =
          node.kind === 'Repository' && node.metrics?.stars
            ? `${node.name} ★${node.metrics.stars}`
            : node.name;

        const sprite = createTextSprite(
          labelText,
          isAttackNode ? '#ef4444' : colorHex,
          isAttackNode
            ? (theme.mode === 'dark' ? 'rgba(127, 29, 29, 0.92)' : 'rgba(254, 226, 226, 0.95)')
            : isSelected
            ? (theme.mode === 'dark' ? 'rgba(2, 132, 199, 0.88)' : 'rgba(224, 242, 254, 0.95)')
            : theme.labelBg,
          isAttackNode ? (theme.mode === 'dark' ? '#fca5a5' : '#991b1b') : theme.labelText
        );
        sprite.position.set(pos.x, pos.y + radius + 3.2, pos.z);
        sprite.userData = { isLabel: true };
        scene.add(sprite);
        labelSpritesRef.current.push({ sprite, minLOD, pos });
      }
    });

    // Add Curved 3D Arcs for Edges with High-Contrast Attack Path Highlights
    edges.forEach((edge) => {
      const p1 = nodePositionMap.get(edge.source);
      const p2 = nodePositionMap.get(edge.target);
      if (!p1 || !p2) return;

      if (filterClaim !== 'all' && edge.claim_state !== filterClaim) return;

      const isAttackPath = (edge as any).is_attack_path;
      if (showAttackPaths && !isAttackPath) {
        return;
      }

      const mid = p1.clone().add(p2).multiplyScalar(0.5);
      const dist = p1.distanceTo(p2);
      const elevatedMid = mid.clone().normalize().multiplyScalar(mid.length() + dist * (isAttackPath ? 0.32 : 0.18));

      const curve = new THREE.QuadraticBezierCurve3(p1, elevatedMid, p2);
      const points = curve.getPoints(isAttackPath ? 40 : 20);
      const lineGeo = new THREE.BufferGeometry().setFromPoints(points);

      const edgeColor = isAttackPath
        ? theme.edgeAttack
        : edge.claim_state === 'observed'
        ? theme.edgeDefault
        : edge.claim_state === 'validated'
        ? 0x22c55e
        : 0xf59e0b;

      const lineMat = new THREE.LineBasicMaterial({
        color: edgeColor,
        transparent: true,
        opacity: isAttackPath ? 0.95 : (theme.mode === 'dark' ? 0.3 : 0.45),
        linewidth: isAttackPath ? 3 : 1,
      });

      const line = new THREE.Line(lineGeo, lineMat);
      line.userData = { isEdge: true, edgeId: edge.id };
      scene.add(line);
    });
  }, [nodes, edges, selectedNode, filterClaim, showAttackPaths, theme, nodeColors]);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <div ref={mountRef} style={{ width: '100%', height: '100%' }} />

      {/* Google-Earth Style Altitude HUD & Telemetry in Bottom-Right */}
      <div
        style={{
          position: 'absolute',
          bottom: '24px',
          right: '24px',
          backgroundColor: theme.bgPanel,
          backdropFilter: 'blur(10px)',
          border: `1px solid ${theme.border}`,
          borderRadius: '8px',
          padding: '10px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          color: theme.textSecondary,
          fontSize: '11px',
          fontFamily: 'monospace',
          pointerEvents: 'none',
          zIndex: 30,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ color: '#38bdf8', fontWeight: 700 }}>ALTITUDE:</span>
          <span style={{ color: theme.textPrimary }}>{altitudeKm} km</span>
        </div>
        <div style={{ width: '1px', height: '14px', backgroundColor: theme.border }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ color: '#a855f7', fontWeight: 700 }}>LOD:</span>
          <span style={{ color: theme.textPrimary }}>
            {currentLOD === 0 ? 'L0 Órbita (Org & Repos)' : currentLOD === 1 ? 'L1 Continente (Módulos & APIs)' : currentLOD === 2 ? 'L2 Cidade (Arquivos & Classes)' : 'L3 Rua (AST & Funções)'}
          </span>
        </div>
        <div style={{ width: '1px', height: '14px', backgroundColor: theme.border }} />
        <div>
          <span>NÓS: </span>
          <span style={{ color: theme.textPrimary, fontWeight: 600 }}>{nodes.length}</span>
        </div>
      </div>

      {/* Floating Hover Tooltip */}
      {hoveredNode && (
        <div
          style={{
            position: 'fixed',
            left: `${hoveredNode.screenX + 16}px`,
            top: `${hoveredNode.screenY + 16}px`,
            backgroundColor: theme.bgPanel,
            backdropFilter: 'blur(12px)',
            border: `1px solid ${nodeColors[hoveredNode.node.kind] || '#38bdf8'}`,
            borderRadius: '8px',
            padding: '10px 14px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.4)',
            pointerEvents: 'none',
            zIndex: 100,
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
            maxWidth: '320px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
            <span style={{ fontSize: '10px', textTransform: 'uppercase', color: nodeColors[hoveredNode.node.kind] || '#38bdf8', fontWeight: 700, letterSpacing: '0.05em' }}>
              {hoveredNode.node.kind}
            </span>
            <span
              style={{
                fontSize: '10px',
                fontWeight: 700,
                padding: '1px 6px',
                borderRadius: '4px',
                backgroundColor:
                  hoveredNode.node.risk_level === 'critical' ? '#ef4444' : hoveredNode.node.risk_level === 'high' ? '#f97316' : '#22c55e',
                color: '#fff',
              }}
            >
              {hoveredNode.node.risk_level.toUpperCase()}
            </span>
          </div>
          <div style={{ color: theme.textPrimary, fontWeight: 600, fontSize: '13px' }}>
            {hoveredNode.node.name}
          </div>
          <div style={{ color: theme.textSecondary, fontSize: '11px' }}>
            Cluster: {hoveredNode.node.cluster_group}
          </div>
          {Boolean(hoveredNode.node.metrics?.description) && (
            <div style={{ color: theme.textSecondary, fontSize: '11px', marginTop: '2px', lineHeight: 1.3 }}>
              {String(hoveredNode.node.metrics.description).substring(0, 90)}...
            </div>
          )}
          <div style={{ fontSize: '10px', color: theme.textMuted, marginTop: '4px' }}>
            Clique para inspecionar em detalhes
          </div>
        </div>
      )}
    </div>
  );
};
