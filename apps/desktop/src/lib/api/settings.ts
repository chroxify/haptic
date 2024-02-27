import { collection, appSettings, collectionSettings } from '@/store';
import type { AppSettingsParams, CollectionSettingsParams } from '@/types';
import { BaseDirectory, readTextFile, writeTextFile } from '@tauri-apps/api/fs';
import { get } from 'svelte/store';

export const loadSettings = async (loadApp: boolean, loadCollection: boolean) => {
	if (loadApp) {
		const appSettingsPath = 'settings.json';
		const appSettingsText = await readTextFile(appSettingsPath, {
			dir: BaseDirectory.AppData
		}).catch(() => null);

		if (!appSettingsText) {
			setSettings('app');
		} else {
			appSettings.set(JSON.parse(appSettingsText));
		}
	}

	if (loadCollection) {
		const collectionSettingsPath = `${get(collection)}/.haptic/settings.json`;
		const collectionSettingsText = await readTextFile(collectionSettingsPath).catch(() => null);
		if (!collectionSettingsText) {
			setSettings('collection');
		} else {
			collectionSettings.set(JSON.parse(collectionSettingsText));
		}
	}
};

export const setSettings = async (
	settingsType: 'app' | 'collection',
	value?: AppSettingsParams | CollectionSettingsParams
) => {
	if (settingsType === 'app') {
		const appSettingsPath = 'settings.json';
		const appSettingsText = JSON.stringify(value ?? get(appSettings));
		appSettings.set((value ?? get(appSettings)) as AppSettingsParams);
		await writeTextFile(appSettingsPath, appSettingsText, {
			dir: BaseDirectory.AppData
		});
	}

	if (settingsType === 'collection') {
		const collectionSettingsPath = `${get(collection)}/.haptic/settings.json`;
		const collectionSettingsText = JSON.stringify(value ?? get(collectionSettings));
		collectionSettings.set((value ?? get(collectionSettings)) as CollectionSettingsParams);
		await writeTextFile(collectionSettingsPath, collectionSettingsText);
	}
};
