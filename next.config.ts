// next.config.ts
import type { NextConfig } from 'next';
import path from 'node:path';

const nextConfig: NextConfig = {
	images: {
		remotePatterns: [
			{
				protocol: 'https',
				hostname: 'carbify-node-backend-user-photos.s3.us-east-1.amazonaws.com',
			},
		],
	},

	webpack: (config) => {
		// keep your externals
		if (Array.isArray(config.externals)) {
			config.externals.push('pino-pretty', 'lokijs', 'encoding');
		}

		// ✅ Alias RN async-storage to a tiny noop module
		config.resolve.alias = {
			...config.resolve.alias,
			'@react-native-async-storage/async-storage': path.resolve(
				process.cwd(),
				'src/shims/emptyAsyncStorage.ts'
			),
		};

		return config;
	},

	// ✅ New key — experimental.turbo is deprecated
	turbopack: {
		resolveAlias: {
			'@react-native-async-storage/async-storage':
				'./src/shims/emptyAsyncStorage.ts',
		},
	},
};

export default nextConfig;
