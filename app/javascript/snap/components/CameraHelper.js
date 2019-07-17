/** Crops an image and returns the uri of the cropped image */
export const cropPhoto = imageUri => {
  return new Promise(resolve => {
    let image = new Image();
    image.onload = () => {
      // let scanBox = this.scanBox.getBoundingClientRect();
      /* this.cropRect = {
                x: Math.floor(scanBox.x),
                y: Math.floor(scanBox.y),
                width: Math.floor(scanBox.width),
                height: Math.floor(scanBox.height)
            } */

      var w = Math.max(
        document.documentElement.clientWidth,
        window.innerWidth || 0
      );
      var h = Math.max(
        document.documentElement.clientHeight,
        window.innerHeight || 0
      );

      // We will be croping the top half of entire viewport for better image matching.
      this.cropRect = {
        x: 0,
        y: 0,
        width: screen.width,
        height: h / 2
      };

      // Create temporary canvas
      let cropCanvas = document.createElement("canvas");
      let cropContext = cropCanvas.getContext("2d");

      let cropWidth = Math.floor(this.cropRect.width);
      let cropHeight = Math.floor(this.cropRect.height);

      cropCanvas.width = cropWidth;
      cropCanvas.height = cropHeight;

      // Draw the new image, keeping its proportions intact for optimal matching
      cropContext.drawImage(
        image,
        this.cropRect.x,
        this.cropRect.y,
        cropWidth,
        cropHeight,
        0,
        0,
        cropWidth,
        cropHeight
      );

      cropCanvas.toBlob(imageBlob => {
        resolve(imageBlob);
      }, "image/jpeg");
    };
    // Trigger loading of the image
    image.src = imageUri;
  });
};
