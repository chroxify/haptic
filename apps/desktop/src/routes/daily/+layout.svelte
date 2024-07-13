<script lang="ts">
	import DailySidebar from './sidebar.svelte';
	import { isPageSidebarOpen, pageSidebarWidth, resizingPageSidebar } from '@/store';
</script>

<div
	class="flex flex-col w-full h-[calc(100vh-4.5rem)] bg-secondary-background ml-12 overflow-hidden"
>
	<DailySidebar />
	<div
		class="h-full overflow-y-auto"
		style={`margin-left: ${$isPageSidebarOpen ? $pageSidebarWidth : 0}px; transition: ${
			$resizingPageSidebar ? 'none' : 'margin-left 300ms'
		}`}
	>
		<slot />
	</div>
</div>
