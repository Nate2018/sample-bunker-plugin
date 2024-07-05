import App from './App.svelte';

const Plugin = {
  name: 'Viewer',
  id: 'cattn.viewer',
  version: '1.0.0',
  author: 'cattn',
  description: 'Svelte viewer',

  tile() {
    return {
      App
    }
  }
}

export default Plugin;