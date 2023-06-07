import { join } from 'https://deno.land/std@0.167.0/path/mod.ts';

import { VERSION } from '../version.ts';

if (!VERSION) {
  console.error(
    `[%cERROR%c] Incorrect version. %cExpected%c format "v*.*.*", %creceived%c "${VERSION}"`,
    'color: red',
    'color: inherit',
    'color: green',
    'color: inherit',
    'color: red',
    'color: inherit',
  );
  Deno.exit(1);
}

enum Platform {
  DARWIN = 'darwin',
  LINUX = 'linux',
  WINDOWS = 'windows',
}

enum Arch {
  AMD_64 = 'amd64',
  ARM_64 = 'arm64',
}

interface Target {
  platform: Platform;
  arch: Arch;
}

const targets: Target[] = [
  {
    platform: Platform.DARWIN,
    arch: Arch.AMD_64,
  },
  {
    platform: Platform.DARWIN,
    arch: Arch.ARM_64,
  },
  {
    platform: Platform.LINUX,
    arch: Arch.AMD_64,
  },
  {
    platform: Platform.WINDOWS,
    arch: Arch.AMD_64,
  },
];

type DenoSupportedTargets =
  | `${Platform.LINUX}-${Arch.AMD_64}`
  | `${Platform.WINDOWS}-${Arch.AMD_64}`
  | `${Platform.DARWIN}-${Arch.AMD_64}`
  | `${Platform.DARWIN}-${Arch.ARM_64}`;

const denoSupportedTargets: {
  [key in DenoSupportedTargets as string]: string;
} = {
  'linux-amd64': 'x86_64-unknown-linux-gnu',
  'windows-amd64': 'x86_64-pc-windows-msvc',
  'darwin-amd64': 'x86_64-apple-darwin',
  'darwin-arm64': 'aarch64-apple-darwin',
};

const outDir = 'dist';

for (const { platform, arch } of targets) {
  const denoSupportedTarget = denoSupportedTargets[`${platform}-${arch}`];

  if (!denoSupportedTarget) {
    console.warn(
      `[%cWARN%c] Deno does not support compiling to "${platform}-${arch}" systems. Skipping.`,
      'color: orange',
      'color: inherit',
    );
    continue;
  }

  const filename = `gh-contribution-mate_v${VERSION}_${platform}-${arch}`;

  const cmd = new Deno.Command('deno', {
    args: [
      'compile',
      '--allow-run=gh,git',
      '--allow-read',
      '--allow-write',
      `--allow-env=${
        platform === Platform.WINDOWS ? 'APPDATA' : 'XDG_CONFIG_HOME,HOME'
      }}`,
      '-o',
      join(outDir, filename),
      '--target',
      denoSupportedTarget,
      'src/main.ts',
    ],
  });

  const cmdOutput = await cmd.output();

  if (cmdOutput.code !== 0) {
    console.error(new TextDecoder().decode(cmdOutput.stderr));
    Deno.exit(cmdOutput.code);
  }
}
