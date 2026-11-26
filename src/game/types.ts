import * as THREE from 'three';

export enum BlockType {
  EMPTY = 0,
  BRICK = 1,
  STEEL = 2,
  WATER = 3,
  TREE = 4,
  BASE = 5,
}

export interface Block {
  type: BlockType;
  health: number;
}

export enum Direction {
  UP = 0,
  RIGHT = 1,
  DOWN = 2,
  LEFT = 3,
}

export interface TankState {
  position: THREE.Vector3;
  direction: Direction;
  speed: number;
  alive: boolean;
}

export interface BulletState {
  position: THREE.Vector3;
  direction: Direction;
  speed: number;
  alive: boolean;
  owner: 'player' | 'enemy';
}

export interface Particle {
  mesh: THREE.Mesh;
  velocity: THREE.Vector3;
  life: number;
  maxLife: number;
}

export const GRID_SIZE = 26;
export const CELL_SIZE = 1;
export const VOXEL_SIZE = 0.9;
