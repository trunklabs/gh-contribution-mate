import { EOL } from 'std/fs';
import { colors } from 'cliffy';

export function ghNoReplyCheck(email: string) {
  if (email.endsWith('@users.noreply.github.com')) return;

  console.log(
    colors.yellow('\xa0!'),
    colors.yellow(
      'It looks like you a personal email address authoring commits.',
    ),
    EOL.LF,
    '\xa0',
    colors.yellow(
      'We encourage you to configure GitHub no-reply for better privacy.',
    ),
    EOL.LF,
    '\xa0',
    colors.yellow(
      'Read more: https://docs.github.com/en/account-and-profile/setting-up-and-managing-your-personal-account-on-github/managing-email-preferences/setting-your-commit-email-address',
    ),
  );
}
