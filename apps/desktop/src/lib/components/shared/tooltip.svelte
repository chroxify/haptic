<script lang="ts">
	import { tooltipsOpen } from '@/store';
	import * as Tooltip from '@haptic/ui/components/tooltip';
	import type { ShortcutParams } from '@/types';
	import { shortcutToString } from '@/utils';
	export let text = 'Tooltip';
	export let shortcut: ShortcutParams | undefined = undefined;

	// TODO: Find out why sometimes it needs refresh to work properly again after a while #BUG
</script>

<Tooltip.Root
	openDelay={$tooltipsOpen >= 1 ? 0 : 300}
	closeDelay={$tooltipsOpen >= 1 ? 0 : 50}
	onOpenChange={(open) => {
		if (open) {
			tooltipsOpen.update((value) => value + 1);
		} else {
			setTimeout(() => {
				tooltipsOpen.update((value) => value - 1);
			}, 500);
		}
	}}
>
	<Tooltip.Trigger><slot /></Tooltip.Trigger>
	<Tooltip.Content {...$$props} transitionConfig={{ duration: $tooltipsOpen > 1 ? 125 : 175 }}>
		{text}
		{#if shortcut}
			<span
				class="pointer-events-none inline-flex h-[18px] pl-1.5 tracking-widest -mr-2 select-none items-center gap-1 rounded bg-muted px-1 font-mono font-medium text-foreground/70 opacity-100"
			>
				{shortcutToString(shortcut)}
			</span>
		{/if}
	</Tooltip.Content>
</Tooltip.Root>
