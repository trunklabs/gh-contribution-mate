import lint from 'npm:@commitlint/lint@17.4.0';
import conventionalConfig from 'npm:@commitlint/config-conventional@17.4.0';
import format from 'npm:@commitlint/format@17.4.0';

const message = await Deno.readTextFile(Deno.args[0]);

if (!message) {
  console.error(new Deno.errors.InvalidData('No commit message found'));
  Deno.exit(1);
}

const result = await lint.default(
  message,
  conventionalConfig.rules,
);

if (!result.valid) {
  console.log(format.format({ results: [result] }, { color: true }));
  Deno.exit(1);
}
