<script lang="ts">
	import NotesSidebar from './sidebar.svelte';
	import Layout from '$lib/components/notes/layout.svelte';
</script>

<Layout sidebar={NotesSidebar}>
	<slot />
</Layout>
