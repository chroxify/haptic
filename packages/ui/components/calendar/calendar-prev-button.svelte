<script lang="ts">
	import { Calendar as CalendarPrimitive } from 'bits-ui';
	import { ChevronLeft } from 'lucide-svelte';
	import { buttonVariants } from '../button/index';
	import { cn } from '../../lib/utils';

	type $$Props = CalendarPrimitive.PrevButtonProps;
	type $$Events = CalendarPrimitive.PrevButtonEvents;

	let className: $$Props['class'] = undefined;
	export { className as class };
</script>

<CalendarPrimitive.PrevButton
	on:click
	class={cn(
		buttonVariants({ variant: 'outline', scale: 'md' }),
		'h-[26px] w-[26px] bg-transparent p-0 opacity-50 hover:opacity-100',
		className
	)}
	{...$$restProps}
	let:builder
>
	<slot {builder}>
		<ChevronLeft class="h-3.5 w-3.5" />
	</slot>
</CalendarPrimitive.PrevButton>
