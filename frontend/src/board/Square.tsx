import { GameState, SpaceState, SpaceTypes, SquareLike } from "../model";
import { usePlayer } from "../Game";
import { Match, Switch } from "solid-js";

export const Square: SquareLike<SquareState> = (props) => {

  const [currentPlayer] = usePlayer();

  if (currentPlayer == null) {
    throw new Error('Not in player context');
  }

  return (
    <button onclick={() => props.onplayed({...props.state, state: currentPlayer()})}
      class="hover:bg-white hover:bg-opacity-30 border flex justify-center items-center">
      <Switch fallback={<div></div>}>
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
    </button>
  );
};

export interface SquareState extends GameState {
  type: SpaceTypes.SQUARE,
  state: SpaceState,
  children: [];
  _parent?: GameState;
  id: string;
}
