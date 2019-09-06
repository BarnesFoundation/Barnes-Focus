
export class SearchResponse {

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