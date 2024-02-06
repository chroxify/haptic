<script>
	import NotesSidebar from './notes-sidebar.svelte';
</script>

<div
	class="flex flex-col w-full h-[calc(100vh-4.5rem)] bg-secondary-background ml-12 overflow-hidden"
>
	<NotesSidebar />
	<div class="pl-52 h-full overflow-y-auto">
		<slot />
	</div>
</div>
