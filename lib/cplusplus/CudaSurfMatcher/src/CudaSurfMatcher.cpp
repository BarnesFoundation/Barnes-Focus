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
#include <cudasurfmatcher.h>
#include <messages.h>
#include <imageloader.h>

// cv::cuda::SURF_CUDA surf;
// std::vector<std::string> trainingFilePaths;
// std::vector<cv::cuda::GpuMat> trainingImageDescriptorsGPU;
// std::vector<int> trainingImageNumKeyPoints;
// cv::Ptr<cv::cuda::DescriptorMatcher> matcher = cv::cuda::DescriptorMatcher::createBFMatcher(surf.defaultNorm());



bool hasEnding (std::string const &fullString, std::string const &ending) {
  if (fullString.length() >= ending.length()) {
      return (0 == fullString.compare (fullString.length() - ending.length(), ending.length(), ending));
  } else {
      return false;
  }
}

// void loadTrainingImage(std::string trainingImgPath) {
//   cv::Mat trainingGrayImage;
//   trainingGrayImage = cv::imread(trainingImgPath, CV_LOAD_IMAGE_GRAYSCALE);
//   if (!trainingGrayImage.data) {
//     std::cerr << "trainingImage load error" << std::endl;
//     return;
//   }
//   cv::cuda::GpuMat trainingGrayImageGPU;
//   cv::cuda::GpuMat keypointsTrImgGPU, descriptorsTrImgGPU;
//   std::cout << "trainingImage uploading" << std::endl;  
//   trainingGrayImageGPU.upload(trainingGrayImage); // upload image to GPU
//   std::cout << "trainingImage uploaded" << std::endl;

//   surf(trainingGrayImageGPU, cv::cuda::GpuMat(), keypointsTrImgGPU, descriptorsTrImgGPU);
//   std::cout << "FOUND " << keypointsTrImgGPU.cols << " keypoints on TR image" << std::endl;
//   trainingImageDescriptorsGPU.push_back(descriptorsTrImgGPU);
//   trainingImageNumKeyPoints.push_back(keypointsTrImgGPU.cols);
//   trainingFilePaths.push_back(trainingImgPath);
// }

// void getMatchPercentForIdx(int tr_i, cv::cuda::GpuMat &descriptorsOriginalImageGPU, std::map<std::string, double> &results){
//   std::vector< std::vector< cv::DMatch > > knn_matches;
  
//   matcher->knnMatch(trainingImageDescriptorsGPU[tr_i], descriptorsOriginalImageGPU, knn_matches, 2);

//   std::vector< cv::DMatch > good_matches;

//   for (int i = 0; i < knn_matches.size(); ++i)
//   {
//     const float ratio = 0.5; // As in Lowe's paper; can be tuned
//     if (knn_matches[i][0].distance < ratio * knn_matches[i][1].distance)
//     {
//         good_matches.push_back(knn_matches[i][0]);
//     }
//   }
//   double percent_match = (((double)good_matches.size() / (double)trainingImageNumKeyPoints[tr_i]) * 100.0);
//   printf("%zd/%d keypoints matched: %f \n", good_matches.size(), trainingImageNumKeyPoints[tr_i], percent_match);
//   results[trainingFilePaths[tr_i]] = percent_match;
// }

// void searchForMatches(cv::cuda::GpuMat &descriptorsOriginalImageGPU, std::map<std::string, double> &results){
//   std::vector<std::thread> vec_thr;
//   for(int tr_i = 0; tr_i < trainingImageDescriptorsGPU.size(); ++tr_i){
//     std::thread t_compare(getMatchPercentForIdx, tr_i, std::ref(descriptorsOriginalImageGPU), std::ref(results));
//     vec_thr.push_back(std::move(t_compare));
//     // getMatchPercentForIdx(tr_i, std::ref(descriptorsOriginalImageGPU), std::ref(results));
//   }
  
//   for (unsigned int i=0; i<vec_thr.size(); ++i){
//     if (vec_thr[i].joinable())
//       vec_thr.at(i).join();
//   }
// }

// void compare_using_bff_knn(std::string trainingImgPath, cv::cuda::GpuMat &descriptorsOriginalImageGPU, std::map<std::string, double> &results){    
//   cv::Mat trainingGrayImage;
//   cv::cuda::GpuMat trainingGrayImageGPU;
//   cv::cuda::GpuMat keypointsTrImgGPU, descriptorsTrImgGPU;
//   // cv::Ptr<cv::cuda::DescriptorMatcher> matcher = cv::cuda::DescriptorMatcher::createBFMatcher(surf.defaultNorm());

//   trainingGrayImage = cv::imread(trainingImgPath, CV_LOAD_IMAGE_GRAYSCALE);
//   if (!trainingGrayImage.data) {
//     std::cerr << "trainingImage load error" << std::endl;
//     return;
//   }

//   trainingGrayImageGPU.upload(trainingGrayImage); // upload image to GPU

//   surf(trainingGrayImageGPU, cv::cuda::GpuMat(), keypointsTrImgGPU, descriptorsTrImgGPU);
//   std::cout << "FOUND " << keypointsTrImgGPU.cols << " keypoints on TR image" << std::endl;


