<script lang="ts">
	import NoteDetails from './details.svelte';
	import {
		isPageSidebarOpen,
		pageSidebarWidth,
		resizingPageSidebar,
		isNoteDetailSidebarOpen,
		noteDetailSidebarWidth,
		resizingNoteDetailSidebar
	} from '@/store';

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	export let sidebar: any;
</script>

<div
	class="flex flex-col w-full h-[calc(100vh-4.5rem)] bg-secondary-background ml-12 overflow-hidden"
>
	<svelte:component this={sidebar} />
	<div
		class="h-full overflow-y-auto"
		style={`
					margin-left: ${$isPageSidebarOpen ? $pageSidebarWidth : 0}px; 
					margin-right: ${$isNoteDetailSidebarOpen ? $noteDetailSidebarWidth : 0}px; 
					transition: ${
						$resizingPageSidebar || $resizingNoteDetailSidebar
							? 'none'
							: 'margin-left 300ms, margin-right 300ms'
					}
			`}
	>
		<slot />
	</div>
	<NoteDetails />
</div>
