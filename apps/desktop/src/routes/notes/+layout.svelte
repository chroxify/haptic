<script>
	import NotesSidebar from './notes-sidebar.svelte';
</script>

<NotesSidebar />
<div
	class="flex flex-col w-full h-screen items-center justify-center bg-secondary-background ml-64 py-12"
>
	<slot />
</div>