//   std::vector< std::vector< cv::DMatch > > knn_matches;
//   matcher->knnMatch(descriptorsTrImgGPU, descriptorsOriginalImageGPU, knn_matches, 2);
  
//   std::vector< cv::DMatch > good_matches;

//   for (int i = 0; i < knn_matches.size(); ++i)
//   {
//     const float ratio = 0.5; // As in Lowe's paper; can be tuned
//     if (knn_matches[i][0].distance < ratio * knn_matches[i][1].distance)
//     {
//         good_matches.push_back(knn_matches[i][0]);
//     }
//   }
//   double percent_match = (((double)good_matches.size() / (double)keypointsTrImgGPU.cols) * 100.0);
//   printf("%zd/%d keypoints matched: %f \n", good_matches.size(), keypointsTrImgGPU.cols, percent_match);
//   results[trainingImgPath] = percent_match;
// }

// int mainold(int argc, char* argv[])
// {

//   if ( argc != 3 )
//   {
//     printf("usage: ./CudaSurfMatcher <Image_Path> <Training_Path>\n");
//     return -1;
//   }
  
//   std::string file_path = argv[1];
//   std::string asset_path = argv[2];
  
//   // Pre-Load from training lib
//   DIR *dir;
//   struct dirent *ent;
//   std::string trainingImgPath;
//   if ((dir = opendir(asset_path.c_str())) != NULL) {
//     /* print all the files and directories within directory */
//     while((ent = readdir(dir)) != NULL) {
//       if(hasEnding(ent->d_name, ".jpg") || hasEnding(ent->d_name, ".JPG")){
//         trainingImgPath = asset_path + "/" + ent->d_name; 
//         std::cout << trainingImgPath << std::endl;
//         loadTrainingImage(trainingImgPath);
//       }
//     }
//     closedir(dir);
  
//   } else {
//     /* could not open directory */
//     perror("");
//     return EXIT_FAILURE;
//   }

//   cv::Mat originalGrayImage = cv::imread(file_path, CV_LOAD_IMAGE_GRAYSCALE);
//   if (!originalGrayImage.data) {
//     std::cerr << "gray image load error" << std::endl;
//     return -1;
//   }
//   cv::cuda::GpuMat originalGrayImageGPU;
//   originalGrayImageGPU.upload(originalGrayImage); // upload image to GPU

//   cv::cuda::GpuMat keypointsOriginalImageGPU, descriptorsOriginalImageGPU;
//   surf(originalGrayImageGPU, cv::cuda::GpuMat(), keypointsOriginalImageGPU, descriptorsOriginalImageGPU);
//   std::cout << "FOUND " << keypointsOriginalImageGPU.cols << " keypoints on input image" << std::endl;

//   std::chrono::high_resolution_clock::time_point search_start_t = std::chrono::high_resolution_clock::now();
//   std::map<std::string, double> results;
//   searchForMatches(descriptorsOriginalImageGPU, results);
//   typedef std::function<bool(std::pair<std::string, double>, std::pair<std::string, double>)> Comparator;
//   Comparator compFunctor =
//       [](std::pair<std::string, double> elem1 ,std::pair<std::string, double> elem2)
//       {
//         return elem1.second > elem2.second;
//       };
//   std::set<std::pair<std::string, double>, Comparator> orderedMap(
//       results.begin(), results.end(), compFunctor);
//   int i=0;
//   for (std::pair<std::string, double> element : orderedMap){
//     i++;
//     std::cout << element.first << " :: " << element.second << std::endl;
//     if(i == 10) break;  
//   }

//   std::chrono::high_resolution_clock::time_point search_end_t = std::chrono::high_resolution_clock::now();
//   auto duration = std::chrono::duration_cast<std::chrono::seconds>( search_end_t - search_start_t ).count();
//   std::cout << "elapsed time:" << duration << " seconds";
//   return 0;
// }


CudaSurfMatcher::CudaSurfMatcher(){ 
  surf = cv::cuda::SURF_CUDA(20.0);
  matcher = cv::cuda::DescriptorMatcher::createBFMatcher(surf.defaultNorm());
  loadAssets();
}

void CudaSurfMatcher::getMatchPercentForIdx(int tr_i, cv::cuda::GpuMat &descriptorsOriginalImageGPU, int originalImageNumKeyPoints, std::map<std::string, double> &results){
  std::vector< std::vector< cv::DMatch > > knn_matches;
  
  matcher->knnMatch(trainingImageDescriptorsGPU[tr_i], descriptorsOriginalImageGPU, knn_matches, 2);

  std::vector< cv::DMatch > good_matches;

  for (int i = 0; i < knn_matches.size(); ++i)
  {
    const float ratio = 0.40; // As in Lowe's paper; can be tuned
    if (knn_matches[i][0].distance < ratio * knn_matches[i][1].distance)
    {
        good_matches.push_back(knn_matches[i][0]);
    }
  }
  double percent_matchTr = (((double)good_matches.size() / (double)trainingImageNumKeyPoints[tr_i]) * 100.0);
  double percent_matchOr =  (((double)good_matches.size() / (double)originalImageNumKeyPoints) * 100.0);
  // printf("%s percent matched: TR: %f OR: %f \n", trainingFilePaths[tr_i], percent_matchTr, percent_matchOr);
  std::cout << trainingFilePaths[tr_i] << " percent matched: TR: " << percent_matchTr << " OR: " << percent_matchOr << std::endl;
  double percent_match = percent_matchOr; //(percent_matchOr + percent_matchTr);
  if(percent_match > 0.0)
    results[trainingFilePaths[tr_i]] = percent_match; 
}

