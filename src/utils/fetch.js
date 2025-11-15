import Entry from '../models/comic-entry.js';
import request from 'request';
import logger from './logger';
import perfy from 'perfy';


export default (url, name, metadata) => {
  return new Promise(async(resolve, reject) => {
    const performanceKey = 'fetch-method-' + name;
    perfy.start(performanceKey);
    try {
      const skipCertificateCheck = (name === 'shermanslagoon' || name === 'dilbert');
      const response = await fetchRespons(url, skipCertificateCheck);
      const entryUrl = response.request.href;
      const entry = await Entry.findOne({ url: entryUrl })
      if (!entry) {
        const entryObject = {
          url: entryUrl,
          label: name
        }
        if (metadata) entryObject.metadata = metadata
        const newEntry = new Entry(entryObject)
        const saveObject = await newEntry.save()
        const result = perfy.end(performanceKey);
        logger.log('info', saveObject.label + ' was saved successfully with url: ' + saveObject.url + ' used ' + result.seconds + ' sec, ' + result.milliseconds.toFixed(3) + ' ms.');

        resolve(true)
      }
    } catch (err) {
      const result = perfy.end(performanceKey);
      if (err.code === 'ETIMEDOUT') {
        logger.log(
          'error',
          `FetchAndSaveImage failed with a TIMEOUT for ${name} - ${url}. It was a connection timeout: ${err.connect}. Used ${result.seconds} sec, ${result.milliseconds.toFixed(3)}ms. Error: ${err}`
        )
      } else {
        if (name === 'pondus' && `${err}`.includes('410')) {
          resolve(false);
          return
        }
        logger.log('error', `FetchAndSaveImage failed for ${name} - ${url}. Used ${result.seconds} sec, ${result.milliseconds.toFixed(3)} ms. Error: ${err}`)
      }
      resolve(false)
    }
  })
}

const fetchRespons = (url, skipCertificateCheck) => {
  return new Promise((resolve, reject) => {
    const options = skipCertificateCheck ? { rejectUnauthorized: false } : {}
    const encodedUrl = encodeURI(url)
    request(encodedUrl, options, function(error, res) {
      if (error) {
        reject(error)
        return // Early return to prevent accessing undefined res
      }
      if (res.statusCode !== 200) {
        reject(`Non 200 response: ${res.statusCode} for url ${url}`)
        return
      }
      resolve(res)
    })
  })
}
