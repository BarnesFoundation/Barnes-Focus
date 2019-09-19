import * as constants from "../components/Constants";
import axios from "axios";
import { IdentifiedImagePayload, ImageSearchResponse } from '../classes/searchResponse';

class SearchRequestService {
  /** Prepares scan data for a request and returns a requetsConfig object with { url, data, config } */
  prepareRequest(imageData, scanSeqId) {
    // Configure the request
    let token = constants.CATCHOOM_ACCESS_TOKEN;
    let url = constants.CATCHOOM_REQUEST_URL;
    let headers = { "Content-Type": "multipart/form-data" };

    // Set the form data
    let data = new FormData();
    data.set("token", token);
    data.set("image", imageData, "temp_image.jpg");
    data.set("scanSeqId", scanSeqId);

    const axiosConfig = {
      method: "post",
      headers: headers,
      url: url,
      data: data
    };

    return axiosConfig;
  }

  /** Retrieves the art information for the provided image id */
  getArtworkInformation = async imageId => {
    try {
      let response = await axios.get(constants.ART_WORK_INFO_URL + imageId);
      return response.data;
    } catch (error) {
      console.log(
        "An error occurred while retrieving the artwork information from the server"
      );
    }
  };

  /** Stores the search attempt in the server */
  storeSearchedResult = async (searchResponse) => {

	const { searchSuccess, referenceImageUrl, esResponse, searchTime, data: formData } = searchResponse;

    formData.append("searchSuccess", searchSuccess);
    formData.append("referenceImageUrl", referenceImageUrl);
    formData.append("esResponse", JSON.stringify(esResponse));
    formData.append("searchTime", searchTime);

    await axios.post(constants.STORE_SEARCHED_RESULT_URL, formData);
  }

  submitBookmarksEmail = async email => {
    const payload = {};
    payload.email = email;
    //payload.language = localStorage.getItem(SNAP_LANGUAGE_PREFERENCE) || 'en';
    await axios.post(constants.SUBMIT_BOOKMARKS_EMAIL_URL, payload);
  };

  saveLanguagePreference = async lang => {
    const payload = {};
    payload.language = lang;
    await axios.post(constants.SAVE_LANGUAGE_PREFERENCE_URL, payload);
  };

  getAppTranslations = async () => {
    try {
      let response = await axios.get(constants.APP_TRANSLATIONS_URL);
      return response.data.data.translations;
    } catch (error) {
      console.log(
        "An error occurred while retrieving the translations from the server"
      );
    }
  };

  getStoryItems = async imageId => {
    try {
      let response = await axios.get(constants.STORIES_URL + imageId);
      return response.data;
    } catch (error) {
      console.log("An error occurred while retrieving story from the server");
    }
  };

  getStoriesFromEmail = async (slug, lang) => {
    try {
      let response = await axios.get(
        constants.STORIES_EMAIL_PAGE_URL + slug + "?lang=" + lang
      );
      return response.data;
    } catch (error) {
      console.log("An error occurred while retrieving story from the server");
    }
  };

  markStoryAsRead = async (imageId, storyId) => {
    try {
      let response = await axios.post(
        constants.STORIES_READ_URL + imageId + "&unique_identifier=" + storyId
      );
      return response.data;
    } catch (error) {
      console.log(
        "An error occurred while marking story as read from the server"
      );
    }
  };

	/** Submits the image search request to Catchoom and returns and ImageSearchResponse object */
	submitImageSearchRequest = async (requestConfig) => {

		try {
			const response = (await axios(requestConfig)).data;

			// Get the search time and number of results
			const searchTime = response.search_time;
			const resultsCount = response.results.length;

			// If a matching result was found, this image search was successful
			if (resultsCount > 0) { return new ImageSearchResponse(true, response, searchTime); }

			// Else, this image search was not successful
			else { return new ImageSearchResponse(false, response, searchTIme); }
		}

		catch (error) { 
			return new ImageSearchResponse(false, null, null); }
	}

	/** Closure function so that an identified item is processed only once. Returns an IdentifiedImagePayload object */
	processIdentifiedItem = (identifiedItem => {
		let executed = false;
		return async (identifiedItem) => {
			if (executed == false) {

				// We've executed this at least once
				executed = true;

				// Get the image id and reference image url
				const imageId = identifiedItem.item.name;
				const referenceImageUrl = identifiedItem.image.thumb_120;

				// Retrieve artwork information
				const esResponse = await this.getArtworkInformation(imageId);

				return new IdentifiedImagePayload(esResponse, referenceImageUrl);
			}
		}
	})();
  validteEmail = async (email) => {
    try {
      let response = await axios.post(
        constants.VALIDATE_EMAIL_URL, {'email': email}
      );
      return response.data;
    } catch (error) {
      console.log(
        "An error occurred while validating email"
      );
    }
  }
}



export { SearchRequestService };
