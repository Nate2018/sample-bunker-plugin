import App from './App.svelte';

const app = new App({
  name: 'Viewer',
  id: 'cattn.viewer',
  version: '1.0.0',
  author: 'cattn',
  description: 'Svelte viewer',

  target: document.body,
  props: {
    name: 'Viewer',
  },
});

export default app;