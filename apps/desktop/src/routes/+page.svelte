<script lang="ts">
	import { toggleTheme } from '@/utils';
	import { Button } from '@haptic/ui/components/button';
</script>

<!-- ! This is basically a dead page as page.server.ts always redirects to /notes -->
<Button variant="outline">Buttons</Button>
<Button on:click={toggleTheme} variant="outline" size="icon">
	sun
	<span class="sr-only">Toggle theme</span>
</Button>

<h1>Welcome to SvelteKit</h1>
<p>Visit <a href="https://kit.svelte.dev">kit.svelte.dev</a> to read the documentation</p>
