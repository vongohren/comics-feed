const httpsCheckerAndAttacher = (imageSrc) => {
  if(!imageSrc.includes('http://') && !imageSrc.includes('https://')){
    if(imageSrc.includes('//')) {
      imageSrc = 'http:'+imageSrc;
    } else {
      imageSrc = 'http://'+imageSrc;
    }
  }
  return imageSrc;
}

module.exports = {
  httpsCheckerAndAttacher
}
