#ifndef __APPLE__
#include <jsoncpp/json/json.h>
#else
#include <json/json.h>
#endif
#include <requesthandler.h>
#include <cudasurfmatcher.h>
#include <messages.h>

RequestHandler::RequestHandler(CudaSurfMatcher *_matcher){ 
  matcher = _matcher;
}


/**
 * @brief Parse an URI.
 * @param uri the uri string.
 * @return the vector containing all the URI element between slashes.
 */
vector<string> RequestHandler::parseURI(string uri)
{
    vector<string> ret;

    if (uri == "/" || uri[0] != '/')
        return ret;

    size_t pos1 = 1;
    size_t pos2;

    while ((pos2 = uri.find('/', pos1)) != string::npos)
    {
        ret.push_back(uri.substr(pos1, pos2 - pos1));
        pos1 = pos2 + 1;
    }

    ret.push_back(uri.substr(pos1, uri.length() - pos1));

    return ret;
}


/**
 * @brief Test that a given parsed URI corresponds to a given request pattern.
 * @param parsedURI the parsed URI.
 * @param p_pattern the request pattern.
 * @return true if there is a correspondance, else false.
 */
bool RequestHandler::testURIWithPattern(vector<string> parsedURI, string p_pattern[])
{
    unsigned i = 0;
    for (;; ++i)
    {
        if (p_pattern[i] == "")
            break;
        if (i >= parsedURI.size())
            return false;
        if (p_pattern[i] == "IDENTIFIER")
        {
            // Test we have a number here.
            if (parsedURI[i].length() == 0)
                return false;
            char* p;
            long n = strtol(parsedURI[i].c_str(), &p, 10);
            if (*p != 0)
                return false;
            if (n < 0)
                return false;
        }
        else if (p_pattern[i] != parsedURI[i])
            return false;
    }

    if (i != parsedURI.size())
        return false;

    return true;
}


/**
 * @brief RequestHandler::handlePost
 * @param uri
 * @param p_data
 * @return
 */
void RequestHandler::handleRequest(ConnectionInfo &conInfo)
{
    vector<string> parsedURI = parseURI(conInfo.url);

    string p_searchImage[] = {"index", "searcher", ""};
   
    Json::Value ret;
    conInfo.answerCode = MHD_HTTP_OK;

    if (testURIWithPattern(parsedURI, p_searchImage)
             && conInfo.connectionType == POST)
    {
        std::map<std::string, double> results;
        u_int32_t i_ret = matcher->searchImage(conInfo.uploadedData, std::ref(results));
        typedef std::function<bool(std::pair<std::string, double>, std::pair<std::string, double>)> Comparator;
        Comparator compFunctor =
            [](std::pair<std::string, double> elem1 ,std::pair<std::string, double> elem2)
            {
              return elem1.second > elem2.second;
            };
        std::set<std::pair<std::string, double>, Comparator> orderedMap(
            results.begin(), results.end(), compFunctor);
        int i = 0;
        
        Json::Value toprows = Json::Value(Json::arrayValue);
        for (std::pair<std::string, double> element : orderedMap){
          i++;
          std::cout << element.first << " :: " << element.second << std::endl;
          Json::Value row;
          row[element.first] = element.second;
          toprows.append(row);
          if(i == 10) break;  
        }
        ret["type"] = Converter::codeToString(i_ret);
        ret["results"] = toprows;
    }
    else
    {
        conInfo.answerCode = MHD_HTTP_INTERNAL_SERVER_ERROR;
        ret["type"] = Converter::codeToString(MISFORMATTED_REQUEST);
    }

    conInfo.answerString = JsonToString(ret);
}


/**
 * @brief Conver to JSON value to a string.
 * @param data the JSON value.
 * @return the converted string.
 */
string RequestHandler::JsonToString(Json::Value data)
{
    Json::FastWriter writer;
    return writer.write(data);
}


/**
 * @brief Convert a string to a JSON value.
 * @param str the string
 * @return the converted JSON value.
 */
Json::Value RequestHandler::StringToJson(string str)
{
    Json::Reader reader;
    Json::Value data;
    reader.parse(str, data);
    return data;
}
