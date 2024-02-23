<script lang="ts">
	import Label from '@haptic/ui/components/label/label.svelte';
	import * as Select from '@haptic/ui/components/select';
	import { Switch } from '@haptic/ui/components/switch';
	import { cn } from '@/utils';
	import { setSettings } from '@/api/settings';
	import { activeFile, collectionSettings } from '@/store';
	import { invalidateAll } from '$app/navigation';
	import { openNote } from '@/api/notes';

	let selectedFont = { value: 'inter', label: 'Inter' };
	let selectedFontSize = { value: 'normal', label: 'Normal' };
	let textCorrections = {
		spellCheck: true,
		autoCorrect: true
	};
	let additionalSettings = {
		inlineTitle: true,
		lineNumbers: true,
		editorToolbar: true
	};
</script>

<div class="space-y-5">
	<div class="space-y-1">
		<Label class="text-base">Font</Label>
		<p class="text-muted-foreground text-xs">Change the editor font.</p>
		<div class="flex items-center gap-2 pt-2">
			<Select.Root bind:selected={selectedFont}>
				<Select.Trigger class="w-32">
					<Select.Value class="text-sm text-foreground/85">{selectedFont.label}</Select.Value>
				</Select.Trigger>
				<Select.Content>
					<Select.Item value="inter">Inter</Select.Item>
					<Select.Item value="roboto">Roboto</Select.Item>
					<Select.Item value="lato">Lato</Select.Item>
					<Select.Item value="poppins">Poppins</Select.Item>
					<Select.Item value="nunito">Nunito</Select.Item>
					<Select.Item value="openSans">Open Sans</Select.Item>
				</Select.Content>
			</Select.Root>
		</div>
	</div>

	<div class="space-y-1">
		<Label class="text-base">Font size</Label>
		<p class="text-muted-foreground text-xs">Change the editor font size.</p>
		<div class="flex items-center gap-2 pt-2">
			<Select.Root bind:selected={selectedFontSize}>
				<Select.Trigger class="w-32">
					<Select.Value class="text-sm text-foreground/85">{selectedFontSize.label}</Select.Value>
				</Select.Trigger>
				<Select.Content>
					<Select.Item value="smaller">Smaller</Select.Item>
					<Select.Item value="small">Small</Select.Item>
					<Select.Item value="normal">Normal</Select.Item>
					<Select.Item value="large">Large</Select.Item>
					<Select.Item value="larger">Larger</Select.Item>
				</Select.Content>
			</Select.Root>
		</div>
	</div>

	<div class="space-y-1">
		<Label class="text-base">Text correction</Label>
		<p class="text-muted-foreground text-xs">Enable or disable various text correction features.</p>
		<div class="flex flex-col items-start gap-2.5 pt-2">
			<div class="flex items-center gap-2">
				<Switch
					checked={$collectionSettings.editor.auto_correct}
					onCheckedChange={(value) =>
						setSettings('collection', {
							...$collectionSettings,
							editor: { ...$collectionSettings.editor, auto_correct: value }
						})}
				/>
				<Label
					class={cn(
						'text-foreground/60 text-sm font-normal',
						textCorrections.autoCorrect && 'text-foreground'
					)}
				>
					Auto correct
				</Label>
			</div>
			<div class="flex items-center gap-2">
				<Switch
					checked={$collectionSettings.editor.spell_check}
					onCheckedChange={(value) =>
						setSettings('collection', {
							...$collectionSettings,
							editor: { ...$collectionSettings.editor, spell_check: value }
						})}
				/>
				<Label
					class={cn(
						'text-foreground/60 text-sm font-normal',
						textCorrections.spellCheck && 'text-foreground'
					)}
				>
					Spell check
				</Label>
			</div>
		</div>
	</div>

	<div class="space-y-1">
		<Label class="text-base">Additional settings</Label>
		<p class="text-muted-foreground text-xs">Additional settings for the editor.</p>
		<div class="flex flex-col items-start gap-2.5 pt-2">
			<div class="flex items-center gap-2">
				<Switch
					checked={$collectionSettings.editor.show_inline_title}
					onCheckedChange={(value) => {
						setSettings('collection', {
							...$collectionSettings,
							editor: { ...$collectionSettings.editor, show_inline_title: value }
						});
						invalidateAll();
						openNote($activeFile || '', true);
					}}
				/>
				<Label
					class={cn(
						'text-foreground/60 text-sm font-normal',
						additionalSettings.inlineTitle && 'text-foreground'
					)}
				>
					Show inline title
				</Label>
			</div>
			<div class="flex items-center gap-2">
				<Switch
					disabled
					checked={$collectionSettings.editor.show_line_numbers}
					onCheckedChange={(value) =>
						setSettings('collection', {
							...$collectionSettings,
							editor: { ...$collectionSettings.editor, show_line_numbers: value }
						})}
				/>
				<Label
					class={cn(
						'text-foreground/60 text-sm font-normal',
						additionalSettings.lineNumbers && 'text-foreground'
					)}
				>
					Show line numbers
				</Label>
			</div>
			<div class="flex items-center gap-2">
				<Switch
					checked={$collectionSettings.editor.show_toolbar}
					onCheckedChange={(value) =>
						setSettings('collection', {
							...$collectionSettings,
							editor: { ...$collectionSettings.editor, show_toolbar: value }
						})}
				/>
				<Label
					class={cn(
						'text-foreground/60 text-sm font-normal',
						additionalSettings.editorToolbar && 'text-foreground'
					)}
				>
					Show editor toolbar
				</Label>
			</div>
		</div>
	</div>
</div>
