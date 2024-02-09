<script>
	import { tooltipsOpen } from '@/store';
	import * as Tooltip from '@haptic/ui/components/tooltip';
	export let text = 'Tooltip';

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
	</Tooltip.Content>
</Tooltip.Root>
