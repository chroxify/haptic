<script lang="ts">
	import { Button } from '@haptic/ui/components/button';
	import Label from '@haptic/ui/components/label/label.svelte';
	import * as Select from '@haptic/ui/components/select';
	import Switch from '@haptic/ui/components/switch/switch.svelte';

	let autoSync = false;
	let autoBackup = false;
	let selectedSyncInterval = { value: '5m', label: '5 minutes' };
	let selectedBackupInterval = { value: '1w', label: '1 week' };
</script>

<div class="space-y-5">
	<div class="space-y-1">
		<Label class="text-base">Auto sync</Label>
		<p class="text-muted-foreground text-xs">Automatically sync your notes</p>
		<div class="flex items center gap-2 pt-2">
			<Switch bind:checked={autoSync} />
		</div>
	</div>

	<div class="space-y-1">
		<Label class="text-base">Sync interval</Label>
		<p class="text-muted-foreground text-xs">How often to sync your notes</p>
		<div class="flex items-center gap-2 pt-2">
			<Select.Root bind:selected={selectedSyncInterval}>
				<Select.Trigger class="w-32">
					<Select.Value class="text-sm text-foreground/85"
						>{selectedSyncInterval.label}</Select.Value
					>
				</Select.Trigger>
				<Select.Content>
					<Select.Item value="5m">5 minutes</Select.Item>
					<Select.Item value="10m">10 minutes</Select.Item>
					<Select.Item value="15m">15 minutes</Select.Item>
					<Select.Item value="30m">30 minutes</Select.Item>
					<Select.Item value="1h">1 hour</Select.Item>
					<Select.Item value="2h">2 hours</Select.Item>
					<Select.Item value="4h">4 hours</Select.Item>
					<Select.Item value="6h">6 hours</Select.Item>
					<Select.Item value="12h">12 hours</Select.Item>
					<Select.Item value="24h">24 hours</Select.Item>
				</Select.Content>
			</Select.Root>
		</div>
	</div>

	<div class="space-y-1">
		<Label class="text-base">Backups</Label>
		<p class="text-muted-foreground text-xs">Wheter or not to create scheduled backups</p>
		<div class="flex items center gap-2 pt-2">
			<Switch bind:checked={autoBackup} />
		</div>
	</div>

	<div class="space-y-1">
		<Label class="text-base">Backup interval</Label>
		<p class="text-muted-foreground text-xs">How often to create backups of your notes</p>
		<div class="flex items-center gap-2 pt-2">
			<Select.Root bind:selected={selectedBackupInterval}>
				<Select.Trigger class="w-32">
					<Select.Value class="text-sm text-foreground/85"
						>{selectedBackupInterval.label}</Select.Value
					>
				</Select.Trigger>
				<Select.Content>
					<Select.Item value="1w">1 week</Select.Item>
					<Select.Item value="2w">2 weeks</Select.Item>
					<Select.Item value="1m">1 month</Select.Item>
				</Select.Content>
			</Select.Root>

			<Button
				variant="default"
				size="sm"
				class="text-primary-foreground/85 hover:text-primary-foreground text-sm font-normal"
				scale="sm"
			>
				Backup now
			</Button>
		</div>
	</div>
</div>
