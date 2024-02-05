<script>
	import * as Tooltip from '@haptic/ui/components/tooltip';
	export let text = 'Tooltip';
</script>

<Tooltip.Root openDelay={150} closeDelay={50}>
	<Tooltip.Trigger><slot /></Tooltip.Trigger>
	<Tooltip.Content>
		<Tooltip.Arrow class="fill-white" />
		<p>{text}</p>
	</Tooltip.Content>
</Tooltip.Root>
