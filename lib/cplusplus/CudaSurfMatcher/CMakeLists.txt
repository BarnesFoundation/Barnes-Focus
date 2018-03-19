
cmake_minimum_required(VERSION 3.0)

set(CMAKE_CXX_STANDARD 11)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
SET(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -std=c++11 -pthread")

project( CudaSurfMatcher )

set(CMAKE_MODULE_PATH ${CMAKE_MODULE_PATH} "${CMAKE_SOURCE_DIR}/cmake/Modules/")

find_package( OpenCV REQUIRED )
find_package (Threads)
find_package(CUDA  REQUIRED)
find_package(microhttpd REQUIRED)
find_package(jsoncpp REQUIRED)

# /usr/share/cmake/Modules/FindCUDA.cmake
INCLUDE(FindCUDA)
# If the package has been found, several variables will
# be set, you can find the full list with descriptions
# in the CUDAConfig.cmake file.
# Print some message showing some of them
message(STATUS "CUDA library status:")
message(STATUS "    toolkit root dir: ${CUDA_TOOLKIT_ROOT_DIR}")
message(STATUS "    version: ${CUDA_VERSION}")
message(STATUS "    libraries: ${CUDA_LIBRARIES}")
message(STATUS "    include path: ${CUDA_INCLUDE_DIRS}")

set(SOURCES      src/main.cpp
                 src/RequestHandler.cpp
                 src/httpserver.cpp
                 src/CudaSurfMatcher.cpp
                 src/imageloader.cpp
                 )
set(HEADERS      include/httpserver.h
                 include/messages.h 
                 include/imageloader.h
                 )

include_directories(${CUDA_INCLUDE_DIRS} include)


add_executable( CudaSurfMatcher ${SOURCES} ${HEADERS})

target_link_libraries( CudaSurfMatcher ${CUDA_LIBRARIES} )
target_link_libraries(CudaSurfMatcher ${CMAKE_THREAD_LIBS_INIT})
target_link_libraries(CudaSurfMatcher ${OpenCV_LIBS})
target_link_libraries(CudaSurfMatcher ${LIBMICROHTTPD_LIBRARY})
target_link_libraries(CudaSurfMatcher ${LIBJSONCPP_LIBRARY})