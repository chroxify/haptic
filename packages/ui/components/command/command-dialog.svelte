<script lang="ts">
	import Command from './command.svelte';
	import * as Dialog from '../dialog';
	import type { Dialog as DialogPrimitive } from 'bits-ui';
	import type { Command as CommandPrimitive } from 'cmdk-sv';

	type $$Props = DialogPrimitive.Props &
		CommandPrimitive.CommandProps & { onKeyDown?: (event: KeyboardEvent) => void };

	export let open: $$Props['open'] = false;
	export let value: $$Props['value'] = undefined;
</script>

<Dialog.Root bind:open {...$$restProps}>
	<Dialog.Content class="overflow-hidden p-0 !w-[518px] top-[15%]">
		<Command
			class="[&_[data-cmdk-group-heading]]:px-2 [&_[data-cmdk-group-heading]]:font-medium [&_[data-cmdk-group-heading]]:text-muted-foreground [&_[data-cmdk-group]:not([hidden])_~[data-cmdk-group]]:pt-0 [&_[data-cmdk-group]]:px-2 [&_[data-cmdk-input-wrapper]_svg]:h-5 [&_[data-cmdk-input-wrapper]_svg]:w-5 [&_[data-cmdk-input]]:h-12 [&_[data-cmdk-item]]:px-4 [&_[data-cmdk-item]]:py-3 [&_[data-cmdk-item]_svg]:h-4 [&_[data-cmdk-item]_svg]:w-4"
			{...$$restProps}
			bind:value
		>
			<slot />
		</Command>
	</Dialog.Content>
</Dialog.Root>
