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

export const Game: Component<Partial<GameRules>> = (props) => {
  const rules: GameRules = Object.assign(DEFAULT_RULES, props);
  const [currentGameState, setGameState] = createSignal<GameComponent>(constructGameState(rules))

  const [currMoveHistory, setMoveHistory] = createSignal<string[]>([]);

  const moveHistory: [() => string[], (move: string) => void] = [
    currMoveHistory,
    (move: string) => {
      playmove(move);
    }
  ];

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

  const [winner, setWinner] = createSignal<SpaceState>(SpaceState.EMPTY);

  const playmove = (move: string) => {
    const moves = [...currMoveHistory(), move];
    if (!moves.length) {
      return;
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
    if (newGameState) {
      if (newGameState.state === SpaceState.DRAW) {
        console.error("Game Draw")
      }
      setGameState(newGameState);
      setMoveHistory(moves);
    }
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

