import { Component, createContext, createSignal, useContext } from "solid-js";
import { GameState, SpaceState, SpaceTypes } from "./model";
import { Board, BoardState } from "./board/Board";
import { SquareState } from "./board/Square";

const PlayerContext = createContext<[() => SpaceState, (val: SpaceState) => void]>();

export const Game: Component<{ player: SpaceState }> = (props) => {
  const [currentGameState, setGameState] = createSignal<GameState>({
    type: SpaceTypes.BOARD,
    state: SpaceState.EMPTY,
    id: "",
    children: Array(9).fill(null).map((_, i) => ({
      type: SpaceTypes.BOARD,
      state: SpaceState.EMPTY,
      id: `${i}`,
      children: Array(9).fill(null).map((_, j) => ({
        type: SpaceTypes.SQUARE,
        state: SpaceState.EMPTY,
        id: `${i},${j}`,
      } as SquareState))
    } as BoardState)),
  });

  const [currentPlayer, setPlayer] = createSignal<SpaceState>(
    props.player || SpaceState.X,
  );

  const player: [() => SpaceState, (val: SpaceState) => void] = [
    currentPlayer,
    setPlayer
  ];

  const [winner, setWinner] = createSignal<SpaceState>(SpaceState.EMPTY);

  const play = function (state: GameState) {
    setWinner(state.state);
    setGameState(state);
    if (state.state === SpaceState.DRAW) {
      setPlayer(SpaceState.DRAW);
      return console.error("Game Draw")
    }
    if (state.state === SpaceState.EMPTY) {
      setPlayer(p => p === SpaceState.X ? SpaceState.O : SpaceState.X );
    }
  };

  return (
    <PlayerContext.Provider value={player}>
      <Board state={currentGameState() as BoardState} onplayed={play}/>
    </PlayerContext.Provider>
  );
};

export function usePlayer() {
  return useContext(PlayerContext) ?? [null, null];
}


