<script lang="ts">
	import { Button as ButtonPrimitive } from 'bits-ui';
	import { cn } from '../../lib/utils';
	import { buttonVariants, type Props } from '.';

	type $$Props = Props;

	let className: $$Props['class'] = undefined;
	export let variant: $$Props['variant'] = 'default';
	export let size: $$Props['size'] = 'default';
	export let scale: $$Props['scale'] = undefined;
	export let builders: $$Props['builders'] = [];
	export { className as class };
</script>

<ButtonPrimitive.Root
	{builders}
	class={cn(buttonVariants({ variant, size, scale, className }))}
	type="button"
	{...$$restProps}
	on:click
	on:keydown
>
	<slot />
</ButtonPrimitive.Root>
