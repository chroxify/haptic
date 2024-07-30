<script lang="ts">
	import TaskSidebar from './sidebar.svelte';
	import Layout from '$lib/components/notes/layout.svelte';
</script>

<Layout sidebar={TaskSidebar}>
	<slot />
</Layout>
