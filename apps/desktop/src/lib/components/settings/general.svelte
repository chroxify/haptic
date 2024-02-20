<script lang="ts">
	import { Button } from '@haptic/ui/components/button';
	import Label from '@haptic/ui/components/label/label.svelte';
	import * as Select from '@haptic/ui/components/select';
	import Switch from '@haptic/ui/components/switch/switch.svelte';

	let autoSave = true;
	let selectedTrashLocation = { value: 'system', label: 'System trash' };
</script>

<div class="space-y-5">
	<div class="space-y-1">
		<Label class="text-base">Auto save</Label>
		<p class="text-muted-foreground text-xs">Automatically save your notes</p>
		<div class="flex items center gap-2 pt-2">
			<Switch bind:checked={autoSave} />
		</div>
	</div>

	<div class="space-y-1">
		<Label class="text-base">Deleted files location</Label>
		<p class="text-muted-foreground text-xs">Where to move deleted files to</p>
		<div class="flex items center gap-2 pt-2">
			<Select.Root bind:selected={selectedTrashLocation}>
				<Select.Trigger class="w-44">
					<Select.Value class="text-sm text-foreground/85"
						>{selectedTrashLocation.label}</Select.Value
					>
				</Select.Trigger>
				<Select.Content>
					<Select.Item value="system">System trash</Select.Item>
					<Select.Item value="trash">Haptic trash</Select.Item>
					<Select.Item value="delete">Permanently delete</Select.Item>
				</Select.Content>
			</Select.Root>
		</div>
	</div>

	<div class="space-y-1">
		<Label class="text-base">Hidden files</Label>
		<p class="text-muted-foreground text-xs">Exclude files or extensions from the notes view</p>
		<div class="flex items-center gap-2 pt-2">
			<Button
				variant="default"
				size="sm"
				class="text-primary-foreground/85 hover:text-primary-foreground text-sm font-normal"
				scale="sm"
			>
				Add
			</Button>
		</div>
	</div>
</div>
