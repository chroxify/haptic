<script lang="ts">
	import { Button } from '@haptic/ui/components/button';
	import Icon from '../shared/icon.svelte';
	import Label from '@haptic/ui/components/label/label.svelte';
	import Tooltip from '../shared/tooltip.svelte';
	import * as Select from '@haptic/ui/components/select';
	import { resetMode, setMode, userPrefersMode } from 'mode-watcher';
	import { cn } from '@haptic/ui/lib/utils';

	let selectedTheme = { value: 'haptic', label: 'Haptic' };
	let selectedFont = { value: 'inter', label: 'Inter' };
</script>

<div class="space-y-5">
	<div class="space-y-1">
		<Label class="text-base">Color scheme</Label>
		<p class="text-muted-foreground text-xs">Change the color scheme of the app</p>
		<div class="flex items-center gap-2 pt-2">
			<Tooltip text="System" side="bottom">
				<Button
					size="icon"
					variant="ghost"
					class={cn(
						'h-7 w-7 fill-muted-foreground hover:fill-foreground',
						$userPrefersMode === 'system' && 'bg-accent fill-foreground'
					)}
					scale="md"
					on:click={() => resetMode()}
				>
					<Icon name="monitor" class="w-[18px] h-[18px]" />
				</Button>
			</Tooltip>
			<Tooltip text="Light" side="bottom">
				<Button
					size="icon"
					variant="ghost"
					class={cn(
						'h-7 w-7 fill-muted-foreground hover:fill-foreground',
						$userPrefersMode === 'light' && 'bg-accent fill-foreground'
					)}
					scale="md"
					on:click={() => setMode('light')}
				>
					<Icon name="sun" class="w-[18px] h-[18px]" />
				</Button>
			</Tooltip>
			<Tooltip text="Dark" side="bottom">
				<Button
					size="icon"
					variant="ghost"
					class={cn(
						'h-7 w-7 fill-muted-foreground hover:fill-foreground',
						$userPrefersMode === 'dark' && 'bg-accent fill-foreground'
					)}
					scale="md"
					on:click={() => setMode('dark')}
				>
					<Icon name="moon" class="w-[18px] h-[18px]" />
				</Button>
			</Tooltip>
		</div>
	</div>

	<div class="space-y-1">
		<Label class="text-base">Theme</Label>
		<p class="text-muted-foreground text-xs">Change the theme of the app</p>
		<div class="flex items-center gap-2 pt-2">
			<Select.Root bind:selected={selectedTheme}>
				<Select.Trigger class="w-32">
					<Select.Value class="text-sm text-foreground/85">{selectedTheme.label}</Select.Value>
				</Select.Trigger>
				<Select.Content>
					<Select.Item value="haptic">Haptic</Select.Item>
				</Select.Content>
			</Select.Root>
			<Button
				variant="default"
				size="sm"
				class="text-primary-foreground/85 hover:text-primary-foreground text-sm font-normal"
				scale="sm"
			>
				Browse
			</Button>
		</div>
	</div>

	<div class="space-y-1">
		<Label class="text-base">Fonts</Label>
		<p class="text-muted-foreground text-xs">Change the interface font</p>
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
</div>
