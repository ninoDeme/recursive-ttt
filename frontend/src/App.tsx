import type { Component } from 'solid-js';

import styles from './App.module.css';
import { Game } from './Game';
import { SpaceState } from './model';

const App: Component = () => {
  return (
    <main class="flex items-center justify-center mt-16 mx-auto container aspect-square w-8/12 max-w-4xl">
      <Game player={SpaceState.X}/>
    </main>
  );
};

export default App;
