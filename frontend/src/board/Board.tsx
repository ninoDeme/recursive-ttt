import { For, Match, Show, Switch, createSignal, type Component } from 'solid-js';
import { Square, SquareState } from './Square';
import { GameState, SpaceState, SpaceTypes, SquareLike } from '../model';
import { usePlayer } from '../Game';

const SOLVED_STATES = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],

  [0, 3, 6],
  [1, 4, 7],
  [2, 6, 8],

  [0, 4, 8],
  [6, 4, 2],
]

export const Board: SquareLike<BoardState> = (props) => {

  const [currentPlayer] = usePlayer();

  if (currentPlayer == null) {
    throw new Error('Not in player context');
  }

  const play = function(played: GameState, index: number) {
    const state = props.state.state;
    const children = props.state.children;
    if (state !== SpaceState.EMPTY) {
      return;
    }

    const currentSpace = props.state.children[index];

    if (currentSpace.state !== SpaceState.EMPTY) {
      return;
      // TODO: Error Message
    }

    const newSpaces = [...children];
    newSpaces[index] = {
      ...played,
      state: played.state
    };

    // setSpaces(newSpaces);
    let winner: SpaceState | null = null;
    for (const solution of SOLVED_STATES) {
      const firstSpaceState = newSpaces[solution[0]].state;
      if (firstSpaceState === SpaceState.EMPTY || firstSpaceState === SpaceState.DRAW) {
        continue;
      }
      if (firstSpaceState === newSpaces[solution[1]].state && firstSpaceState === newSpaces[solution[2]].state) {
        winner = newSpaces[solution[0]].state;
        break;
      }
    }

    let newState = {...props.state, children: newSpaces};
    if (!winner) {
      if (newSpaces.every(val => val.state !== SpaceState.EMPTY)) {
        newState.state = SpaceState.DRAW
      } else {
        newState.state = SpaceState.EMPTY
      }
    } else {
      newState.state = winner
    }

    props.onplayed(newState);
  };

  return (
    <div class="grid grid-cols-3 auto-rows-fr h-full w-full p-4 relative">
      <For each={props.state.children}>{(val, i) => 
        <Switch fallback={<Square state={val as SquareState} onplayed={(state) => play(state, i())}/>}>
          <Match when={val.type === SpaceTypes.BOARD}>
              <Board state={val as BoardState} onplayed={(state) => play(state, i())}/>
          </Match>
        </Switch>
      }</For>
      <Show when={props.state.state !== SpaceState.EMPTY}>
        <div class="absolute top-0 left-0 w-full h-full bg-black bg-opacity-35 flex items-center justify-center">
          <Switch>
            <Match when={props.state.state === SpaceState.X}>
              <div class="h-5/6 w-5/6 rotate-45 grid grid-cols-[1fr_1fr] auto-rows-fr">
                <div class="border-r border-b"></div>
                <div class="border-l border-b"></div>
                <div class="border-r border-t"></div>
                <div class="border-l border-t"></div>
              </div>
            </Match>
            <Match when={props.state.state === SpaceState.O}>
              <div class="h-5/6 w-5/6 border-2 rounded-full"></div>
            </Match>
          </Switch>
        </div>
      </Show>
    </div>
  );
};

export interface BoardState extends GameState {
  type: SpaceTypes.BOARD,
  state: SpaceState,
  children: GameState[];
  id: string;
}
