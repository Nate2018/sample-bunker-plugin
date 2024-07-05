// rollup.config.js
import svelte from 'rollup-plugin-svelte';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

const production = !process.env.ROLLUP_WATCH;

export default {
  input: 'src/main.js', 
  output: {
    sourcemap: true,
    format: 'iife',
    name: 'app',
    file: 'build/bundle.js', 
  },
  plugins: [
    svelte({
      compilerOptions: {
        dev: !production,
      },
    }),
    resolve({
      browser: true,
      dedupe: ['svelte'],
    }),
    commonjs(),

  ],
  watch: {
    clearScreen: false,
  },
};
