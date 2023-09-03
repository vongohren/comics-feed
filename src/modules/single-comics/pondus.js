var Feed = require('../feed');
var moment = require('moment');
const axios = require('axios');
const {Storage} = require('@google-cloud/storage');
const logger = require('../../utils/logger')
const jwt_decode = require('jwt-decode');

// Instantiate a storage client
const base64Decoded = Buffer.from(process.env.STORAGE_KEY, 'base64').toString('utf8')
const storagePriv = JSON.parse(base64Decoded);
const storage = new Storage({credentials:storagePriv});

class Pondus extends Feed {
  constructor({
    name = 'pondus',
    itemDescription = 'Pondusstripe',
    tegneserieSideLink = 'http://www.klikk.no/pondus/',
    tegneserieLogo = '//login.mediaconnect.no/resources/partner/2/no.serieforlaget.tegneserier.pondus/logo.png',
    stripUrl = 'https://www.vg.no/tegneserier',
    hour = '10',
    minute = '00',
    author = 'Frode Øverli',
    authorUrl = 'https://no.wikipedia.org/wiki/Frode_%C3%98verli',
    mediator = 'VG',
    mediatorLogo = 'https://www.vg.no/vgc/hyperion/img/logo.png',
    mediatorUrl = 'https://www.vg.no/tegneserier'
  }) {
    super(name, itemDescription, tegneserieSideLink, tegneserieLogo, stripUrl, hour, minute);
    this.language = 'norwegian'
    this.author = author
    this.authorUrl = authorUrl
    this.mediator = mediator;
    this.mediatorLogo = mediatorLogo
    this.mediatorUrl = mediatorUrl
  }
  async extractImageSrc($,callback) {
    const today = moment().format('YYYY-MM-DD')
    const url = `https://www.vg.no/tegneserier/api/images/pondus/${today}`;
    const oneYearJwt = "eyJraWQiOiIzYWNkODdmNS0zYmQyLTQ5ZTMtYWFhOC0wYTI5ZjU2MzY1YTIiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiJzZHJuOnNwaWQubm86Y2xpZW50OjRlZjFjZmIwZTk2MmRkMmUwZDhkMDAwMCIsInN1YiI6IjgzZDNhMDY1LWNhZGMtNTAzMC1hYTdmLTgyY2I4OGEzYTc3ZiIsInVzZXJfaWQiOiIyNDEyMjAiLCJpc3MiOiJodHRwczpcL1wvc2Vzc2lvbi1zZXJ2aWNlLmxvZ2luLnNjaGlic3RlZC5jb20iLCJleHAiOjE3MjUyNjUxMjMsImlhdCI6MTY5MzcyOTEyMywianRpIjoiMmFlZDA3YzktM2VhYi00OWM3LTlkYmUtMzJlZjY2ZDcxY2M2In0.T_oZB3pgvmZlBOQkEUOD9VqfMvmLfzCEErGGSaqVPWsmAdvaafasc5YF61qRVKJgr57b03N3QJpkqCKBqZu-nI4GRtTqDygP5gfvXDXWg3-qWzZSIeKSdMdWPtY_5CdxEJL3iR1P_wEWboqufeQjftyCPWBMQalNBG5XUC_6AzADeyTHvNjZo_K9FbycYjTjACEH6xBsy1zqjrKV-8R1JMoUzZ-H8HFYL3scpeUgEAn6WOTcXNwG7rMQ9w9N3zC73vGA6CILUjncaZ63WaemUddSl5pO2ionD_LpcFWH62uD5I9fiasWWREgCUVtbkTG4Zzzy5PcXsA57f0Yek5AXklV2xRXxleXATKW9vJOGszFqdXkluOUUNZSeMID3xwhf1ZZtNipLYoMUeVsiYL62raYa0-84AxzL7M34yOWRy3r8IJK4zzV-N5qzff2nAbE4g_HBldS8jDI9ktNN4T737wOs1rNHFwdWW9XcixDb6nxQs58pncmvpc3u-BUqutmlQPA7_xenGrK3R-i9rEjknQq65pWLKI5m1UATFsHwsotzj-OW2j_H7iYORYFSfGAtT2bsfDatGQJJcJtWw-_lYTR7eZaTbsbmrUmEdTKAeCQxSXo86rFewtshLl8npQWZE27o583gCYPxmUk9uvsfy2xSwRNv4sxtzyP20bIbD0";
    const jwtData = jwt_decode(oneYearJwt);
    const exp = jwtData.exp;
    const now = moment().unix();
    // make a check if the jwt has 60 days left of expiring and error log it
    if(exp - now < 5184000) {
      logger.log('error', `Pondus jwt has less than 60 days left of expiring. Exp: ${exp} Now: ${now}. Just go to VG and load ${url}, login and copy the jwt from the cookie and replace it in the code.`)
    }

    try {
      const res = await axios({
        method: 'get',
        url: url,
        responseType: 'stream',
        headers: {
          Cookie: `_ga=GA1.1.219148325.1688909103; _ga_DKKWD4LFQF=GS1.1.1689428492.2.1.1689428599.0.0.0; clientBucket=88; iter_id=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhaWQiOiI2NGYzNGQzMTlkZjhjYzAwMDFiYTI0MjQiLCJjb21wYW55X2lkIjoiNjA5NGVhMjQxNmQ1YjUwMDAxNWM2NDdlIiwiaWF0IjoxNjkzNjY2NjA5fQ._VOlG2GKUhrZ7RBQhh6Q0OD1TRLb1nXWgUxZ_s1UFBE; id-jwt=${oneYearJwt}`,
          'User-Agent': "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36"
        }
      })

      const myBucket = storage.bucket('comics-feed');
      const file = myBucket.file(`pondus-${today}`)
      const blobStream = file.createWriteStream({
        resumable:false,
        metadata: {
          contentType:'image/jpeg'
        }
      })
      blobStream.on('error', (err) => {
        logger.log('error', `Pondus and google clousd failed their stream: ${err}`)
        logger.log('error', `Failed to stream?`)
      })
      blobStream.on('finish', (data) => {
        callback(file.publicUrl());  
      })
      res.data.pipe(blobStream)
    } catch (error) {
      if(error.response) {
        if(error.response.status === 410) {
          logger.log('info', 'Pondus serves 410 and no image today')
          return
        }
        logger.log('error', `Pondus failes their response: ${error}`)
      } 
      
    }
  }
}

module.exports = Pondus;