void CudaSurfMatcher::searchForMatches(cv::cuda::GpuMat &descriptorsOriginalImageGPU, int originalImageNumKeyPoints, std::map<std::string, double> &results){
  std::vector<std::thread> vec_thr;
  for(int tr_i = 0; tr_i < trainingImageDescriptorsGPU.size(); ++tr_i){
    // std::thread t_compare(&CudaSurfMatcher::getMatchPercentForIdx, this, tr_i, std::ref(descriptorsOriginalImageGPU), std::ref(results));
    // vec_thr.push_back(std::move(t_compare));
    getMatchPercentForIdx(tr_i, std::ref(descriptorsOriginalImageGPU), originalImageNumKeyPoints, std::ref(results));
  }

  for (unsigned int i=0; i<vec_thr.size(); ++i){
    if (vec_thr[i].joinable())
      vec_thr.at(i).join();
  }
}

u_int32_t CudaSurfMatcher::searchImage(std::vector<char> imageData, std::map<std::string, double> &results){
    std::cout << "Loading the image and extracting the SURFs." << std::endl;

    cv::Mat originalGrayImage;
    u_int32_t i_ret = ImageLoader::loadImage(imageData.size(),
                                             imageData.data(), originalGrayImage);
    if (i_ret != OK)
        return i_ret;

    cv::cuda::GpuMat originalGrayImageGPU;
    std::cout << "originalGrayImage uploading cols:" << originalGrayImage.cols << std::endl;  
    originalGrayImageGPU.upload(originalGrayImage); // upload image to GPU
    std::cout << "originalGrayImage uploaded" << std::endl;

    cv::cuda::GpuMat keypointsOriginalImageGPU, descriptorsOriginalImageGPU;
    surf(originalGrayImageGPU, cv::cuda::GpuMat(), keypointsOriginalImageGPU, descriptorsOriginalImageGPU);
    std::cout << "FOUND " << keypointsOriginalImageGPU.cols << " keypoints on input image" << std::endl;

    std::chrono::high_resolution_clock::time_point search_start_t = std::chrono::high_resolution_clock::now();
    searchForMatches(descriptorsOriginalImageGPU, keypointsOriginalImageGPU.cols, results);
    std::chrono::high_resolution_clock::time_point search_end_t = std::chrono::high_resolution_clock::now();
    auto duration = std::chrono::duration_cast<std::chrono::seconds>( search_end_t - search_start_t ).count();
    std::cout << "elapsed time:" << duration << " seconds";

    return SEARCH_RESULTS;
}

void CudaSurfMatcher::loadAssets() {
  std::cout << "Loading assets ..";
  std::string asset_path = "/home/ubuntu/assets";
  // Pre-Load from training lib
  DIR *dir;
  struct dirent *ent;
  std::string trainingImgPath;
  if ((dir = opendir(asset_path.c_str())) != NULL) {
    /* print all the files and directories within directory */
    while((ent = readdir(dir)) != NULL) {
      if(hasEnding(ent->d_name, ".jpg") || hasEnding(ent->d_name, ".JPG")){
        trainingImgPath = asset_path + "/" + ent->d_name; 
        std::cout << trainingImgPath << std::endl;
     
        cv::Mat trainingGrayImage;
        trainingGrayImage = cv::imread(trainingImgPath, CV_LOAD_IMAGE_GRAYSCALE);
        if (!trainingGrayImage.data) {
          std::cerr << "trainingImage load error" << std::endl;
          return;
        }
        cv::cuda::GpuMat trainingGrayImageGPU;
        cv::cuda::GpuMat keypointsTrImgGPU, descriptorsTrImgGPU;
        std::cout << "trainingImage uploading cols:" << trainingGrayImage.cols << std::endl;  
        trainingGrayImageGPU.upload(trainingGrayImage); // upload image to GPU
        std::cout << "trainingImage uploaded" << std::endl;

        surf(trainingGrayImageGPU, cv::cuda::GpuMat(), keypointsTrImgGPU, descriptorsTrImgGPU);
        std::cout << "FOUND " << keypointsTrImgGPU.cols << " keypoints on TR image" << std::endl;
        trainingImageDescriptorsGPU.push_back(descriptorsTrImgGPU);
        trainingImageNumKeyPoints.push_back(keypointsTrImgGPU.cols);
        trainingFilePaths.push_back(trainingImgPath);
      }
    }
    closedir(dir);
  
  } else {
    /* could not open directory */
    perror("error");
    return;
  }
}