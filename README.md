<div align="center">
  <h1>Sample Bunker Plugin</h1>
</div>

## Installation & Building
- Install Packages ``npm i``
- Build the Plugin ``rollup --config rollup.config.mjs``

## Usage
Please be aware that you should contain your plugin to App.svelte and any npm packages you choose to use.<br>
- Component Libraries like shadcn-svelte will not work due to using extra .svelte files.
- ``bits-ui`` and libraries like it that aren't wrappers should work
- ``lucide-svelte`` will work as well.

## Plugin Configuration 
The configuration file for your plugin should be placed alongside the built files.
```json
{
    "name": "Sample Plugin",
    "id": "cattn.plugin",
    "description": "Sample plugin for Bunker",
    "version": "0.0.1",
    "author": "cattn",
    "content": "App.js",
    "type": "tile",
    "url": "https://raw.githubusercontent.com/Cattn/sample-bunker-plugin/main/dist/"
}
```
- name
  - The name of your plugin
- id
  - The id of your plugin (``author``.``name``), must be all lowercase, no spaces.
- description
  - A brief description of your plugin. This will be shown in the Addon Manager.
- version
  - The version number of your plugin. Follow x.x.x scheme.
- author
  - Name of the user who created the plugin. Does not need to be lowercase & spaces allowed.
- content
  - Relative link to the built content. You shouldn't change this unless you know what you're doing.
- type
  - Should be set to ``tile`` for plugins.
- url
  - Url that the plugin is avalible at. You may use a raw.githubusercontent.com link.

## Contributors
Created by [Cattn](https://github.com/Cattn)
