export type ThaiBank = {
  code: string;
  name: string;
  nameEn: string;
  color: string;
  logoUrl: string;
};

const bank = (
  code: string,
  name: string,
  nameEn: string,
  color: string,
  logoCode = code
): ThaiBank => ({
  code,
  name,
  nameEn,
  color,
  logoUrl: `/assets/images/banks/${logoCode.toUpperCase()}.png`,
});

export const THAI_BANKS = [
  bank('ktb', 'ธนาคารกรุงไทย', 'Krungthai Bank', '#1BA5E1'),
  bank('kbank', 'ธนาคารกสิกรไทย', 'Kasikornbank', '#138F2D'),
  bank('scb', 'ธนาคารไทยพาณิชย์', 'Siam Commercial Bank', '#4E2E7F'),
  bank('bbl', 'ธนาคารกรุงเทพ', 'Bangkok Bank', '#1E4598'),
  bank('bay', 'ธนาคารกรุงศรีอยุธยา', 'Krungsri Bank', '#F6C342'),
  bank('ttb', 'ธนาคารทหารไทยธนชาต', 'TMBThanachart Bank', '#0A57A7'),
  bank('gsb', 'ธนาคารออมสิน', 'Government Savings Bank', '#EB198D'),
  bank('ghb', 'ธนาคารอาคารสงเคราะห์', 'Government Housing Bank', '#F57D23'),
  bank('baac', 'ธนาคารเพื่อการเกษตรและสหกรณ์การเกษตร', 'BAAC', '#4B9B1D'),
  bank('cimb', 'ธนาคารซีไอเอ็มบี ไทย', 'CIMB Thai Bank', '#7E2F36'),
  bank('uob', 'ธนาคารยูโอบี', 'United Overseas Bank', '#0B3979'),
  bank('kk', 'ธนาคารเกียรตินาคินภัทร', 'Kiatnakin Phatra Bank', '#199CC5', 'KKP'),
  bank('tisco', 'ธนาคารทิสโก้', 'Tisco Bank', '#12549F'),
  bank('lhb', 'ธนาคารแลนด์ แอนด์ เฮ้าส์', 'Land and Houses Bank', '#6D6E71'),
  bank('ibank', 'ธนาคารอิสลามแห่งประเทศไทย', 'Islamic Bank of Thailand', '#184615'),
  bank('icbc', 'ธนาคารไอซีบีซี (ไทย)', 'ICBC Thai', '#C50F1C'),
  bank('tcrb', 'ธนาคารไทยเครดิต', 'Thai Credit Bank', '#0A4AB3'),
] as const;

export const getThaiBank = (code?: string | null) => THAI_BANKS.find((item) => item.code === code);

export const findThaiBankByName = (name?: string | null) => {
  const normalized = name?.replace(/\s/g, '').toLowerCase() || '';
  if (!normalized) return undefined;
  return THAI_BANKS.find((item) => {
    const thai = item.name.replace(/\s/g, '').toLowerCase();
    const english = item.nameEn.replace(/\s/g, '').toLowerCase();
    return (
      thai === normalized ||
      english === normalized ||
      thai.includes(normalized) ||
      normalized.includes(thai)
    );
  });
};
