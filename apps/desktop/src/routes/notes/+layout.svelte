<script lang="ts">
	import NotesSidebar from './notes-sidebar.svelte';
	import { isNotesSidebarOpen, notesSidebarWidth, resizingNotesSidebar } from '@/store';
</script>

<div
	class="flex flex-col w-full h-[calc(100vh-4.5rem)] bg-secondary-background ml-12 overflow-hidden"
>
	<NotesSidebar />
	<div
		class="h-full overflow-y-auto"
		style={`margin-left: ${$isNotesSidebarOpen ? $notesSidebarWidth : 0}px; transition: ${
			$resizingNotesSidebar ? 'none' : 'margin-left 300ms'
		}`}
	>
		<slot />
	</div>
</div>
