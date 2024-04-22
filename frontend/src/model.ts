import { Component } from "solid-js";

export enum SpaceState {
  X = 'X',
  O = 'O',
  DRAW = 'DRAW',
  EMPTY = 'EMPTY'
}

export enum SpaceTypes {
  SQUARE,
  BOARD,
}

export interface GameState {
  type: SpaceTypes,
  state: SpaceState,
  children: GameState[];
  id: string;
}

// export enum GameState {
//   WON,
//   DRAW,
//   IDLE
// }

export type SquareLike<T extends GameState> = Component<{onplayed: (state: GameState) => unknown, state: T}>
