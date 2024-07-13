<script lang="ts">
	import { Dialog as SheetPrimitive } from 'bits-ui';
	import { cn } from '../../lib/utils';

	type $$Props = SheetPrimitive.TitleProps;

	let className: $$Props['class'] = undefined;
	export { className as class };
</script>

<SheetPrimitive.Title class={cn('text-lg text-foreground', className)} {...$$restProps}>
	<slot />
</SheetPrimitive.Title>
