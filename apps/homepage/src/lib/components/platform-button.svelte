<script lang="ts">
	import { cn } from '@haptic/ui/lib/utils';

	export let name;
	export let active: boolean = false;
</script>

<button
	id={`pb-${name}`}
	on:click
	class={cn(
		'm-2 inline-flex flex-shrink-0 h-[120px] w-[124px] grow flex-col items-center justify-center rounded-xl border border-transparent text-center opacity-50 transition-opacity',
		active ? 'border-border bg-secondary-background  !opacity-100' : 'hover:bg-secondary/45'
	)}
>
	<div
		class="mb-4 flex flex-shrink-0 rounded-xl border border-foreground/25 bg-secondary-background p-4"
	>
		<slot />
	</div>
	<div class="text-sm leading-tight text-secondary-foreground">{name}</div>
</button>
