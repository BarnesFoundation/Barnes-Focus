#ifndef CUDASURFMATCHER_H
#define CUDASURFMATCHER_H

#include <iostream>
#include <chrono>
#include <dirent.h>
#include <thread>
#include <map>
#include <set>
#include <opencv2/opencv.hpp>
#include "opencv2/cudaarithm.hpp"
#include "opencv2/core.hpp"
#include "opencv2/features2d.hpp"
#include "opencv2/highgui.hpp"
#include "opencv2/cudafeatures2d.hpp"
#include "opencv2/xfeatures2d/cuda.hpp"


class ClientConnection;

struct SearchRequest
{
    std::vector<char> imageData;
    ClientConnection *client;
    std::vector<u_int32_t> results;
};


class CudaSurfMatcher
{
  private:
    cv::cuda::SURF_CUDA surf;
    std::vector<std::string> trainingFilePaths;
    std::vector<cv::cuda::GpuMat> trainingImageDescriptorsGPU;
    std::vector<int> trainingImageNumKeyPoints;
    cv::Ptr<cv::cuda::DescriptorMatcher> matcher;
    virtual void searchForMatches(cv::cuda::GpuMat &descriptorsOriginalImageGPU, int originalImageNumKeyPoints, std::map<std::string, double> &results);
    virtual void getMatchPercentForIdx(int tr_i, cv::cuda::GpuMat &descriptorsOriginalImageGPU, int originalImageNumKeyPoints, std::map<std::string, double> &results);
public:
    CudaSurfMatcher();
    virtual void loadAssets();
    virtual u_int32_t searchImage(std::vector<char> imageData, std::map<std::string, double> &results);
};

#endif // CUDASURFMATCHER_H
