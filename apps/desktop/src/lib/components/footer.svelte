<script lang="ts">
	import { Button } from '@haptic/ui/components/button';
	import { toggleMode } from 'mode-watcher';
	import Icon from './shared/icon.svelte';
	import Tooltip from './shared/tooltip.svelte';
</script>

<footer
	class="fixed bottom-0 w-full flex justify-between items-center h-9 border-t pb-0.5 px-1.5 bg-background"
>
	<div class="cursor-default select-none">
		<Button
			on:click={toggleMode}
			size="icon"
			variant="ghost"
			class="h-6 w-6 fill-foreground/50 hover:fill-foreground transition-all"
			scale="sm"
		>
			<Icon name="moon" class="w-4 h-4 hidden dark:block" />
			<Icon name="sun" class="w-4 h-4 block dark:hidden" />
		</Button>

		<Button
			size="icon"
			variant="ghost"
			class="h-6 w-6 fill-foreground/50 hover:fill-foreground transition-all"
			scale="sm"
		>
			<Icon name="cloudX" class="w-4 h-4" />
		</Button>
	</div>

	<div class="cursor-default select-none">
		<Button
			size="icon"
			variant="ghost"
			class="h-6 w-6 fill-foreground/50 hover:fill-foreground transition-all"
			scale="sm"
		>
			<Icon name="lifebouy" class="w-4 h-4" />
		</Button>
		<Tooltip text="Shortcuts">
			<Button
				size="icon"
				variant="ghost"
				class="h-6 w-6 fill-foreground/50 hover:fill-foreground transition-all"
				scale="sm"
			>
				<Icon name="bolt" class="w-4 h-4" />
			</Button>
		</Tooltip>
		<Tooltip text="Share">
			<Button
				size="icon"
				variant="ghost"
				class="h-6 w-6 fill-foreground/50 hover:fill-foreground transition-all"
				scale="sm"
			>
				<Icon name="share" class="w-4 h-4" />
			</Button>
		</Tooltip>
	</div>
</footer>
