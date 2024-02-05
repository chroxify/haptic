<script lang="ts">
	import { Button } from '@haptic/ui/components/button';
	import { Sun, Moon } from 'radix-icons-svelte';
	import { toggleMode } from 'mode-watcher';
</script>

<header
	class="fixed top-0 w-full flex justify-between items-center h-9 border-b pl-20 bg-background z-10"
	data-tauri-drag-region
>
	<div class="flex items-center">
		<a href="/inbox" class="mr-4">Buttons</a>
		<Button on:click={toggleMode} variant="outline" size="icon">
			<Sun
				class="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0"
			/>
			<Moon
				class="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100"
			/>
			<span class="sr-only">Toggle theme</span>
		</Button>
	</div>
</header>
