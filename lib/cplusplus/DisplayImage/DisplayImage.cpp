#include <stdio.h>
#include <opencv2/opencv.hpp>

using namespace cv;

double rect_area_overlap_percentage(Rect rect_a, double area_overlap){
    double rect_area = rect_a.area();
    std::cout << "rect_a.area() =" << rect_area << " area_overlap =>" << area_overlap << std::endl;
    double pct =  ((area_overlap / rect_area) * 100.0);
    std::cout << " pct =>" << pct << std::endl;
    return pct;
}

bool rects_already_include_rect(vector<Rect> rectangles, Rect rect){
    for( int i = 0; i < rectangles.size(); i++ ){
        cv::Rect other_rect = rectangles[i];
        if(rect == other_rect) return true;
    }
    return false;
}

bool is_rect_covered_by_any_other_rectangles(Rect rect, vector<Rect> rectangles, vector<Rect> rectangles_covered){
  for( int i = 0; i < rectangles.size(); i++ ){
    std::cout <<  "comparing with => " << std::to_string(i) << std::endl;
    cv::Rect other_rect = rectangles[i];
    if(rect != other_rect){
        if(!rects_already_include_rect(rectangles_covered, other_rect)){
            double area_overlap = (rect & other_rect).area();
            std::cout <<  "area_overlap => " << std::to_string(area_overlap) << std::endl;
            if((area_overlap > 0) && (rect_area_overlap_percentage(rect, area_overlap) > 80)) {
                return true;
            }
        } else {
            std::cout <<  "skipping compare with a marked rectangle .. skipping" << std::endl;
        }
    } else {
        std::cout <<  "same rectangle .. skipping" << std::endl;
    }
  }
  return false;
}

int main(int argc, char** argv )
{
  if ( argc != 3 )
  {
    printf("usage: ./DisplayImage <Image_Path> <OutFolder>\n");
    return -1;
  }

  Mat image, canny_output;
  vector<vector<Point> > contours;
  vector<Vec4i> hierarchy;
  vector<Rect> rectangles;

  image = imread(argv[1]);
  std::string asset_path = argv[2];

  if ( !image.data )
  {
    printf("No image data \n");
    return -1;
  }

  if(image.empty()) {
    std::cout <<  "empty() => " << image.empty();
  } else {
    std::cout << "This image is " << image.cols << " x " << image.rows << std::endl;
    vector<vector<Point> > squares;
    int thresh = 100;
    Canny(image, canny_output, thresh*2, 3);
    findContours( canny_output, contours, hierarchy, CV_RETR_TREE, CV_CHAIN_APPROX_SIMPLE, Point(0, 0) );

    for( int i = 0; i< contours.size(); i++ ){
      cv::Rect rect = boundingRect(cv::Mat(contours[i]));
      double area  = rect.width * rect.height;
      double img_area = image.rows * image.cols;
      double percentage_of_full_image = (area/img_area) * 100;
      if(!rects_already_include_rect(rectangles, rect)) {
          if(percentage_of_full_image > 1){
              std::cout << "img_area =" << img_area << " rect area=" << area << "percentageof_image=" << percentage_of_full_image << std::endl;
              rectangles.push_back(rect);
          }
      } else {
          std::cout << "rect already included .. skipping" << std::endl;
      }
    }

    vector<Rect> rectangles_covered;
    vector<Rect> chosen_rects;
    for( int i = 0; i < rectangles.size(); i++ ){
      cv::Rect rect = rectangles[i];
      std::cout << "rect" << i << std::endl;
      if(is_rect_covered_by_any_other_rectangles(rect, rectangles, rectangles_covered)){
          std::cout << "rect covered" << std::endl;
          rectangles_covered.push_back(rect);
//                cv::rectangle(image, rect.tl(), rect.br(), cv::Scalar(0,0,255), 2, 8, 0);
//                cv::putText(image, std::to_string(i), center_of_rect, cv::FONT_HERSHEY_SCRIPT_SIMPLEX, 0.5, cv::Scalar(0,0,255));
      } else {
//
//                cv::putText(image, std::to_string(i), center_of_rect, cv::FONT_HERSHEY_SCRIPT_SIMPLEX, 0.5, cv::Scalar(0,255,0));
//                cv::rectangle(image, rect.tl(), rect.br(), cv::Scalar(0,255,0), 2, 8, 0);
          std::cout << "rect not covered" << std::endl;
          chosen_rects.push_back(rect);
      }
    }


    for( int i = 0; i < chosen_rects.size(); i++ )
    {
      Mat image_cut = image(chosen_rects[i]);
      double img_area = image_cut.rows * image_cut.cols;
      cv::imwrite(asset_path + "/" + std::to_string(img_area) + "-cut.jpg", image_cut);
    }

    for( int i = 0; i < rectangles.size(); i++ ){
        cv::Rect rect = rectangles[i];
        Point center_of_rect = (rect.br() + rect.tl())*0.5;
        if(rects_already_include_rect(rectangles_covered, rect)){
            cv::rectangle(image, rect.tl(), rect.br(), cv::Scalar(0,0,255), 2, 8, 0);
            cv::putText(image, std::to_string(i), center_of_rect, cv::FONT_HERSHEY_SCRIPT_SIMPLEX, 0.5, cv::Scalar(0,0,255));
        } else {
            cv::putText(image, std::to_string(i), center_of_rect, cv::FONT_HERSHEY_SCRIPT_SIMPLEX, 0.5, cv::Scalar(0,255,0));
            cv::rectangle(image, rect.tl(), rect.br(), cv::Scalar(0,255,0), 2, 8, 0);
        }
    }
    cv::imwrite(asset_path + "/debug.jpg", image);
  }




  return 0;
}
