var Entry = require('../models/comic-entry.js');
var request = require('request');
const logger = require('./logger');

export default (url, name, metadata) => {
  return new Promise( async (resolve, reject) => {
    try {
      const response = await fetchRespons(url);
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
        logger.log('info',saveObject.label+ ' was saved successfully with url: '+ saveObject.url);
        resolve(true)
      }
    } catch (err) {
      logger.log('error', "FetchAndSaveImage failed with: " + err)
      resolve(false)
    }
  })
}

const getEntries = (url) => {
  return new Promise((resolve, reject) => {
    const entries =
    request(url, function (error, res) {
      if(error) reject(error)
      else resolve(res)
    })
  })
}

const fetchRespons = (url) => {
  return new Promise((resolve, reject) => {
    request(url, function (error, res) {
      if(error) reject(error)
      else resolve(res)
    })
  })

}
