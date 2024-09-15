<script lang="ts">
	import {
		collection,
		editor,
		isPageSidebarOpen,
		pageSidebarWidth,
		platform,
		resizingPageSidebar
	} from '@/store';
	import { cn } from '@haptic/ui/lib/utils';
	import TaskEntries from './task-entries.svelte';

	let startX: number | null;
	let startWidth: number;

	const handleMouseMove = (e: MouseEvent) => {
		if (startX === null) return;
		resizingPageSidebar.set(true);

		const x = e.clientX;

		// Set collapsing bounds
		if (x < 100) {
			resizingPageSidebar.set(false);
			isPageSidebarOpen.set(false);
			return;
		} else if (x > 100 && !$isPageSidebarOpen) {
			resizingPageSidebar.set(false);
			isPageSidebarOpen.set(true);
			return;
		}

		const diff = x - startX;
		const newWidth = Math.max(210, Math.min(500, startWidth + diff));

		// Set cursor resize bounds to prevent resizing when cursor is outside of the width bounds
		if (x < 245 || x > 550) {
			return;
		}

		pageSidebarWidth.set(newWidth);
	};

	const resizeHandler = (e: MouseEvent) => {
		e.preventDefault();
		startX = e.clientX;
		startWidth = $pageSidebarWidth;

		resizingPageSidebar.set(true);
		$editor.commands.blur();
		document.body.classList.add('cursor-col-resize');

		const handleMouseUp = () => {
			startX = null;
			document.removeEventListener('mousemove', handleMouseMove);
			document.removeEventListener('mouseup', handleMouseUp);
			document.body.classList.remove('cursor-col-resize');
			resizingPageSidebar.set(false);

			if ($pageSidebarWidth < 100) {
				isPageSidebarOpen.set(false);
			}
		};

		document.addEventListener('mousemove', handleMouseMove);
		document.addEventListener('mouseup', handleMouseUp);
	};
</script>

<div
	class={cn(
		'fixed left-12 flex flex-col justify-start items-center bg-background overflow-y-auto transform transition-transform duration-300',
		!$isPageSidebarOpen && '-translate-x-52',
		$platform === 'darwin' ? 'h-[calc(100vh-4.5rem)]' : 'h-[calc(100vh-2.25rem)]'
	)}
	style={`width: ${$pageSidebarWidth}px`}
>
	<!-- Drag border -->
	<div
		class="h-full w-1 border-r cursor-col-resize absolute top-0 right-0 z-10 hover:bg-foreground/10 hover:delay-75 transition-all duration-200 active:bg-foreground/20 active:!cursor-col-resize"
		on:mousedown={resizeHandler}
		role="presentation"
	/>

	<!-- Tasks -->
	<div
		class="flex flex-col items-start gap-1 w-full px-2 h-full overflow-auto pt-2 pb-4"
		data-collection-root
		data-path={$collection}
	>
		<TaskEntries />
	</div>
</div>

<style>
	:global(body.cursor-col-resize) {
		cursor: col-resize !important;
		user-select: none !important;
		pointer-events: none;
	}
</style>
