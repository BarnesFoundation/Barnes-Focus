
import * as constants from '../components/Constants';
import axios from 'axios';

class SearchRequestService {

    /** Prepares scan data for a request and returns a requetsConfig object with { url, data, config } */
    prepareRequest(imageData, scanSeqId) {

        // Configure the request
        let token = constants.CATCHOOM_ACCESS_TOKEN;
        let url = constants.CATCHOOM_REQUEST_URL;
        let headers = { 'Content-Type': 'multipart/form-data' };

        // Append the form data
        let data = new FormData();
        data.append('token', token);
        data.append('image', imageData, 'temp_image.jpg');
        data.append('scanSeqId', scanSeqId);

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
}

export { SearchRequestService };