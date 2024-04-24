import { Component, createContext, createSignal, useContext } from "solid-js";
import { GameComponent, GameComponentType, GameRules, SpaceState, constructGameState, play } from "./model";
import { Board, BoardComponent } from "./board/Board";

const DEFAULT_RULES: GameRules = {
  components: [GameComponentType.BOARD, GameComponentType.BOARD, GameComponentType.SQUARE],
  lastMoveRule: false
};

const MoveHistoryContext = createContext<[() => string[], (move: string) => void]>();
const GameStateContext = createContext<[(id: string) => GameComponent | null]>();
const RulesContext = createContext<GameRules>(DEFAULT_RULES);

export const Game: Component<Partial<GameRules> & {ongameend?: (result: SpaceState, state: GameComponent) => any}> = (props) => {
  const rules: GameRules = Object.assign(DEFAULT_RULES, props);
  const originalState = constructGameState(rules);
  const [currentGameState, setGameState] = createSignal<GameComponent>(originalState)

  const [currMoveHistory, setMoveHistory] = createSignal<string[]>([]);

  const moveHistory: [() => string[], (move: string) => void] = [
    currMoveHistory,
    (move: string) => {
      const moves = [...currMoveHistory(), move];
      const newGameState = playmove(moves, currentGameState());

      if (newGameState !== currentGameState() && describeComponent(newGameState) !== describeComponent(currentGameState())) {
        setGameState(newGameState);
        setMoveHistory(moves);
        if (newGameState.state !== SpaceState.EMPTY) {
          props.ongameend?.(newGameState.state, newGameState);
        }
      } else {
        console.log("State didn't change");
      }
    }
  ];

  const describeComponent = (component: GameComponent, i: number = 0): string => {
    const depth = component.id.split('-').filter(x => !!x).length;
    return "".padStart(depth*2, " ") + `${i}: ` + component.type + ` (${component.state})` + (component.children?.length ? ` {\n${component.children.map(describeComponent).join("")}${"".padStart(depth*2, " ")}}` : '') + ',\n'
  }

  const gameStateP: [(id: string) => GameComponent | null] = [
    (id: string) => {
      let currentComponent = currentGameState();
      let ids = id.split('-').filter(x => !!x).map(x => Number(x));

      for (const currId of ids) {
        if (isNaN(currId)) {
          return null;
        }
        if (!currentComponent.children) {
          return null;
        }
        currentComponent = currentComponent.children[currId-1];
        if (!currentComponent) {
          return null;
        }
      }
      return currentComponent;
    }
  ]

  const replaymoves = (moves: string[], i: number = 0): GameComponent => {
    if (moves.length === 0) {
      return playmove([], originalState)
    }
    return playmove(moves, replaymoves(moves.slice(i + 1), i + 1)) 
  }

  const playmove = (moves: string[], previousState: GameComponent): GameComponent => {
    const move = moves[moves.length-1];
    if (!moves.length) {
      return previousState;
    }

    let ids = move.split('-').filter(x => !!x).map(x => Number(x));

    let currentComponent = currentGameState();
    let componentStack = [currentComponent];
    for (const id of ids) {
      if (isNaN(id)) {
        throw new Error("invalid move");
      }
      if (!currentComponent.children) {
        throw new Error("invalid move");
      }
      currentComponent = currentComponent.children[id-1];
      componentStack.push(currentComponent);
      if (!currentComponent) {
        throw new Error("invalid move");
      }
    }

    let newGameState = componentStack.reduceRight<GameComponent | undefined>((prev, curr) => play(rules, curr, moves, prev), undefined);
    return newGameState || previousState;
  }

  return (
    <RulesContext.Provider value={rules}>
      <GameStateContext.Provider value={gameStateP}>
        <MoveHistoryContext.Provider value={moveHistory}>
          <Board state={currentGameState() as BoardComponent}/>
        </MoveHistoryContext.Provider>
      </GameStateContext.Provider>
    </RulesContext.Provider>
  );
};

export function useMoveHistory() {
  return useContext(MoveHistoryContext) ?? [null, null];
}
export function useGameState() {
  return useContext(GameStateContext) ?? [null, null];
}

export function useRules() {
  return useContext(RulesContext);
}

