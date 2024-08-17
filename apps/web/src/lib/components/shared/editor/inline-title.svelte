<script lang="ts">
	import { renameNote } from '@/api/notes';
	import { activeFile, collectionSettings, editor, editorMode } from '@/store';
	import { cn } from '@/utils';

	export let preCheckRegex: RegExp | undefined = undefined;

	let value = '';

	// Handle keydown for enter key
	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Enter') {
			$editor.chain().focus().run();
		}
	}

	// Rename handler on input blur
	async function handleBlur() {
		if (!$activeFile) return;

		// Make sure file name is in date format year-month-day, else return
		if (preCheckRegex && !preCheckRegex.test(value)) {
			value = $activeFile.split('/').pop()!.split('.').slice(0, -1).join('.');
		}

		if (
			value !== $activeFile.split('/').pop()!.split('.').slice(0, -1).join('.') &&
			value.trim() !== ''
		) {
			// Rename note
			try {
				await renameNote($activeFile, value);
			} catch {
				value = $activeFile.split('/').pop()!.split('.').slice(0, -1).join('.');
			}
		}

		if (value.trim() === '') {
			value = $activeFile.split('/').pop()!.split('.').slice(0, -1).join('.');
		}

		// Remove last extension
		if (value.includes('.')) {
			value = value.split('.').slice(0, -1).join('.');
		}

		// Remove invalid characters
		value = value.replace(/[/\\?%*:|"<>]/g, '');
	}

	activeFile.subscribe((notePath) => {
		// Set file name as value, remove extension
		value = notePath ? notePath.split('/').pop()!.split('.').slice(0, -1).join('.') : '';
	});
</script>

<div
	class={cn(
		'flex items-center w-full h-fit px-8 pb-2.5',
		!$collectionSettings.editor.show_toolbar && 'mt-5'
	)}
>
	{#if $collectionSettings.editor.show_inline_title}
		<input
			id="inline-title-input"
			type="text"
			autocomplete="off"
			autocorrect="off"
			disabled={$editorMode !== 'edit'}
			class={cn(
				'w-[655px] prose font-bold text-4xl text-foreground mx-auto bg-transparent focus:outline-none',
				// Safari / Webkit for some reason has a smaller editor width so we need to adjust
				/^((?!chrome|android).)*safari/i.test(navigator.userAgent) && 'w-[635px]'
			)}
			on:keydown={handleKeydown}
			on:blur={handleBlur}
			bind:value
		/>
	{/if}
</div>
