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
export const STORE_SEARCHED_RESULT_URL = '/api/snaps/storeSearchedResult';
export const SUBMIT_BOOKMARKS_EMAIL_URL = '/api/bookmarks';
export const SAVE_LANGUAGE_PREFERENCE_URL = '/api/bookmarks/set_language';
export const APP_TRANSLATIONS_URL = '/api/translations';
export const KNIGHT_FOUNDATION_CREDIT_TEXT = 'Barnes Focus was created by the Knight Center for Digital Innovation in Audience Engagement at the Barnes.';
export const GET_USER_MEDIA_ERROR_IOS = 'This app requires camera access. Go to Settings > Safari > Camera & Microphone Access to allow, then refresh and try again.';
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

export const GA_EVENT_CATEGORY = {
    SNAP: 'snap',
    SOCIAL: 'social',
}

export const GA_EVENT_ACTION = {
    TAKE_PHOTO: 'take_snap',
    SNAP_SUCCESS: 'snap_success',
    SNAP_FAILURE: 'snap_failure',
    BOOKMARK: 'bookmark_art',
    SOCIAL_SHARE_NAVIGATOR: 'share_navigator',
    SOCIAL_SHARE_FB: 'share_fb',
    SOCIAL_SHARE_TWT: 'share_twt'
}

export const GA_EVENT_LABEL = {
    SNAP_BUTTON: 'take a photo',
    SNAP_SUCCESS: 'match found',
    SNAP_FAILURE: 'match not found',
    BOOKMARK: 'bookmark a work of art',
    SOCIAL_SHARE_NAVIGATOR: 'android navigator share (multiple platforms)',
    SOCIAL_SHARE_FB: 'ios share via facebook',
    SOCIAL_SHARE_TWT: 'ios share via twitter'
}
