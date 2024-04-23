import { GameState, SpaceState, SpaceTypes, SquareLike } from "../model";
import { usePlayer } from "../Game";
import { Match, Switch } from "solid-js";
import cross from '/src/assets/cross.svg'
import circle from '/src/assets/circle.svg'

export const Square: SquareLike<SquareState> = (props) => {

  const [currentPlayer] = usePlayer();

  if (currentPlayer == null) {
    throw new Error('Not in player context');
  }

  return (
    <button onclick={() => props.onplayed({...props.state, state: currentPlayer()})}
      class="hover:bg-white hover:bg-opacity-30 flex justify-center items-center">
      <Switch fallback={<div></div>}>
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
