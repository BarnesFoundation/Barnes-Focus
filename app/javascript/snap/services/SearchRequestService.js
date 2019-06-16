
import * as constants from '../components/Constants';
import axios from 'axios';

class SearchRequestService {

    /** Prepares scan data for a request and returns a requetsConfig object with { url, data, config } */
    prepareRequest(imageData, scanSeqId) {

        // Configure the request
        let token = constants.CATCHOOM_ACCESS_TOKEN;
        let url = constants.CATCHOOM_REQUEST_URL;
        let headers = { 'Content-Type': 'multipart/form-data' };

        // Set the form data
        let data = new FormData();
        data.set('token', token);
        data.set('image', imageData, 'temp_image.jpg');
        data.set('scanSeqId', scanSeqId);

        const axiosConfig = {
            method: 'post',
            headers: headers,
            url: url,
            data: data
        };

        return axiosConfig;
    }

    /** Retrieves the art information for the provided image id */
    getArtworkInformation = async (imageId) => {
        try {
            let response = await axios.get(constants.ART_WORK_INFO_URL + imageId);
            return response.data;
        }

        catch (error) {
            console.log('An error occurred while retrieving the artwork information from the server');
        }
    }

    /** Stores the search attempt in the server */
    storeSearchedResult = async (searchSuccess, formData, referenceImageUrl, esResponse, searchTime) => {

        formData.append('searchSuccess', searchSuccess);
        formData.append('referenceImageUrl', referenceImageUrl);
        formData.append('esResponse', JSON.stringify(esResponse));
        formData.append('searchTime', searchTime)

        await axios.post(constants.STORE_SEARCHED_RESULT_URL, formData);
    }

    submitBookmarksEmail = async (email) => {
        const payload = {};
        payload.email = email;
        //payload.language = localStorage.getItem(SNAP_LANGUAGE_PREFERENCE) || 'en';
        await axios.post(constants.SUBMIT_BOOKMARKS_EMAIL_URL, payload);

    }

    saveLanguagePreference = async (lang) => {
        const payload = {};
        payload.language = lang;
        await axios.post(constants.SAVE_LANGUAGE_PREFERENCE_URL, payload);
    }

    getAppTranslations = async () => {
        try {
            let response = await axios.get(constants.APP_TRANSLATIONS_URL);
            return response.data.data.translations;
        }
        catch (error) {
            console.log('An error occurred while retrieving the translations from the server');
        }
    }

    getStoryItems = async (imageId) => {
        try {
            let response = await axios.get(constants.STORIES_URL + imageId);
            return response.data;
        }

        catch (error) {
            console.log('An error occurred while retrieving the artwork information from the server');
        }
    }
}

export { SearchRequestService };