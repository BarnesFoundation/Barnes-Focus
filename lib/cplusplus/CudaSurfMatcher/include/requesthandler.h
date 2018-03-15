#ifndef REQUESTHANDLER_H
#define REQUESTHANDLER_H

#include <httpserver.h>
#include <cudasurfmatcher.h>


using namespace std;

namespace Json {
    class Value;
}



class RequestHandler
{
public:
    RequestHandler(CudaSurfMatcher *matcher);
    void handleRequest(ConnectionInfo &conInfo);

private:
    CudaSurfMatcher *matcher;
    vector<string> parseURI(string uri);
    bool testURIWithPattern(vector<string> parsedURI, string p_pattern[]);
    string JsonToString(Json::Value data);
    Json::Value StringToJson(string str);
};

#endif // REQUESTHANDLER_H
