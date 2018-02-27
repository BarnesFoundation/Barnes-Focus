#include <stdio.h>
#include <dirent.h>
#include <opencv2/opencv.hpp>
#include <opencv2/nonfree/nonfree.hpp>

/**
 * Calculate euclid distance
 */
double euclidDistance(cv::Mat &vec1, cv::Mat &vec2) {
  double sum = 0.0;
  int dim = vec1.cols;
  for (int i = 0; i < dim; i++) {
    sum += (vec1.at<uchar>(0,i) - vec2.at<uchar>(0,i)) * (vec1.at<uchar>(0,i) - vec2.at<uchar>(0,i));
  }
  return sqrt(sum);
}

const double THRESHOLD = 400;
/**
 * Find the index of nearest neighbor point from keypoints.
 */
int nearestNeighbor(cv::Mat &vec, std::vector<cv::KeyPoint> &keypoints, cv::Mat &descriptors) {
  int neighbor = -1;
  double minDist = 1e6;
  
  for (int i = 0; i < descriptors.rows; i++) {
    cv::KeyPoint pt = keypoints[i];
    cv::Mat v = descriptors.row(i);
    double d = euclidDistance(vec, v);
    //printf("%d %f\n", v.cols, d);
    if (d < minDist) {
      minDist = d;
      neighbor = i;
    }
  }
  
  if (minDist < THRESHOLD) {
    return neighbor;
  }
  
  return -1;
}

/**
 * Find pairs of points with the smallest distace between them
 */
void findPairs(std::vector<cv::KeyPoint> &keypoints1, cv::Mat &descriptors1,
               std::vector<cv::KeyPoint> &keypoints2, cv::Mat &descriptors2,
               std::vector<cv::Point2f> &srcPoints, std::vector<cv::Point2f> &dstPoints) {
  for (int i = 0; i < descriptors1.rows; i++) {
    cv::KeyPoint pt1 = keypoints1[i];
    cv::Mat desc1 = descriptors1.row(i);
    int nn = nearestNeighbor(desc1, keypoints2, descriptors2);
    if (nn >= 0) {
      cv::KeyPoint pt2 = keypoints2[nn];
      srcPoints.push_back(pt1.pt);
      dstPoints.push_back(pt2.pt);
    }
  }
}


int main(int argc, char** argv )
{
  // if ( argc != 3 )
  // {
  //   printf("usage: ./SiftMatcher <Image_Path> <OutFolder>\n");
  //   return -1;
  // }

  // Mat image, canny_output;
  // vector<vector<Point> > contours;
  // vector<Vec4i> hierarchy;
  // vector<Rect> rectangles;
  const std::string asset_path = "/home/vivek/source/cplusplus/SiftMatcher";
  DIR *dir;
  struct dirent *ent;
  if ((dir = opendir(asset_path.c_str())) != NULL) {
    /* print all the files and directories within directory */
    while((ent = readdir(dir)) != NULL) {
      printf("%s\n", ent->d_name);
    }
    closedir(dir);
  } else {
    /* could not open directory */
    perror("");
    return EXIT_FAILURE;
  }


  std::string file_path = "/home/vivek/source/cplusplus/SiftMatcher/g.jpg";
  
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
  printf("original image:%d keypoints are found.\n", (int)keypoints_original.size());





  // Load from training lib
  std::string tr_im_file_path = "/home/vivek/source/cplusplus/SiftMatcher/assets/g.jpg";
  cv::Mat training_image = cv::imread(tr_im_file_path); 
  cv::Size tr_img_size = training_image.size();
  cv::Mat grayTrainingFrame(tr_img_size, CV_8UC1);
  cvtColor(training_image, grayTrainingFrame, CV_BGR2GRAY);
  if (!grayTrainingFrame.data) {
    std::cerr << "cannot find image grayTrainingFrame" << std::endl;
    exit(-1);
  }

  cv::vector<cv::KeyPoint> keypointsTrImg;
  cv::Mat descriptorsTrImg;
  cv::vector<cv::DMatch> matches;  
  // Detect keypoints
  detector->detect(grayTrainingFrame, keypointsTrImg);
  extractor->compute(grayTrainingFrame, keypointsTrImg, descriptorsTrImg);
  printf("training image:%d keypoints are found.\n", (int)keypointsTrImg.size());


  // Create a image for displaying mathing keypoints
  cv::Size sz = cv::Size(tr_img_size.width + originalColorImage.size().width, 
        tr_img_size.height + originalColorImage.size().height);
  cv::Mat matchDemoImage = cv::Mat::zeros(sz, CV_8UC3);

  // Draw training frame
  cv::Mat roiTrImg = cv::Mat(matchDemoImage, cv::Rect(0, 0, tr_img_size.width, tr_img_size.height));
  training_image.copyTo(roiTrImg);
  // Draw original image
  cv::Mat roiOrigImg = cv::Mat(matchDemoImage, cv::Rect(tr_img_size.width, tr_img_size.height, originalColorImage.size().width, originalColorImage.size().height));
  originalColorImage.copyTo(roiOrigImg);

  for (int i=0; i<keypointsTrImg.size(); i++){
    cv::KeyPoint kp = keypointsTrImg[i];
    cv::circle(matchDemoImage, kp.pt, cvRound(kp.size*0.25), cv::Scalar(255,255,0), 1, 8, 0);
  }
  
  // Find nearest neighbor pairs
  cv::vector<cv::Point2f> srcPoints;
  cv::vector<cv::Point2f> dstPoints;
  findPairs(keypointsTrImg, descriptorsTrImg, keypoints_original, descriptors_original, srcPoints, dstPoints);
  printf("%zd src keypoints are matched.\n", srcPoints.size());

  char text[256];
  std::sprintf(text, "%zd/%zd keypoints matched.", srcPoints.size(), keypointsTrImg.size());
  putText(matchDemoImage, text, cv::Point(0, cvRound(tr_img_size.height + 30)), cv::FONT_HERSHEY_SCRIPT_SIMPLEX, 1, cv::Scalar(0,0,255));

  // Draw line between nearest neighbor pairs
  for (int i = 0; i < (int)srcPoints.size(); ++i) {
    cv::Point2f pt1 = srcPoints[i];
    cv::Point2f pt2 = dstPoints[i];
    cv::Point2f from = pt1;
    cv::Point2f to   = cv::Point(tr_img_size.width + pt2.x, tr_img_size.height + pt2.y);
    cv::line(matchDemoImage, from, to, cv::Scalar(0, 255, 255));
  }

  cv::imwrite(asset_path + "/debug_g.jpg", matchDemoImage);

  return 0;
}
