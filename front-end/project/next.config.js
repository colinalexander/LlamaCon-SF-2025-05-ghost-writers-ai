/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
  experimental: {
    serverComponentsExternalPackages: ['@libsql/client']
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Alias libsql packages to false on client
      config.resolve.alias = {
        ...config.resolve.alias,
        '@libsql/client': false,
        '@libsql/libsql-wasm-experimental': false,
      };

      // Use null-loader for libsql packages and .mjs files
      config.module.rules.push({
        test: /\.mjs$/,
        include: /node_modules\/@libsql/,
        type: 'javascript/auto',
        use: 'null-loader',
      });
      config.module.rules.push({
        test: /@libsql\/(client|libsql-wasm-experimental)(\/|$)/,
        use: 'null-loader',
      });

      // Common fallbacks for node built-ins
      config.resolve.fallback = {
        fs: false,
        path: false,
        crypto: false,
        stream: false,
        buffer: false,
        url: false,
        util: false,
        zlib: false,
        net: false,
        tls: false,
        assert: false,
        child_process: false,
        process: false,
        sqlite3: false,
        sqlite: false,
      };
    }

    config.cache = false;
    return config;
  }
};

module.exports = nextConfig;