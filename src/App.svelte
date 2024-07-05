<script>
    let real = "real";
    import { Skull } from 'lucide-svelte';
    let text = "";

    function launchViewer(url) {
        try {
              new URL(url)
              const tab = window.open('about:blank', '_blank')
              if (!tab) return
              const iframe = tab.document.createElement('iframe')

              const stl = iframe.style
              stl.border = stl.outline = 'none'
              stl.width = '100vw'
              stl.height = '100vh'
              stl.position = 'fixed'
              stl.left = stl.right = stl.top = stl.bottom = '0'

              iframe.src = url
              tab.document.body.appendChild(iframe)
            } catch (e) {
              console.log(e);
            }
        }
</script>

<div class="flex flex-col justify-cente rounded-lg px-6 mt-2 mb-4">
<div class="flex flex-col">
    <input class="bg-gray-950 outline-1 outline-gray-950 text-white font-bold py-2 px-4 rounded mb-2" placeholder="URL (not proxied)" bind:value={text} type="text" />
    <button class="bg-gray-950 outline-1 outline-gray-950 text-white font-bold py-2 px-4 rounded mb-2" on:click={() => launchViewer(text)}>Go!</button>
</div>
</div>