import type { Component } from 'solid-js';

import styles from './App.module.css';
import { Board } from './board/Board';

const App: Component = () => {
  return (
    <main class="flex items-center justify-center pt-24 px-4 container h-96 w-96">
      <Board/>
    </main>
  );
};

export default App;
