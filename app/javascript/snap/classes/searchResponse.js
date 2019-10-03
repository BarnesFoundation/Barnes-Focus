

export class StorableSearch {

	searchSuccess;
	referenceImageUrl;
	esResponse;
	searchTime;
	data;

	constructor(data, searchSuccess, referenceImageUrl, esResponse, searchTime) {
		this.data = data; 
		this.searchSuccess = searchSuccess;
		this.referenceImageUrl = referenceImageUrl;
		this.esResponse = esResponse;
		this.searchTime = searchTime;
	}
}

export class ImageSearchResponse {

	searchWasSuccessful = null;
	responsePayload = null;
	searchTime = null;

	constructor(searchWasSuccessful, responsePayload, searchTime) {
		this.searchWasSuccessful = searchWasSuccessful;
		this.responsePayload = responsePayload;
		this.searchTime = searchTime;
	}
}

export class IdentifiedImagePayload {

	esResponse = null;
	referenceImageUrl = null;

	constructor(esResponse, referenceImageUrl) {
		this.esResponse = esResponse;
		this.referenceImageUrl = referenceImageUrl;
	}
}