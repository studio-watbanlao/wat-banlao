import { findThaiBankByName, getThaiBank } from 'src/constants/thai-banks';
import type { TempleBranding } from 'src/types/temple';

export type DonationAccount = {
  bankCode: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
  qrCodeUrl: string;
  bankLogoUrl: string;
};

export const DEFAULT_DONATION_ACCOUNT: DonationAccount = {
  bankCode: 'ktb',
  bankName: 'ธนาคารกรุงไทย',
  accountNumber: '423-0-71936-1',
  accountName: 'วัดบ้านเหล่า ( WAT BANLAO )',
  qrCodeUrl: '/assets/images/qr-code.png',
  bankLogoUrl: '/assets/images/banks/KTB.png',
};

const EMPTY_DONATION_ACCOUNT: DonationAccount = {
  bankCode: '',
  bankName: '',
  accountNumber: '',
  accountName: '',
  qrCodeUrl: '',
  bankLogoUrl: '',
};

const text = (value: unknown) => (typeof value === 'string' ? value.trim() : '');

export const getDonationAccount = (
  branding?: Pick<TempleBranding, 'contact'>,
  templeSlug?: string
): DonationAccount => {
  const donation = branding?.contact?.donation;
  const value =
    donation && typeof donation === 'object' ? (donation as Record<string, unknown>) : {};

  const fallback = templeSlug === 'wat-banlao' ? DEFAULT_DONATION_ACCOUNT : EMPTY_DONATION_ACCOUNT;
  const selectedBank =
    getThaiBank(text(value.bankCode)) || findThaiBankByName(text(value.bankName));

  return {
    bankCode: selectedBank?.code || fallback.bankCode,
    bankName: selectedBank?.name || text(value.bankName) || fallback.bankName,
    accountNumber: text(value.accountNumber) || fallback.accountNumber,
    accountName: text(value.accountName) || fallback.accountName,
    qrCodeUrl: text(value.qrCodeUrl) || fallback.qrCodeUrl,
    bankLogoUrl: selectedBank?.logoUrl || text(value.bankLogoUrl) || fallback.bankLogoUrl,
  };
};

export const hasDonationAccount = (account: DonationAccount) =>
  Boolean(account.bankName && account.accountNumber && account.accountName);
