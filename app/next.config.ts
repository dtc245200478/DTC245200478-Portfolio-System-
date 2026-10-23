import type { NextConfig } from 'next';
const config: NextConfig = { output: 'standalone', poweredByHeader: false, experimental: { cpus: 2 }, serverExternalPackages: ['mysql2','prom-client','sharp'] };
export default config;
