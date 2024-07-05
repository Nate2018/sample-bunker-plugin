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

<div class="flex flex-col justify-center bg-gray-700 rounded-lg px-12 mt-2">
<p class="text-lg"> ermmm! </p>
<div class="flex">
    <button class="bg-slate-900 text-white font-bold py-2 px-4 rounded" on:click={() => launchViewer(text)}>Launch Page</button>
    <input class="bg-slate-900 text-white font-bold py-2 px-4 rounded" bind:value={text} type="text" />
</div>
</div>