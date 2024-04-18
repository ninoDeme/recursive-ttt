import { createSignal, type Component } from 'solid-js';

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

enum SpaceState {
  X,
  O,
  EMPTY
}

enum GameState {
  PLAYING,
  WON,
  DRAW,
  IDLE
}

function getSpaceStateSymbol(state: SpaceState) {
  switch (state) {
    case SpaceState.X: return 'X';
    case SpaceState.O: return 'O';
    case SpaceState.EMPTY: return ' ';
  }
}

export const Board: Component = () => {

  const [spaces, setSpaces] = createSignal<SpaceState[]>(new Array(9).fill(SpaceState.EMPTY));
  const [player, setPlayer] = createSignal<SpaceState>(SpaceState.O);
  const [gameState, setGameState] = createSignal<GameState>(GameState.IDLE);

  const play = function(index: number) {
    if (gameState() === GameState.WON || gameState() === GameState.DRAW) {
      return;
    }

    const currentSpace = spaces()[index];

    if (currentSpace !== SpaceState.EMPTY) {
      return;
      // TODO: Error Message
    }

    const newSpaces = [...spaces()];
    newSpaces[index] = player();

    setSpaces(newSpaces);
    let winner: SpaceState = SpaceState.EMPTY;
    for (const solution of SOLVED_STATES) {
      if (newSpaces[solution[0]] === newSpaces[solution[1]] && newSpaces[solution[0]] === newSpaces[solution[2]]) {
        winner = newSpaces[solution[0]];
        break;
      }
    }
    if (winner === SpaceState.EMPTY) {
      setPlayer(prev => prev === SpaceState.X ? SpaceState.O : SpaceState.X);
      if (newSpaces.every(val => val !== SpaceState.EMPTY)) {
        setGameState(GameState.DRAW);
      } else {
        setGameState(GameState.PLAYING);
      }
    } else {
      setGameState(GameState.WON);
    }

    console.log(GameState[gameState()]);
    console.log(SpaceState[player()]);

  };

  return (
    <div class="grid grid-cols-3 auto-rows-fr h-full w-full">{
      spaces().map((val, i) => <button class="hover:bg-white hover:bg-opacity-30 border text-6xl font-semibold text-center" onclick={() => play(i)}>{getSpaceStateSymbol(val)}</button>)
    }</div>

  );
};

