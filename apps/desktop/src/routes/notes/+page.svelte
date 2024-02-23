<script lang="ts">
	import Editor from '@/components/shared/editor/editor.svelte';
	import EditorToolbar from './editor-toolbar.svelte';
	import EditorSearch from './editor-search.svelte';
	import { collectionSettings } from '@/store';
</script>

<div
	class="relative flex flex-col w-full h-full min-h-[calc(100vh-4.5rem)] items-start bg-secondary-background overflow-y-auto"
>
	{#if $collectionSettings.editor.show_toolbar}
		<EditorToolbar />
	{/if}
	<EditorSearch />
	<Editor />
</div>
