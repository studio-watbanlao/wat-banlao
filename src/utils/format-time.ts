import { format, formatDistanceToNow, getTime } from 'date-fns';
import { th } from 'date-fns/locale';

// ----------------------------------------------------------------------

type InputValue = Date | string | number | null | undefined;

export function fDate(date: InputValue, newFormat?: string) {
  const fm = newFormat || 'dd MMM yyyy';

  return date ? format(new Date(date), fm) : '';
}

export function fDateTime(date: InputValue, newFormat?: string) {
  const fm = newFormat || 'dd MMM yyyy p';

  return date ? format(new Date(date), fm) : '';
}

export function fDateTimeTH(date: InputValue, newFormat?: string) {
  if (!date) return '';

  const d = new Date(date);
  const year = d.getFullYear() + 543;

  const fm = newFormat || 'dd MMM';

  return `${format(d, fm, { locale: th })} ${year}`;
}

export function fTimestamp(date: InputValue) {
  return date ? getTime(new Date(date)) : '';
}

export function fToNow(date: InputValue) {
  return date
    ? formatDistanceToNow(new Date(date), {
        addSuffix: true,
      })
    : '';
}
