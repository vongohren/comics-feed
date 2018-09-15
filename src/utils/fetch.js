var Entry = require('../models/comic-entry.js');
var request = require('request');
const logger = require('./logger');
const perfy = require('perfy');

export default (url, name, metadata) => {
  return new Promise( async (resolve, reject) => {
    const performanceKey = 'fetch-method-'+name;
    perfy.start(performanceKey);
    try {
      const skipCertificateCheck = (name === 'shermanslagoon' || name === 'dilbert');
      const response = await fetchRespons(url, skipCertificateCheck);
      const entryUrl = response.request.href;
      const entry = await Entry.findOne({url: entryUrl})
      if(!entry) {
        const entryObject = {
          url: entryUrl,
          label: name
        }
        if(metadata) entryObject.metadata = metadata
        const newEntry = new Entry(entryObject)
        const saveObject = await newEntry.save()
        const result = perfy.end(performanceKey);
        logger.log('info',saveObject.label+ ' was saved successfully with url: '+ saveObject.url+' used '+result.seconds + ' sec, ' + result.milliseconds.toFixed(3) + ' ms.');
        
        resolve(true)
      }
    } catch (err) {
      const result = perfy.end(performanceKey);
      if(err.code === 'ETIMEDOUT') {
        logger.log(
          'error', 
          `FetchAndSaveImage failed with a TIMEOUT for ${name} - ${url}. It was a connection timeout: ${err.connect}. Used ${result.seconds} sec, ${result.milliseconds.toFixed(3)}ms. Error: ${err}`
        )  
      }
      logger.log('error', `FetchAndSaveImage failed for ${name} - ${url}. Used ${result.seconds} sec, ${result.milliseconds.toFixed(3)} ms. Error: ${err}`)
      resolve(false)
    }
  })
}

const fetchRespons = (url, skipCertificateCheck) => {
  return new Promise((resolve, reject) => {
    const options = skipCertificateCheck ? { rejectUnauthorized: false } : {}
    request(url, options, function (error, res) {
      if(error) reject(error)
      else resolve(res)
    })
  })
}
