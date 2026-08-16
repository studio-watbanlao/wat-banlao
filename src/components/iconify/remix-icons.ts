import type { IconifyProps } from './types';

// Keep icon selection in one place so every UI icon is rendered from Remix Icon.
// Legacy names are supported while feature code is migrated, including values
// coming from configuration objects and API-shaped data.
const REMIX_ICON_MAP: Record<string, string> = {
  'ant-design:instagram-filled': 'ri:instagram-fill',
  'carbon:center-to-fit': 'ri:fullscreen-exit-line',
  'carbon:chevron-left': 'ri:arrow-left-s-line',
  'carbon:chevron-right': 'ri:arrow-right-s-line',
  'carbon:close': 'ri:close-line',
  'carbon:fit-to-screen': 'ri:fullscreen-line',
  'carbon:pause': 'ri:pause-fill',
  'carbon:play': 'ri:play-fill',
  'carbon:zoom-in': 'ri:zoom-in-line',
  'carbon:zoom-out': 'ri:zoom-out-line',
  'eva:alert-triangle-fill': 'ri:alert-fill',
  'eva:arrow-circle-down-fill': 'ri:arrow-down-circle-fill',
  'eva:arrow-forward-fill': 'ri:arrow-right-line',
  'eva:arrow-ios-back-fill': 'ri:arrow-left-s-line',
  'eva:arrow-ios-downward-fill': 'ri:arrow-down-s-line',
  'eva:arrow-ios-forward-fill': 'ri:arrow-right-s-line',
  'eva:arrow-ios-upward-fill': 'ri:arrow-up-s-line',
  'eva:checkmark-circle-2-fill': 'ri:checkbox-circle-fill',
  'eva:checkmark-fill': 'ri:check-line',
  'eva:chevron-down-fill': 'ri:arrow-down-s-line',
  'eva:cloud-download-fill': 'ri:download-cloud-2-fill',
  'eva:cloud-upload-fill': 'ri:upload-cloud-2-fill',
  'eva:done-all-fill': 'ri:check-double-line',
  'eva:external-link-fill': 'ri:external-link-line',
  'eva:facebook-fill': 'ri:facebook-fill',
  'eva:google-fill': 'ri:google-fill',
  'eva:info-fill': 'ri:information-fill',
  'eva:info-outline': 'ri:information-line',
  'eva:linkedin-fill': 'ri:linkedin-fill',
  'eva:minus-fill': 'ri:subtract-line',
  'eva:more-horizontal-fill': 'ri:more-line',
  'eva:more-vertical-fill': 'ri:more-2-fill',
  'eva:search-fill': 'ri:search-line',
  'eva:twitter-fill': 'ri:twitter-fill',
  'eva:upload-fill': 'ri:upload-2-line',
  'jam:medical': 'ri:medicine-bottle-line',
  'logos:tiktok-icon': 'ri:tiktok-fill',
  'mdi:heart-pulse': 'ri:heart-pulse-line',
  'mingcute:add-line': 'ri:add-line',
  'mingcute:close-line': 'ri:close-line',
  'mingcute:quote-left-fill': 'ri:double-quotes-l',
  'solar:atom-bold-duotone': 'ri:flower-fill',
  'solar:bell-bing-bold-duotone': 'ri:notification-3-fill',
  'solar:calendar-bold-duotone': 'ri:calendar-fill',
  'solar:calendar-mark-bold-duotone': 'ri:calendar-check-fill',
  'solar:camera-add-bold': 'ri:camera-lens-fill',
  'solar:cart-plus-bold': 'ri:shopping-cart-2-fill',
  'solar:clock-circle-outline': 'ri:time-line',
  'solar:close-circle-bold': 'ri:close-circle-fill',
  'solar:danger-bold': 'ri:error-warning-fill',
  'solar:document-text-bold-duotone': 'ri:file-text-fill',
  'solar:eye-bold': 'ri:eye-fill',
  'solar:eye-closed-bold': 'ri:eye-close-fill',
  'solar:gallery-add-bold': 'ri:image-add-fill',
  'solar:gallery-wide-bold-duotone': 'ri:gallery-fill',
  'solar:home-2-bold-duotone': 'ri:home-5-fill',
  'solar:inbox-line-bold-duotone': 'ri:inbox-2-fill',
  'solar:letter-linear': 'ri:mail-line',
  'solar:lock-password-linear': 'ri:lock-password-line',
  'solar:pen-bold': 'ri:edit-fill',
  'solar:play-broken': 'ri:play-circle-line',
  'solar:printer-minimalistic-bold': 'ri:printer-fill',
  'solar:restart-bold': 'ri:restart-line',
  'solar:settings-bold-duotone': 'ri:settings-3-fill',
  'solar:share-bold': 'ri:share-fill',
  'solar:trash-bin-trash-bold': 'ri:delete-bin-6-fill',
  'solar:users-group-rounded-bold-duotone': 'ri:group-fill',
  'svg-spinners:12-dots-scale-rotate': 'ri:loader-4-line',
};

export function toRemixIcon(icon: IconifyProps): IconifyProps {
  // Country flags communicate locale rather than an interface action, so they
  // retain their flag artwork instead of being replaced by a generic flag.
  if (typeof icon !== 'string' || icon.startsWith('ri:') || icon.startsWith('flagpack:')) {
    return icon;
  }

  return REMIX_ICON_MAP[icon] || 'ri:question-line';
}
