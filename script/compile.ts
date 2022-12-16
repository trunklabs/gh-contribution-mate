import { join } from "https://deno.land/std@0.167.0/path/mod.ts";

const [version] = Deno.args;

if (!version) {
  console.error(
    `[%cERROR%c] Incorrect version. %cExpected%c format "v*.*.*", %creceived%c "${version}"`,
    "color: red",
    "color: inherit",
    "color: green",
    "color: inherit",
    "color: red",
    "color: inherit",
  );
  Deno.exit(1);
}

enum Platform {
  DARWIN = "darwin",
  LINUX = "linux",
  WINDOWS = "windows",
}

enum Arch {
  AMD_64 = "amd64",
  ARM_64 = "arm64",
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
  "linux-amd64": "x86_64-unknown-linux-gnu",
  "windows-amd64": "x86_64-pc-windows-msvc",
  "darwin-amd64": "x86_64-apple-darwin",
  "darwin-arm64": "aarch64-apple-darwin",
};

const outDir = "dist";

for (const { platform, arch } of targets) {
  const denoSupportedTarget = denoSupportedTargets[`${platform}-${arch}`];

  if (!denoSupportedTarget) {
    console.warn(
      `[%cWARN%c] Deno does not support compiling to "${platform}-${arch}" systems. Skipping.`,
      "color: orange",
      "color: inherit",
    );
    continue;
  }

  const filename = `gh-contribution-mate_${platform}-${arch}`;

  const { success, code } = await Deno.run({
    cmd: [
      "deno",
      "compile",
      "-o",
      join(outDir, filename),
      "--target",
      denoSupportedTarget,
      "src/main.ts",
    ],
  }).status();

  if (!success) {
    console.error(
      `[%cERROR%c] Compilation of "${filename}" failed, status code: ${code}`,
      "color: red",
      "color: inherit",
    );
    Deno.exit(code);
  }
}
