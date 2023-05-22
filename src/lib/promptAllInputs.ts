import { Input, InputOptions } from 'cliffy';

export async function promptAllInputs(
  prompts: InputOptions[],
): Promise<string[]> {
  if (prompts.length === 0) {
    return [];
  }

  const [currentPrompt, ...remainingPrompts] = prompts;

  const result = await Input.prompt({
    ...currentPrompt,
    ...(currentPrompt.default ? { default: currentPrompt.default } : null),
  });

  const remainingResults = await promptAllInputs(remainingPrompts);

  return [result, ...remainingResults];
}
