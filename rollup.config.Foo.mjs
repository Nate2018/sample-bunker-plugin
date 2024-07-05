import svelte from 'rollup-plugin-svelte'
import commonjs from '@rollup/plugin-commonjs'
import resolve from '@rollup/plugin-node-resolve'
import css from 'rollup-plugin-css-only'
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

const production = !process.env.ROLLUP_WATCH

const cmp = 'App'

export default {
  input: ['src/App.svelte'],
  output: {
    format: 'es',
    dir: `dist/`,
    sourcemap: false,
  },

  plugins: [
    svelte({
      preprocess: vitePreprocess({
        mode: production ? 'build' : 'dev',
      }),
      emitCss: true,
      compilerOptions: {
        dev: !production,
      },
    }),
    css({
      output: `${cmp}.css`,
      plugins: [
        ('tailwindcss'),
        ('autoprefixer'),
      ],
    }),
    resolve({
      browser: true,
      dedupe: ['svelte'],
    }),
    commonjs(),
  ],
}
