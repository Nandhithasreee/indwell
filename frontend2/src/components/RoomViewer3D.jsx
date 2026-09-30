import "aframe";

import {
  faCamera,
  faCompress,
  faExpand,
  faMoon,
  faRotateLeft,
  faSun,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useEffect, useRef, useState } from "react";

/**
 * Renders a Gemini-generated room schema (see backend/ai_engine/schema.py)
 * as a live, walkable A-Frame scene. When an AI-generated interior image
 * URL is provided, it is displayed as the room preview; otherwise the room
 * geometry is rendered as before.
 */
export default function RoomViewer3D({ scene, roomLabel, imageUrl }) {
  const containerRef = useRef(null);
  const sceneElRef = useRef(null);
  const cameraRigRef = useRef(null);
  const [dayMode, setDayMode] = useState(true);
  const [fullscreen, setFullscreen] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    setImageFailed(false);
  }, [imageUrl]);

  useEffect(() => {
    const handler = () => setFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  if (!scene) {
    return (
      <div className="flex h-full min-h-[420px] items-center justify-center rounded-2xl border border-white/10 bg-surface-2/40 text-sm text-muted">
        No 3D scene data yet.
      </div>
    );
  }

  const { room, walls, floor, ceiling, furniture = [], lighting = [], decorations = [], doors = [], windows = [] } = scene;
  const halfW = room.width / 2;
  const halfL = room.length / 2;

  const resetCamera = () => {
    const rig = cameraRigRef.current;
    if (rig) {
      rig.setAttribute("position", `0 1.6 ${halfL - 0.5}`);
      rig.setAttribute("rotation", "0 180 0");
    }
  };

  const toggleFullscreen = () => {
    const el = containerRef.current;
    if (!document.fullscreenElement) {
      el?.requestFullscreen?.();
      setFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setFullscreen(false);
    }
  };

  const takeScreenshot = () => {
    const sceneEl = sceneElRef.current;
    if (!sceneEl || !sceneEl.components?.screenshot) return;
    sceneEl.components.screenshot.capture("perspective");
  };

  if (imageUrl && !imageFailed) {
    return (
      <div ref={containerRef} className="relative h-full min-h-[420px] overflow-hidden rounded-2xl bg-black">
        <a-scene
          ref={sceneElRef}
          embedded
          vr-mode-ui="enabled: false"
          screenshot="width: 1600; height: 1000"
          renderer="colorManagement: true; antialias: true"
          style={{ width: "100%", height: "100%", minHeight: "420px" }}
        >
          <a-assets>
            <img id="generated-room-image" src={imageUrl} alt="" onError={() => setImageFailed(true)} />
          </a-assets>
          <a-sky src="#generated-room-image" rotation="0 -90 0" />
          <a-entity ref={cameraRigRef} position="0 1.6 0">
            <a-camera look-controls="enabled: true; reverseMouseDrag: true" wasd-controls="enabled: true" />
          </a-entity>
        </a-scene>

        <div className="pointer-events-none absolute inset-0 flex flex-col justify-between p-4">
          <div className="pointer-events-auto flex items-center justify-between">
            <span className="rounded-full bg-black/50 px-3 py-1.5 font-mono text-[11px] uppercase tracking-wide text-brass backdrop-blur">
              {roomLabel || room.type} · Drag to explore
            </span>
          </div>
          <div className="pointer-events-auto flex items-center justify-center gap-2">
            <ViewerButton
              icon={faRotateLeft}
              label="Reset view"
              onClick={() => {
                cameraRigRef.current?.setAttribute("position", "0 1.6 0");
                cameraRigRef.current?.setAttribute("rotation", "0 0 0");
              }}
            />
            <ViewerButton icon={faCamera} label="Screenshot" onClick={takeScreenshot} />
            <ViewerButton icon={fullscreen ? faCompress : faExpand} label="Fullscreen" onClick={toggleFullscreen} />
          </div>
        </div>
      </div>
    );
  }

  // Wall segments as four thin boxes around the room perimeter
  const wallThickness = 0.1;
  const wallHeight = room.height;
  const wallSegments = [
    { key: "north", pos: `0 ${wallHeight / 2} ${-halfL}`, dims: `${room.width} ${wallHeight} ${wallThickness}` },
    { key: "south", pos: `0 ${wallHeight / 2} ${halfL}`, dims: `${room.width} ${wallHeight} ${wallThickness}` },
    { key: "east", pos: `${halfW} ${wallHeight / 2} 0`, dims: `${wallThickness} ${wallHeight} ${room.length}`, rot: "0 90 0" },
    { key: "west", pos: `${-halfW} ${wallHeight / 2} 0`, dims: `${wallThickness} ${wallHeight} ${room.length}`, rot: "0 90 0" },
  ];

  return (
    <div ref={containerRef} className="relative h-full min-h-[420px] overflow-hidden rounded-2xl bg-black">
      <a-scene
        ref={sceneElRef}
        embedded
        vr-mode-ui="enabled: false"
        screenshot="width: 1600; height: 1000"
        renderer="colorManagement: true; antialias: true"
        style={{ width: "100%", height: "100%", minHeight: "420px" }}
      >
        <a-assets />

        {/* Sky / ambient environment */}
        <a-sky color={dayMode ? "#cfe4f2" : "#0a0a14"} />
        <a-entity light={`type: ambient; color: ${dayMode ? "#ffffff" : "#22243a"}; intensity: ${dayMode ? 0.55 : 0.18}`} />
        {dayMode && (
          <a-entity light="type: directional; color: #fff7e6; intensity: 0.5" position="3 6 2" />
        )}

        {/* Floor */}
        <a-plane
          position="0 0 0"
          rotation="-90 0 0"
          width={room.width}
          height={room.length}
          color={floor.color || "#b08b5a"}
          material={`roughness: 0.8; metalness: 0.05`}
          shadow="receive: true"
        />

        {/* Ceiling */}
        <a-plane
          position={`0 ${wallHeight} 0`}
          rotation="90 0 0"
          width={room.width}
          height={room.length}
          color={ceiling.color || "#f5f5f0"}
        />

        {/* Walls */}
        {wallSegments.map((w) => (
          <a-box
            key={w.key}
            position={w.pos}
            rotation={w.rot || "0 0 0"}
            width={w.dims.split(" ")[0]}
            height={w.dims.split(" ")[1]}
            depth={w.dims.split(" ")[2]}
            color={
              walls.accent_wall && walls.accent_wall.side === w.key
                ? walls.accent_wall.color
                : walls.color || "#ede6da"
            }
            shadow="cast: true; receive: true"
          />
        ))}

        {/* Windows -- rendered as pale cyan cutout markers on the wall plane */}
        {windows.map((win, i) => (
          <a-plane
            key={`win-${i}`}
            position={`${win.position.x} ${win.position.y} ${win.position.z}`}
            width={win.width}
            height={win.height}
            color="#bfe3f0"
            opacity="0.55"
            rotation={win.wall === "east" || win.wall === "west" ? "0 90 0" : "0 0 0"}
          />
        ))}

        {/* Doors -- dark inset markers */}
        {doors.map((door, i) => (
          <a-plane
            key={`door-${i}`}
            position={`${door.position.x} ${door.height / 2} ${door.position.z}`}
            width={door.width}
            height={door.height}
            color="#5a4632"
            rotation={door.wall === "east" || door.wall === "west" ? "0 90 0" : "0 0 0"}
          />
        ))}

        {/* Furniture */}
        {furniture.map((item) => (
          <FurniturePrimitive key={item.id} item={item} />
        ))}

        {/* Decorations (plants, art, rugs...) */}
        {decorations.map((item, i) => (
          <FurniturePrimitive key={`deco-${i}`} item={{ ...item, id: `deco-${i}` }} isDecor />
        ))}

        {/* Room lights from Gemini */}
        {lighting.map((light, i) => {
          if (light.type === "ambient") return null;
          return (
            <a-entity
              key={`light-${i}`}
              light={`type: ${light.type}; color: ${light.color}; intensity: ${light.intensity}`}
              position={`${light.position.x} ${light.position.y} ${light.position.z}`}
            />
          );
        })}

        {/* Camera rig -- WASD + mouse look via A-Frame's built-in controls */}
        <a-entity ref={cameraRigRef} id="camera-rig" position={`0 1.6 ${halfL - 0.5}`} rotation="0 180 0">
          <a-camera look-controls wasd-controls="acceleration: 40" />
        </a-entity>
      </a-scene>

      {/* Overlay controls */}
      <div className="pointer-events-none absolute inset-0 flex flex-col justify-between p-4">
        <div className="pointer-events-auto flex items-center justify-between">
          <span className="rounded-full bg-black/50 px-3 py-1.5 font-mono text-[11px] uppercase tracking-wide text-brass backdrop-blur">
            {roomLabel || room.type} · {room.width}m × {room.length}m
          </span>
        </div>

        <div className="pointer-events-auto flex items-center justify-center gap-2">
          <ViewerButton icon={faRotateLeft} label="Reset view" onClick={resetCamera} />
          <ViewerButton icon={dayMode ? faMoon : faSun} label={dayMode ? "Night mode" : "Day mode"} onClick={() => setDayMode((v) => !v)} />
          <ViewerButton icon={faCamera} label="Screenshot" onClick={takeScreenshot} />
          <ViewerButton icon={fullscreen ? faCompress : faExpand} label="Fullscreen" onClick={toggleFullscreen} />
        </div>
      </div>
    </div>
  );
}

function ViewerButton({ icon, label, onClick }) {
  return (
    <button
      onClick={onClick}
      title={label}
      className="flex h-11 w-11 items-center justify-center rounded-full bg-black/50 text-linen backdrop-blur transition-colors hover:bg-brass hover:text-deep"
    >
      <FontAwesomeIcon icon={icon} />
    </button>
  );
}

function FurniturePrimitive({ item, isDecor }) {
  const { position, rotation = { x: 0, y: 0, z: 0 }, dimensions = { x: 0.5, y: 0.5, z: 0.5 }, color, shape } = item;
  const pos = `${position.x} ${position.y + dimensions.y / 2} ${position.z}`;
  const rot = `${rotation.x} ${rotation.y} ${rotation.z}`;

  const commonProps = {
    position: pos,
    rotation: rot,
    color: color || "#8a7355",
    shadow: "cast: true; receive: true",
    class: isDecor ? "decoration" : "furniture-item",
  };

  switch (shape) {
    case "cylinder":
      return <a-cylinder {...commonProps} radius={dimensions.x / 2} height={dimensions.y} />;
    case "sphere":
      return <a-sphere {...commonProps} radius={dimensions.x / 2} />;
    case "cone":
      return <a-cone {...commonProps} radius-bottom={dimensions.x / 2} radius-top="0" height={dimensions.y} />;
    case "box":
    default:
      return <a-box {...commonProps} width={dimensions.x} height={dimensions.y} depth={dimensions.z} />;
  }
}
