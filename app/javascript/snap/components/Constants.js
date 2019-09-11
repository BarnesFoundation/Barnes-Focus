/**
 * snap v2 constants
 * ===== START =====
 */
export const CATCHOOM_ACCESS_TOKEN = process.env.CATCHOOM_ACCESS_TOKEN;
export const CATCHOOM_REQUEST_URL = process.env.CATCHOOM_REQUEST_URL;
export const APP_VERSION = process.env.APP_VERSION;
export const UNSUPPORTED_ORIENTATION_ALERT_MESSAGE = 'This app is best viewed in Portrait mode.';
export const ART_WORK_INFO_URL = '/api/snaps/getArtworkInformation?imageId=';
export const STORIES_URL = '/api/snaps/find_stories_by_object_id?object_id=';
export const STORIES_EMAIL_PAGE_URL = '/api/stories/';
export const STORIES_READ_URL = '/api/snaps/mark_story_as_read?image_id=';
export const STORE_SEARCHED_RESULT_URL = '/api/snaps/storeSearchedResult';
export const SUBMIT_BOOKMARKS_EMAIL_URL = '/api/bookmarks';
export const SAVE_LANGUAGE_PREFERENCE_URL = '/api/bookmarks/set_language';
export const APP_TRANSLATIONS_URL = '/api/translations';
export const VALIDATE_EMAIL_URL = '/api/validateEmail';
export const KNIGHT_FOUNDATION_CREDIT_TEXT =
  'Barnes Focus was created by the Knight Center for Digital Innovation in Audience Engagement at the Barnes.';
export const GET_USER_MEDIA_ERROR_IOS =
  'This app requires camera access. Go to Settings > Safari > Camera & Microphone Access to allow, then refresh and try again.';
export const GET_USER_MEDIA_ERROR_ANDROID = `This app requires camera access. Go to \u22ee > Settings > Site Settings > Camera. Tap on "barnesfoc.us", then hit Reset and try again.`;
/**
 * snap v2 constants
 * ===== END =======
 */
export const SNAP_LANGUAGE_PREFERENCE = 'barnes.snap.pref.lang';
export const SNAP_USER_EMAIL = 'barnes.snap.pref.email';
export const SNAP_ATTEMPTS = 'barnes.snap.pref.attempts';
export const SNAP_LANGUAGE_TRANSLATION = 'barnes.snap.pref.lang.transl';

export const SOCIAL_MEDIA_FACEBOOK = 'facebook';
export const SOCIAL_MEDIA_TWITTER = 'twitter';
export const SOCIAL_MEDIA_GOOGLE = 'google';
export const SOCIAL_MEDIA_INSTAGRAM = 'instagram';

export const SNAP_LAST_TIMESTAMP = 'barnes.snap.timestamp';
export const SNAP_COUNT_RESET_INTERVAL = 43200000;
export const SNAP_APP_RESET_INTERVAL = 86400000;

export const TOP_OFFSET = 504 / 563;
export const VIEWPORT_HEIGHT = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
export const LANGUAGE_EN = 'En';

export const SCROLL_DIR = {
  DOWN: 'DOWN',
  UP: 'UP'
};

export const GA_EVENT_CATEGORY = {
  SNAP: 'snap',
  SOCIAL: 'social',
  CAMERA: 'camera'
};

export const GA_EVENT_ACTION = {
  TAKE_PHOTO: 'take_snap',
  SNAP_SUCCESS: 'snap_success',
  SNAP_FAILURE: 'snap_failure',
  BOOKMARK: 'bookmark_art',
  SOCIAL_SHARE_NAVIGATOR: 'share_navigator',
  SOCIAL_SHARE_FB: 'share_fb',
  SOCIAL_SHARE_TWT: 'share_twt',
  DEVICE_INFO: 'device_info',
  SCAN: 'scanner',
  CAMERA_PERMISSION: 'camera_permission'
};

export const GA_EVENT_LABEL = {
  SNAP_BUTTON: 'take a photo',
  SNAP_SUCCESS: 'match found',
  SNAP_FAILURE: 'match not found',
  BOOKMARK: 'bookmark a work of art',
  SOCIAL_SHARE_NAVIGATOR: 'android navigator share (multiple platforms)',
  SOCIAL_SHARE_FB: 'ios share via facebook',
  SOCIAL_SHARE_TWT: 'ios share via twitter',
  SCANNER_MOUNT_FAILURE: 'scanner load failed',
  PERMISSION_GRANTED: 'camera permission granted'
};
