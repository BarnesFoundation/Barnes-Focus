#!/bin/bash
rsync -r --exclude=".*" --exclude=".jpeg" --partial --progress /home/vivek/source/cplusplus/CudaSurfMatcher kata:~/ 
ssh kata 'rm -rf /home/ubuntu/CudaSurfMatcher/build; mkdir /home/ubuntu/CudaSurfMatcher/build; cd /home/ubuntu/CudaSurfMatcher/build; cmake ..; make;'
# ssh kata '/home/ubuntu/CudaSurfMatcher/build/CudaSurfMatcher /home/ubuntu/CudaSurfMatcher/input-orig.jpg /mnt/assets'
# ssh kata '/home/ubuntu/CudaSurfMatcher/build/CudaSurfMatcher /home/ubuntu/CudaSurfMatcher/input_frame.jpg /mnt/assets'
# ssh kata '/home/ubuntu/CudaSurfMatcher/build/CudaSurfMatcher -p 42129'
