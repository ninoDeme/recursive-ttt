import { Component } from "solid-js";
import { SquareComponent, squareComponentPlay } from "./board/Square";
import { BoardComponent, boardComponentPlay } from "./board/Board";

export enum SpaceState {
  X = 'X',
  O = 'O',
  DRAW = 'DRAW',
  EMPTY = 'EMPTY'
}

export enum GameComponentType {
  SQUARE = 'CORE-SQUARE',
  BOARD = 'CORE-BOARD',
}

export function registerComponent<T extends GameComponent>(id: string, data: (rules: GameRules) => GameComponentData<T>) {
  _componentsData[id] = data;
}

const _componentsData: Record<string, (rules: GameRules) => GameComponentData<any>> = {
  [GameComponentType.SQUARE]: (_rules) => ({
    play: squareComponentPlay,
    childrenLength: 0,
  }),
  [GameComponentType.BOARD]: (rules) => ({
    play: boardComponentPlay(rules),
    childrenLength: 9,
  })
}

export interface GameComponentData<T extends GameComponent> {
    play: componentPlay<T>,
    childrenLength: number,
}

export interface GameComponent {
  readonly type: GameComponentType | string;
  readonly state: SpaceState;
  readonly children?: GameComponent[];
  readonly id: string;
}

export type GameRules = {
    components: GameComponentType[];
    lastMoveRule: boolean;
}

export type componentPlay<T extends GameComponent = GameComponent> = (component: T, moves: string[], childState?: GameComponent) => GameComponent;

export function constructGameState(rules: GameRules, components?: GameComponentType[], id?: string): GameComponent {
  components ??= rules.components;
  const length = getComponentLength(components[0], rules);
  if (components.length > 1 && length === 0) {
    throw new Error("Invalid configuration");
  }
  return {
    type: components[0],
    state: SpaceState.EMPTY,
    id: id ?? "",
    children: components.length > 1 ? new Array(length).fill(null).map((_, i) => {
      return constructGameState(rules, components.slice(1), id ? id + "-" + (i + 1) : (i + 1).toString())
    }) : undefined
  }
}

export function getComponentLength(component: GameComponentType, rules: GameRules): number {
  return _componentsData[component](rules).childrenLength;
}

export function play(rules: GameRules, component: GameComponent, moves: string[], childState?: GameComponent): GameComponent {
  return _componentsData[component.type](rules).play(component, moves, childState);
}

export type SquareLike<T extends GameComponent> = Component<{state: T}>
