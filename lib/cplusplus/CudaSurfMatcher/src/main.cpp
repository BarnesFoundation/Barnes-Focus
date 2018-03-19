#include <iostream>
#include <signal.h>
#include <httpserver.h>
#include <requesthandler.h>
#include <cudasurfmatcher.h>


using namespace std;

HTTPServer *s;

void intHandler(int signum) {
    (void)signum;
    s->stop();
}


void printUsage()
{
    cout << "Usage :" << endl
         << "./CudaSurfMatcher [-p portNumber]" << endl;
}


int main(int argc, char** argv)
{
    cout << "CudaSurfMatcher v0.0.1" << endl;

    if (argc < 2)
    {
        printUsage();
        return 1;
    }

#define EXIT_IF_LAST_ARGUMENT() \
    if (i == argc - 1)          \
    {                           \
        printUsage();           \
        return 1;    \
    }

    unsigned i_port = 4212;
    bool https = false;

    int i = 1;
    while (i < argc)
    {
        if (string(argv[i]) == "-p")
        {
            EXIT_IF_LAST_ARGUMENT()
            i_port = atoi(argv[++i]);
        }
        else if (string(argv[i]) == "--https")
        {
            https = true;
        }
        else
        {
            printUsage();
            return 1;
        }
        ++i;
    }

    CudaSurfMatcher *matcher = new CudaSurfMatcher();
    // matcher->loadAssets();
    RequestHandler *rh = new RequestHandler(matcher);
    s = new HTTPServer(rh, i_port, https);

    signal(SIGHUP, intHandler);
    signal(SIGINT, intHandler);

    s->run();

    cout << "Terminating CudaSurfMatcher." << endl;

    delete s;
    delete (CudaSurfMatcher *)matcher;
    delete (RequestHandler *)rh;

    return 0;
}