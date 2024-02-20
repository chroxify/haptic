<script lang="ts">
	import Editor from '@/components/shared/editor/editor.svelte';
	import EditorToolbar from './editor-toolbar.svelte';
	import EditorSearch from './editor-search.svelte';
</script>

<div
	class="relative flex flex-col w-full h-full min-h-[calc(100vh-4.5rem)] items-start bg-secondary-background overflow-y-auto"
>
	<EditorToolbar />
	<EditorSearch />
	<Editor />
</div>
