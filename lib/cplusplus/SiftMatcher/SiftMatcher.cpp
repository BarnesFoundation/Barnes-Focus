#include <stdio.h>
#include <dirent.h>
#include <opencv2/opencv.hpp>
#include <opencv2/nonfree/nonfree.hpp>
#include <thread>
#include <map>

bool hasEnding (std::string const &fullString, std::string const &ending) {
  if (fullString.length() >= ending.length()) {
      return (0 == fullString.compare (fullString.length() - ending.length(), ending.length(), ending));
  } else {
      return false;
  }
}

void compare_with_image_using_bff_knn_and_lowe_ratio_test(cv::Mat &originalColorImage, std::string training_img_path, 
  std::vector<cv::KeyPoint> &keypoints_original, 
  cv::Mat &descriptors_original, std::map<std::string, double> &results){

  cv::FeatureDetector* detector;
  detector = new cv::SiftFeatureDetector(
                                     0, // nFeatures
                                     4, // nOctaveLayers
                                     0.04, // contrastThreshold
                                     10, //edgeThreshold
                                     1.6 //sigma
                                     );
  
  cv::DescriptorExtractor* extractor;
  extractor = new cv::SiftDescriptorExtractor();
  cv::Mat training_image = cv::imread(training_img_path); 
  cv::Size tr_img_size = training_image.size();
  cv::Mat grayTrainingFrame(tr_img_size, CV_8UC1);
  cvtColor(training_image, grayTrainingFrame, CV_BGR2GRAY);
  if (!grayTrainingFrame.data) {
    std::cerr << "cannot find image grayTrainingFrame" << std::endl;
    exit(-1);
  }

  cv::vector<cv::KeyPoint> keypointsTrImg;
  cv::Mat descriptorsTrImg;
  // Detect keypoints
  detector->detect(grayTrainingFrame, keypointsTrImg);
  extractor->compute(grayTrainingFrame, keypointsTrImg, descriptorsTrImg);
  // printf("training image:%d keypoints are found.\n", (int)keypointsTrImg.size());
  
  
  //-- Step 3: Matching descriptor vectors using FLANN matcher
  cv::BFMatcher matcher(cv::NORM_L2);
  std::vector< std::vector< cv::DMatch > > matches;
  matcher.knnMatch(descriptorsTrImg, descriptors_original, matches, 2);
  
  std::vector< cv::DMatch > good_matches;

  for (int i = 0; i < matches.size(); ++i)
  {
    const float ratio = 0.8; // As in Lowe's paper; can be tuned
    if (matches[i][0].distance < ratio * matches[i][1].distance)
    {
        good_matches.push_back(matches[i][0]);
    }
  }

  int percent_match = (((double)good_matches.size() / (double)keypointsTrImg.size()) * 100.0);
  // printf("%zd/%zd keypoints matched: %f \n", good_matches.size(), keypointsTrImg.size(), percent_match);
  results[training_img_path] = percent_match;
  
}


int main(int argc, char** argv )
{
  if ( argc != 3 )
  {
    printf("usage: ./SiftMatcher <Image_Path> <Training_Path>\n");
    return -1;
  }

  std::string file_path = argv[1];
  std::string asset_path = argv[2];
  
  cv::Mat originalGrayImage = cv::imread(file_path, CV_LOAD_IMAGE_GRAYSCALE);
  if (!originalGrayImage.data) {
    std::cerr << "gray image load error" << std::endl;
    return -1;
  }
  
  cv::Mat originalColorImage = cv::imread(file_path, CV_LOAD_IMAGE_ANYCOLOR|CV_LOAD_IMAGE_ANYDEPTH);
  if (!originalColorImage.data) {
    std::cerr << "color image open error" << std::endl;
    return -1;
  }

  cv::FeatureDetector* detector;
  detector = new cv::SiftFeatureDetector(
                                     0, // nFeatures
                                     4, // nOctaveLayers
                                     0.04, // contrastThreshold
                                     10, //edgeThreshold
                                     1.6 //sigma
                                     );
  
  cv::DescriptorExtractor* extractor;
  extractor = new cv::SiftDescriptorExtractor();
  
  // Compute keypoints and descriptor from the source image in advance
  std::vector<cv::KeyPoint> keypoints_original;
  cv::Mat descriptors_original;

  detector->detect(originalGrayImage, keypoints_original);
  extractor->compute(originalGrayImage, keypoints_original, descriptors_original);
  // printf("original image:%d keypoints are found.\n", (int)keypoints_original.size());

  // Load from training lib
  DIR *dir;
  struct dirent *ent;
  std::string training_img_path;
  if ((dir = opendir(asset_path.c_str())) != NULL) {
    /* print all the files and directories within directory */
    std::vector<std::thread> vec_thr;
    std::map<std::string, double> results;
    while((ent = readdir(dir)) != NULL) {
      if(hasEnding(ent->d_name, ".jpg")){
        training_img_path = asset_path + "/" + ent->d_name; 
        // compare_with_image_using_bff_knn_and_lowe_ratio_test( originalColorImage, training_img_path, keypoints_original, 
        //   descriptors_original, results);
        std::thread t_compare(compare_with_image_using_bff_knn_and_lowe_ratio_test, std::ref(originalColorImage), 
          training_img_path, std::ref(keypoints_original), std::ref(descriptors_original), std::ref(results));
        vec_thr.push_back(std::move(t_compare));
      }
    }
    closedir(dir);

    for (unsigned int i=0; i<vec_thr.size(); ++i)
    {
      if (vec_thr[i].joinable())
        vec_thr.at(i).join();
    }


    typedef std::function<bool(std::pair<std::string, double>, std::pair<std::string, double>)> Comparator;
    Comparator compFunctor =
        [](std::pair<std::string, double> elem1 ,std::pair<std::string, double> elem2)
        {
          return elem1.second > elem2.second;
        };
    std::set<std::pair<std::string, double>, Comparator> orderedMap(
        results.begin(), results.end(), compFunctor);
    for (std::pair<std::string, double> element : orderedMap)
      std::cout << element.first << " :: " << element.second << std::endl;
    
  
  } else {
    /* could not open directory */
    perror("");
    return EXIT_FAILURE;
  }

  return 0;
}
