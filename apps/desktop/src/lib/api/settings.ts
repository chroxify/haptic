import { BASEAPPSETTINGS, BASECOLLECTIONSETTINGS } from '@/constants';
import { collection, appSettings, collectionSettings } from '@/store';
import { BaseDirectory, readTextFile, writeTextFile } from '@tauri-apps/api/fs';
import { get } from 'svelte/store';

export const loadSettings = async (loadApp: boolean, loadCollection: boolean) => {
	if (loadApp) {
		const appSettingsPath = 'settings.json';
		const appSettingsText = await readTextFile(appSettingsPath, {
			dir: BaseDirectory.AppData
		}).catch(() => null);

		if (!appSettingsText) {
			appSettings.set(BASEAPPSETTINGS);
			setSettings(true, false);
			console.log('No app settings found, creating new settings file');
		} else {
			appSettings.set(JSON.parse(appSettingsText));
			console.log('App settings loaded:', JSON.parse(appSettingsText));
		}
	}

	if (loadCollection) {
		const collectionSettingsPath = `${get(collection)}/.haptic/settings.json`;
		const collectionSettingsText = await readTextFile(collectionSettingsPath).catch(() => null);

		if (!collectionSettingsText) {
			collectionSettings.set(BASECOLLECTIONSETTINGS);
			setSettings(false, true);
			console.log('No collection settings found, creating new settings file');
		} else {
			collectionSettings.set(JSON.parse(collectionSettingsText));
			console.log('Collection settings loaded');
		}
	}
};

export const setSettings = async (setApp: boolean, setCollection: boolean) => {
	if (setApp) {
		const appSettingsPath = 'settings.json';
		const appSettingsText = JSON.stringify(get(appSettings));
		await writeTextFile(appSettingsPath, appSettingsText, {
			dir: BaseDirectory.AppData
		});
	}

	if (setCollection) {
		console.log('Setting collection settings');
		const collectionSettingsPath = `${get(collection)}/.haptic/settings.json`;
		const collectionSettingsText = JSON.stringify(get(collectionSettings));
		await writeTextFile(collectionSettingsPath, collectionSettingsText);
	}
};
