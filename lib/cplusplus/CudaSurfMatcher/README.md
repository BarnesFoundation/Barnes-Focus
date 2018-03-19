
https://www.pyimagesearch.com/2016/07/04/how-to-install-cuda-toolkit-and-cudnn-for-deep-learning/

sudo apt-get update
sudo apt-get upgrade
sudo apt-get install build-essential libmicrohttpd-dev libjsoncpp-dev cmake3 git unzip pkg-config libopenblas-dev liblapack-dev linux-image-generic linux-image-extra-virtual linux-source linux-headers-generic

sudo nano /etc/modprobe.d/blacklist-nouveau.conf
blacklist nouveau
blacklist lbm-nouveau
blacklist vga16fb
blacklist nouveau
blacklist rivafb
blacklist nvidiafb
blacklist rivatv
options nouveau modeset=0
alias nouveau off
alias lbm-nouveau off

echo options nouveau modeset=0 | sudo tee -a /etc/modprobe.d/nouveau-kms.conf
sudo update-initramfs -u
sudo reboot
wget http://us.download.nvidia.com/XFree86/Linux-x86_64/352.99/NVIDIA-Linux-x86_64-352.99.run
chmod +x NVIDIA-Linux-x86_64-352.99.run
sudo ./NVIDIA-Linux-x86_64-352.99.run
modprobe nvidia

wget http://developer.download.nvidia.com/compute/cuda/7.5/Prod/local_installers/cuda_7.5.18_linux.run
chmod +x cuda_7.5.18_linux.run
sudo ./cuda_7.5.18_linux.run   # Don't install driver, just install CUDA and sample

sudo nvidia-smi -pm 1
Enabled persistence mode for GPU 0000:00:1E.0.
All done.

sudo nvidia-smi -acp 0
Applications clocks commands have been set to UNRESTRICTED for GPU 0000:00:1E.0
All done.
sudo nvidia-smi --auto-boost-permission=0
All done.

sudo nvidia-smi -ac 2505,875
Applications clocks set to "(MEM 2505, SM 875)" for GPU 0000:00:1E.0
All done.

mkdir installers
sudo ./cuda_7.5.18_linux.run -extract=`pwd`/installers
cd installers
sudo ./cuda-linux64-rel-7.5.18-19867135.run

Please make sure that
 -   PATH includes /usr/local/cuda-7.5/bin
 -   LD_LIBRARY_PATH includes /usr/local/cuda-7.5/lib64, or,
  add /usr/local/cuda-7.5/lib64 to /etc/ld.so.conf and run ldconfig as root

sudo nano  /etc/ld.so.conf.d/libcuda.conf
/usr/local/cuda-7.5/lib64

vim ~/.bashrc
export PATH="$PATH:/usr/local/cuda-7.5/bin"

sudo ./cuda-samples-linux-7.5.18-19867135.run


https://www.pyimagesearch.com/2016/07/11/compiling-opencv-with-cuda-support/


sudo apt-get install libjpeg8-dev libtiff5-dev libjasper-dev libpng12-dev libgtk2.0-dev libavcodec-dev libavformat-dev libswscale-dev libv4l-dev libatlas-base-dev gfortran libhdf5-serial-dev python2.7-dev
cd /mnt
sudo mkdir opencv_compile
sudo chown -R ubuntu opencv_compile/
cd opencv_compile

wget -O opencv.zip https://codeload.github.com/opencv/opencv/zip/3.1.0
wget -O opencv_contrib.zip https://codeload.github.com/opencv/opencv_contrib/zip/3.1.0
unzip opencv.zip
unzip opencv_contrib.zip

cd opencv-3.1.0
mkdir build
cd build
cmake -D CMAKE_BUILD_TYPE=RELEASE \
    -D CMAKE_INSTALL_PREFIX=/usr/local \
    -D WITH_CUDA=ON \
    -D ENABLE_FAST_MATH=1 \
    -D CUDA_FAST_MATH=1 \
    -D WITH_CUBLAS=1 \
    -D INSTALL_PYTHON_EXAMPLES=ON \
    -D OPENCV_EXTRA_MODULES_PATH=../../opencv_contrib-3.1.0/modules \
    -D BUILD_EXAMPLES=ON ..

make -j8
sudo make install
sudo ldconfig
