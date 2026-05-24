# @fynqo/iban-nl

Focused, fast Dutch IBAN validator and formatter.

- Validates the structural layout (`NLkk BBBB cccccccccc`)
- Validates the ISO 13616 mod-97 checksum
- Looks up Dutch bank names from the 4-letter bank code
- Zero runtime dependencies, ~200 lines of TypeScript

## Install

```bash
npm install @fynqo/iban-nl
```

## Usage

```ts
import { isValid, parse, format } from '@fynqo/iban-nl';

isValid('NL91 ABNA 0417 1643 00'); // true

parse('NL91ABNA0417164300');
// {
//   iban: 'NL91ABNA0417164300',
//   formatted: 'NL91 ABNA 0417 1643 00',
//   countryCode: 'NL',
//   checkDigits: '91',
//   bankCode: 'ABNA',
//   bankName: 'ABN AMRO',
//   accountNumber: '0417164300',
// }

format('nl91abna0417164300'); // 'NL91 ABNA 0417 1643 00'
```

## Why a Dutch-only package?

Generic IBAN libraries support 70+ countries and bring kilobytes of metadata
you don't need if you only operate in the Netherlands. `@fynqo/iban-nl` keeps
the bundle small and the API tight — useful for SEPA-direct-debit forms,
PSD2 onboarding flows, and bank account verification.

## Background

If you're new to PSD2, Open Banking, and how Dutch banks expose payment data,
see the explainer at
[fynqo.app/feiten/wat-is-psd2-open-banking](https://fynqo.app/feiten/wat-is-psd2-open-banking).

## License

MIT — see [LICENSE](./LICENSE).

## About

Maintained by [Fynqo](https://fynqo.app) — een Nederlands platform voor
schuldhulp, budgetcoaching en financieel inzicht.

- Website: <https://fynqo.app>
- Contact: <info@fynqo.app>
- Source: <https://github.com/fynqo/iban-nl>
