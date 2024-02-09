<script lang="ts">
	import { ContextMenu as ContextMenuPrimitive } from 'bits-ui';
	import { onMount } from 'svelte';

	let open = false;

	function handleClick(event: MouseEvent) {
		if (event.button === 0 || event.button === 2) {
			// If event target has data-menu-content attribute, ignore
			if ((event.target as HTMLElement).closest('[data-menu-content]')) return;

			open = false;
		}
	}

	onMount(() => {
		window.addEventListener('mousedown', handleClick);

		return () => {
			window.removeEventListener('mousedown', handleClick);
		};
	});
</script>

<ContextMenuPrimitive.Root
	{open}
	onOpenChange={(value) => (open = value)}
	closeOnOutsideClick={true}
	onOutsideClick={(e) => e.preventDefault()}
>
	<slot />
</ContextMenuPrimitive.Root>
