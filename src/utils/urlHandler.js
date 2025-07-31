const httpsCheckerAndAttacher = (imageSrc) => {
  if(!imageSrc) return imageSrc;
  
  if(!imageSrc.includes('http://') && !imageSrc.includes('https://')){
    if(imageSrc.includes('//')) {
      imageSrc = 'http:'+imageSrc;
    } else {
      imageSrc = 'http://'+imageSrc;
    }
  }
  return imageSrc;
}

export default {
  httpsCheckerAndAttacher
}
