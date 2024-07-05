<script>
    let real = "real";
    import { Skull } from 'lucide-svelte';
    import { Button } from "bits-ui";
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

<div class="flex justify-center bg-gray-300 rounded-lg px-12">
<p class="text-sm">{real}</p>
<p class="text-lg"> ermmm! </p>
<Button on:click={() => launchViewer(text)}>Launch Page</Button>
<input bind:value={text} type="text" />
<Skull />
</div>