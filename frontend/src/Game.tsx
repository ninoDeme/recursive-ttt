import { Component, createContext, createSignal, useContext } from "solid-js";
import { GameState, SpaceState, SpaceTypes } from "./model";
import { Board, BoardState } from "./board/Board";
import { SquareState } from "./board/Square";

const PlayerContext = createContext<[() => SpaceState, (val: SpaceState) => void]>();

export const Game: Component<{ player: SpaceState }> = (props) => {
  const [currentGameState, setGameState] = createSignal<GameState>(new BoardState(
    "",
    Array(9).fill(null).map((_, i) => (new BoardState(
      `${i+1}`,
      Array(9).fill(null).map((_, j) => new SquareState(`${i+1}-${j+1}`)),
    )),
  )))

  const [currentPlayer, setPlayer] = createSignal<SpaceState>(
    props.player || SpaceState.X,
  );

  const player: [() => SpaceState, (val: SpaceState) => void] = [
    currentPlayer,
    setPlayer
  ];

  const [winner, setWinner] = createSignal<SpaceState>(SpaceState.EMPTY);

  const onplay = function (state: GameState, move: string) {
    console.log(move);
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

  const playmove = (move: string) => {
     
  }

  return (
    <PlayerContext.Provider value={player}>
      <Board state={currentGameState() as BoardState} onplayed={onplay}/>
    </PlayerContext.Provider>
  );
};

export function usePlayer() {
  return useContext(PlayerContext) ?? [null, null];
}


