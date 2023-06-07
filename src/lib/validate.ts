import { ParseParams } from 'zod';

export function validate(
  validator: (data: unknown, params?: Partial<ParseParams>) => unknown,
) {
  return (value: unknown) => {
    try {
      validator(value);
      return;
    } catch (error) {
      return error.issues[0].message;
    }
  };
}
