// eslint-disable-next-line @typescript-eslint/no-var-requires
require('esbuild').buildSync({
  entryPoints: ['scripts/cli.ts'],
  bundle: true,
  platform: 'node',
  target: ['node18'],
  outdir: 'build',
})
