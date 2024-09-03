import { createClient } from '@vercel/edge-config';
import type { RequestHandler } from './$types';

type Target = 'linux' | 'windows' | 'darwin';
type Arch = 'x86_64' | 'i686' | 'aarch64' | 'armv7';

export const GET: RequestHandler = async ({ url }) => {
	// Params
	const target = url.searchParams.get('target') as Target | undefined;
	const arch = url.searchParams.get('arch') as Arch | undefined;

	// Validate target and arch
	if (!target || !arch) {
		return new Response(
			JSON.stringify({
				error: 'Missing required parameters. Please provide target and arch.'
			}),
			{
				status: 400,
				headers: { 'Content-Type': 'application/json' }
			}
		);
	}

	// Validate target
	if (!['linux', 'windows', 'darwin'].includes(target)) {
		return new Response(
			JSON.stringify({
				error: 'Invalid target. Must be linux, windows, or darwin.'
			}),
			{
				status: 400,
				headers: { 'Content-Type': 'application/json' }
			}
		);
	}

	// Validate arch
	if (!['x86_64', 'i686', 'aarch64', 'armv7'].includes(arch)) {
		return new Response(
			JSON.stringify({
				error: 'Invalid arch. Must be x86_64, i686, aarch64, or armv7.'
			}),
			{
				status: 400,
				headers: { 'Content-Type': 'application/json' }
			}
		);
	}

	// Get latest version info from Edge Config
	const configClient = createClient(import.meta.env.VITE_EDGE_CONFIG);
	const edgeConfig = (await configClient.getAll()) as { latest_version: string };

	const version = edgeConfig.latest_version.replace('v', '');
	const baseUrl = `https://github.com/chroxify/haptic/releases/download/${edgeConfig.latest_version}`;

	const platforms: Record<string, string> = {
		'darwin-x86_64': `${baseUrl}/Haptic_${version}_x64.dmg`,
		'darwin-aarch64': `${baseUrl}/Haptic_${version}_aarch64.dmg`
		//? Not yet supported
		// 'linux-x86_64': `${baseUrl}/Haptic_${version}_amd64.AppImage.tar.gz`,
		// 'windows-x86_64': `${baseUrl}/Haptic_${version}_x64-setup.nsis.zip`
	};

	const downloadUrl = platforms[`${target}-${arch}`];

	if (!downloadUrl) {
		return new Response(
			JSON.stringify({
				error: 'No download available for the specified target and architecture.'
			}),
			{
				status: 404,
				headers: { 'Content-Type': 'application/json' }
			}
		);
	}

	// Redirect to the download URL
	return new Response(null, {
		status: 302,
		headers: {
			Location: downloadUrl
		}
	});
};
