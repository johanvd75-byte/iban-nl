/**
 * @fynqo/iban-nl
 * Focused Dutch IBAN validator.
 *
 * NL IBAN spec:
 *   - Length: 18 characters
 *   - Layout: NL kk BBBB cccccccccc
 *     - NL: country code
 *     - kk: 2-digit check digits (mod-97)
 *     - BBBB: 4 alphabetic bank code
 *     - cccccccccc: 10 numeric account number
 *
 * See: https://www.betaalvereniging.nl/ for the canonical NL bank-code list.
 *
 * Maintained by Fynqo (https://fynqo.app).
 */

export interface IbanInfo {
  iban: string;          // Cleaned, uppercase IBAN
  formatted: string;     // Pretty-formatted in 4-char blocks
  countryCode: string;   // "NL"
  checkDigits: string;   // e.g. "91"
  bankCode: string;      // e.g. "ABNA"
  bankName: string | null;
  accountNumber: string; // 10 digits
}

export class IbanError extends Error {
  constructor(message: string, public readonly code: string) {
    super(message);
    this.name = 'IbanError';
  }
}

/**
 * Known Dutch bank codes.
 * Source: Betaalvereniging Nederland (BIC/BankCode register).
 * Kept intentionally short — covers the main retail banks.
 */
export const NL_BANK_CODES: Readonly<Record<string, string>> = Object.freeze({
  ABNA: 'ABN AMRO',
  AEGO: 'Aegon Bank',
  ANDL: 'Anadolubank Nederland',
  ARBN: 'Achmea Bank',
  ARSN: 'Argenta Spaarbank',
  ASNB: 'ASN Bank',
  ATBA: 'Amsterdam Trade Bank',
  BBRU: 'BNP Paribas',
  BCDM: 'Banque Chaabi du Maroc',
  BCIT: 'Intesa Sanpaolo',
  BICK: 'Bank of India',
  BINK: 'BinckBank',
  BKCH: 'Bank of China',
  BKMG: 'BankGiroLoterij (BGL)',
  BLGW: 'BLG Wonen',
  BMEU: 'BMW Bank',
  BNDA: 'Bunq',
  BNGH: 'Bank Nederlandse Gemeenten',
  BNPA: 'BNP Paribas',
  BOFA: 'Bank of America',
  BOFS: 'Bank of Scotland',
  BOTK: 'MUFG Bank',
  BUNQ: 'Bunq',
  CHAS: 'JPMorgan Chase',
  CITC: 'Citco Bank',
  CITI: 'Citibank',
  COBA: 'Commerzbank',
  DEUT: 'Deutsche Bank',
  DHBN: 'Demir-Halk Bank',
  DLBK: 'Demir-Halk Bank',
  DNIB: 'NIBC Direct',
  EBUR: 'Ebury Partners',
  FBHL: 'Credit Europe Bank',
  FLOR: 'Florius',
  FRGH: 'FGH Bank',
  FVLB: 'Van Lanschot Kempen',
  GILL: 'InsingerGilissen',
  HAND: 'Svenska Handelsbanken',
  HHBA: 'Hof Hoorneman Bankiers',
  HSBC: 'HSBC Bank',
  ICBK: 'ICBC',
  INGB: 'ING Bank',
  ISBK: 'Isbank',
  KABA: 'Yapi Kredi Bank Nederland',
  KASA: 'Kasbank',
  KNAB: 'Knab',
  KOEX: 'KEB Hana Bank',
  KRED: 'KBC Bank',
  LOCY: 'LeasePlan Corporation',
  LOYD: 'Lloyds Bank',
  MHCB: 'Mizuho Bank',
  NNBA: 'Nationale-Nederlanden Bank',
  NWAB: 'Nederlandse Waterschapsbank',
  PCBC: 'China Construction Bank',
  RABO: 'Rabobank',
  RBRB: 'RegioBank',
  SNSB: 'SNS Bank',
  SOGE: 'Société Générale',
  TRIO: 'Triodos Bank',
  UGBI: 'Garanti Bank',
  VOWA: 'Volkswagen Bank',
  ZWLB: 'Zwitserleven Bank',
});

const NL_IBAN_LENGTH = 18;

/**
 * Normalize: strip whitespace, uppercase.
 */
export function normalize(input: string): string {
  return String(input || '').replace(/\s+/g, '').toUpperCase();
}

/**
 * Validate a Dutch IBAN string.
 * @returns true if the input is a structurally and checksum-valid NL IBAN.
 */
export function isValid(input: string): boolean {
  try {
    parse(input);
    return true;
  } catch {
    return false;
  }
}

/**
 * Parse and validate an NL IBAN, returning structured info.
 * @throws {IbanError} on any validation failure.
 */
export function parse(input: string): IbanInfo {
  const iban = normalize(input);

  if (!iban) {
    throw new IbanError('IBAN is empty', 'EMPTY');
  }
  if (iban.length !== NL_IBAN_LENGTH) {
    throw new IbanError(
      `NL IBAN must be ${NL_IBAN_LENGTH} characters, got ${iban.length}`,
      'LENGTH',
    );
  }
  if (!iban.startsWith('NL')) {
    throw new IbanError('Country code must be NL', 'COUNTRY');
  }
  if (!/^NL\d{2}[A-Z]{4}\d{10}$/.test(iban)) {
    throw new IbanError('IBAN structure invalid (expected NLkk BBBB cccccccccc)', 'STRUCTURE');
  }
  if (!mod97(iban)) {
    throw new IbanError('IBAN checksum failed (mod-97)', 'CHECKSUM');
  }

  const countryCode = iban.slice(0, 2);
  const checkDigits = iban.slice(2, 4);
  const bankCode = iban.slice(4, 8);
  const accountNumber = iban.slice(8);
  const bankName = NL_BANK_CODES[bankCode] ?? null;

  return {
    iban,
    formatted: format(iban),
    countryCode,
    checkDigits,
    bankCode,
    bankName,
    accountNumber,
  };
}

/**
 * Format IBAN in 4-char groups, e.g. "NL91 ABNA 0417 1643 00".
 */
export function format(input: string): string {
  const cleaned = normalize(input);
  return cleaned.match(/.{1,4}/g)?.join(' ') ?? cleaned;
}

/**
 * Look up a bank name by 4-letter bank code.
 */
export function bankNameFor(bankCode: string): string | null {
  return NL_BANK_CODES[bankCode.toUpperCase()] ?? null;
}

/**
 * IBAN mod-97 check (ISO 13616).
 * Move first 4 chars to the end, convert letters to digits (A=10..Z=35),
 * result must satisfy `n % 97 === 1`.
 */
function mod97(iban: string): boolean {
  const rearranged = iban.slice(4) + iban.slice(0, 4);
  let expanded = '';
  for (const ch of rearranged) {
    if (ch >= '0' && ch <= '9') {
      expanded += ch;
    } else if (ch >= 'A' && ch <= 'Z') {
      expanded += String(ch.charCodeAt(0) - 55); // A=10
    } else {
      return false;
    }
  }

  // BigInt-free modulo for large numeric strings.
  let remainder = 0;
  for (const c of expanded) {
    remainder = (remainder * 10 + (c.charCodeAt(0) - 48)) % 97;
  }
  return remainder === 1;
}
