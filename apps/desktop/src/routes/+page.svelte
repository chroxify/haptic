<script lang="ts">
	import { Button } from '@haptic/ui/components/button';
	import { toggleMode } from 'mode-watcher';
</script>

<Button variant="outline">Buttons</Button>
<Button on:click={toggleMode} variant="outline" size="icon">
	sun
	<span class="sr-only">Toggle theme</span>
</Button>

<h1>Welcome to SvelteKit</h1>
<p>Visit <a href="https://kit.svelte.dev">kit.svelte.dev</a> to read the documentation</p>
