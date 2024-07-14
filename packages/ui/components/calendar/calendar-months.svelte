<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { cn } from '../../lib/utils';

	type $$Props = HTMLAttributes<HTMLDivElement>;

	let className: $$Props['class'] = undefined;
	export { className as class };
</script>

<div
	class={cn('mt-2 flex flex-col space-y-4 sm:flex-row sm:space-x-2 sm:space-y-0', className)}
	{...$$restProps}
>
	<slot />
</div>
