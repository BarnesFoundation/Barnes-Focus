sudo add-apt-repository --yes ppa:xqms/opencv-nonfree
sudo apt-get update && sudo apt-get install cmake libopencv-dev libopencv-nonfree-dev 


# Prep Compile
cmake .
# Compile
make
# Run (on a small set of training frames)
./SiftMatcher input-img.jpg /home/ubuntu/assets-folder


# Full Run (on AWS instance with RAM > 30G and lots of cores) on 19 sets of training frames (whole set divided into sub-folders)
./find_match input-img.jpg

