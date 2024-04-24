import { For, Match, Show, Switch } from 'solid-js';
import { Square, SquareComponent } from './Square';
import { GameComponent, SpaceState, GameComponentType, SquareLike, componentPlay, GameRules, registerComponent } from '../model';
import styles from './Board.module.css';
import cross from '/src/assets/cross.svg'
import circle from '/src/assets/circle.svg'
import { useMoveHistory, useRules } from '../Game';
// import bg from '/src/assets/bg2.svg'

const SOLVED_STATES = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],

  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],

  [0, 4, 8],
  [6, 4, 2],
]

export const Board: SquareLike<BoardComponent> = (props) => {

  const [moveHistory] = useMoveHistory();
  const rules = useRules();

  const isDisabled = (index: number): boolean => {
    const moves = moveHistory?.()

    if (!moves) {
      return false;
    }

    const currentBoard = props.state.children[index]
    if (!currentBoard || currentBoard?.state !== SpaceState.EMPTY) {
      return false;
    }

    const lastMove = moves[moves.length-1];
    if (rules.lastMoveRule && lastMove && !isNaN(index)) {
      const lastMoveSplitSub = lastMove.substring(props.state.id.length).split('-').filter(x => !!x) 
      const lastComponent = Number(lastMoveSplitSub[0]) - 1
      const lastPlayIndex = Number(lastMoveSplitSub[1]) - 1;
      if (!isNaN(lastComponent) && props.state.children[lastComponent]?.state === SpaceState.EMPTY) {
        if (!isNaN(lastPlayIndex) && props.state.children[lastPlayIndex].state === SpaceState.EMPTY && index !== lastPlayIndex) {
          return true;
        }
      }
    }
    return false;
  };

  return (
    <div class="p-4 w-full h-full relative">
      <div class={`pointer-events-none absolute top-0 left-0 w-full h-full grid grid-cols-3 p-4 auto-rows-fr ${styles.background_board}`}>
        <For each={props.state.children}>{(val, i) => <div class="border w-full h-full"></div>}</For>
      </div>
      {/* <img src={bg} class={`pointer-events-none absolute top-0 left-0 w-full h-full ${styles.background_board}`}/> */}
      <div class="grid grid-cols-3 auto-rows-fr h-full w-full">
        <For each={props.state.children}>{(val, i) => 
          <div class={'w-full h-full' + (isDisabled(i()) ? ' opacity-40 pointer-events-none' : '')}>
            <Switch fallback={<p>invalid component</p>}>
              <Match when={val.type === GameComponentType.BOARD}>
                <Board state={val as BoardComponent}/>
              </Match>
              <Match when={val.type === GameComponentType.SQUARE}>
                <Square state={val as SquareComponent}/>
              </Match>
            </Switch>
          </div>
        }</For>
      </div>
      <Show when={props.state.state !== SpaceState.EMPTY}>
        <div class="absolute top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center">
          <Switch fallback={<div class="h-full w-full"></div>}>
            <Match when={props.state.state === SpaceState.X}>
              <div class="h-4/6 w-4/6">
                <img src={cross} alt="cross" class="object-contain w-full h-full"/>
              </div>
            </Match>
            <Match when={props.state.state === SpaceState.O}>
              <div class="h-4/6 w-4/6">
                <img src={circle} alt="circle" class="object-contain w-full h-full"/>
              </div>
            </Match>
          </Switch>
        </div>
      </Show>
    </div>
  );
};

export interface BoardComponent extends GameComponent {
  readonly type: GameComponentType.BOARD;
  readonly state: SpaceState;
  readonly children: GameComponent[];
  readonly id: string;
}

export const boardComponentPlay: (rules: GameRules) => componentPlay<BoardComponent> = (rules) => (component: BoardComponent, moves: string[], childState?: GameComponent): BoardComponent => {
  if (!childState) {
    throw new Error("invalid move");
  }
  if (component.state !== SpaceState.EMPTY) {
    throw new Error("Board is not empty")
  }

  const index = parseInt(moves[moves.length-1]?.substring(component.id.length).split('-').filter(x => !!x)[0]) - 1;

  const lastMove = moves[moves.length-2];
  if (lastMove && rules.lastMoveRule) {
    const lastMoveSplitSub = lastMove.substring(component.id.length).split('-').filter(x => !!x)
    const lastComponent = Number(lastMoveSplitSub[1]) - 1;
    const lastPlayIndex = Number(lastMoveSplitSub[0]) - 1;
    if (!isNaN(lastComponent) && component.children[lastComponent].state === SpaceState.EMPTY) {
      if (!isNaN(lastPlayIndex) && component.children[lastPlayIndex].state === SpaceState.EMPTY && index !== lastComponent) {
        throw new Error("must play in last place");
      }
    }
  }

  const newSpaces = [...component.children];
  newSpaces[index] = childState;

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

  let newState = component.state as SpaceState;
  if (!winner) {
    if (newSpaces.every(val => val.state !== SpaceState.EMPTY)) {
      newState = SpaceState.DRAW
    } else {
      newState = SpaceState.EMPTY
    }
  } else {
    newState = winner
  }

  return {
    type: GameComponentType.BOARD,
    id: component.id,
    children: newSpaces,
    state: newState
  };
};

registerComponent(GameComponentType.BOARD, (rules) => ({
    play: boardComponentPlay(rules),
    childrenLength: 9,
}))
