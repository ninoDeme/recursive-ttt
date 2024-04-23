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
  readonly type: SpaceTypes,
  readonly state: SpaceState,
  readonly children?: GameState[];
  readonly id: string;

  play(move: string, player: SpaceState, childState?: GameState): GameState;
}

// export enum GameState {
//   WON,
//   DRAW,
//   IDLE
// }

export type SquareLike<T extends GameState> = Component<{onplayed: (state: GameState, move: string) => unknown, state: T}>
