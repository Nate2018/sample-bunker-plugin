import svelte from 'rollup-plugin-svelte'
import commonjs from '@rollup/plugin-commonjs'
import resolve from '@rollup/plugin-node-resolve'
import css from 'rollup-plugin-css-only'

const production = !process.env.ROLLUP_WATCH

// include CSS in component's JS for ease of use
//
// set to true to get separate CSS for the component (but then,
// you'll need to inject it yourself at runtime somehow)
//
const emitCss = false

const cmp = 'App'

export default {
  input: `src/${cmp}.svelte`,

  output: {
    format: 'es',
    file: `dist/${cmp}.js`,
    sourcemap: false,
  },

  plugins: [
    svelte({
      emitCss,
      compilerOptions: {
        dev: !production,
      },
    }),

    emitCss && css({ output: `${cmp}.css` }),

    resolve({
      browser: true,
      dedupe: ['svelte'],
    }),
    commonjs(),
  ],
}