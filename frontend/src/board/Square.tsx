import { GameComponent, SpaceState, GameComponentType, SquareLike, componentPlay } from "../model";
import { useMoveHistory } from "../Game";
import { Match, Switch, createEffect } from "solid-js";
import cross from '/src/assets/cross.svg'
import circle from '/src/assets/circle.svg'

export const Square: SquareLike<SquareComponent> = (props) => {

  const [_, playMove] = useMoveHistory();

  return (
    <button onclick={() => playMove?.(props.state.id)}
      class="hover:bg-white hover:bg-opacity-30 flex justify-center items-center w-full h-full">
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

export interface SquareComponent extends GameComponent {
  readonly type: GameComponentType.SQUARE;
  readonly state: SpaceState;
  readonly id: string;
}

export const squareComponentPlay: componentPlay<SquareComponent> = (component: SquareComponent, moves: string[]): SquareComponent => {
  if (component.id !== moves[moves.length-1]) {
    throw new Error("invalid move")
  }
  return {...component, state: moves.length & 1 ? SpaceState.X : SpaceState.O};
};
