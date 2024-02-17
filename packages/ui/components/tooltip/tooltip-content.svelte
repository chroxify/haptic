<script lang="ts">
	import { Tooltip as TooltipPrimitive } from 'bits-ui';
	import { cn, flyAndScale } from '../../lib/utils';

	type $$Props = TooltipPrimitive.ContentProps;

	let className: $$Props['class'] = undefined;
	export let sideOffset: $$Props['sideOffset'] = 4;
	export let transition: $$Props['transition'] = flyAndScale;
	export let transitionConfig: $$Props['transitionConfig'] = {
		y: 8,
		duration: 150
	};
	export { className as class };
</script>

<TooltipPrimitive.Content
	{transition}
	{transitionConfig}
	{sideOffset}
	class={cn('flex items-center justify-center border z-50 rounded-md bg-secondary h-6', className)}
	{...$$restProps}
>
	<TooltipPrimitive.Arrow class="bg-primary rounded-[1.5px] border" />
	<div
		class={cn(
			'flex items-center gap-1.5 justify-center w-full h-full px-2.5 z-50 bg-secondary text-xs text-secondary-foreground rounded-md',
			className
		)}
	>
		<slot />
	</div>
</TooltipPrimitive.Content>
