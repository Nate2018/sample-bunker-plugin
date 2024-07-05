// rollup.config.js
import svelte from 'rollup-plugin-svelte';
import nodeResolve from '@rollup/plugin-node-resolve';
import replace from '@rollup/plugin-replace';
import commonjs from '@rollup/plugin-commonjs';
import esbuild from 'rollup-plugin-esbuild'

const production = !process.env.ROLLUP_WATCH;

export default {
  input: 'src/App.svelte', 
  output: {
    format: 'es',
    file: 'build/bundle.js', 
  },
  plugins: [
    svelte({
      compilerOptions: {
        dev: !production,
      },
    }),
    esbuild({
      minify: true
    }),
    nodeResolve({
      extensions: ['.js', '.svelte']
    }),
    commonjs(),
    replace({
      preventAssignment: false,
      'process.env.NODE_ENV': '"development"'
    })

  ],
};
