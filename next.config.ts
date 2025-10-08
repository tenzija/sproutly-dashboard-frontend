import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
	/* config options here */
	images: {
		domains: ['carbify-node-backend-user-photos.s3.us-east-1.amazonaws.com'],
	},
	webpack: (config) => {
		config.externals.push('pino-pretty', 'lokijs', 'encoding');
		return config;
	},
};

export default nextConfig;
