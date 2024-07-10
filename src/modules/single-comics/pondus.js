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
    const oneYearJwt = "eyJraWQiOiIzYWNkODdmNS0zYmQyLTQ5ZTMtYWFhOC0wYTI5ZjU2MzY1YTIiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiJzZHJuOnNwaWQubm86Y2xpZW50OjRlZjFjZmIwZTk2MmRkMmUwZDhkMDAwMCIsInN1YiI6IjgzZDNhMDY1LWNhZGMtNTAzMC1hYTdmLTgyY2I4OGEzYTc3ZiIsInVzZXJfaWQiOiIyNDEyMjAiLCJpc3MiOiJodHRwczpcL1wvc2Vzc2lvbi1zZXJ2aWNlLmxvZ2luLnNjaGlic3RlZC5jb20iLCJleHAiOjE3NDgyMDAwNDQsImlhdCI6MTcxNjY2NDA0NCwianRpIjoiNjgwZTY3NmUtMGE1Yi00OTY1LWFjNjQtMGNlMGIyMDUxMzk0In0.CGMvkDvV4fgLNDY8hmBLhwDLUQvlWsmGTZ8Njb8pa1cm1jp5McAjwMp65akmS1x54rWMAiDqDi26FTmdZZCmMFsfdj--uS6-S8HFq8UUEZsDsolqH3ZoZ-86eQuejSNzdNTGCX-mYOmS74zBWVLb-Q2FdMPuj-vAu_2ikO4H2rIcmQ9JoJk2hdELQjVCUj07X3_SGHDueJ90beY816-CsuNYX_aT6LWJHvlgmyrB2vDshTfLBGc4i7TDsQZGCv5PkVePeYxGjxFqeV7wJZhSobx9UIQz1Bmmh6dA6sW537TC9J1il4uUYaEJ7CCekUXVukFtA5KxgPfOJ5kZqoduAHhQHnaiDInfz8dHGHwoDIEXeJgzVpx4n1mmm7q-i-Ru5_tDjf1oxqje_VjBgS0QHujgv-dPAjAwRZT3aGe23fZ7a8UUseySdK5WeT6s-yk5l1pqjVh9-MIVBs3DekWjkcDJNPDxudt8ag6rYIqoshlkFi0ovZxtAPQGLCBzcT4H289NYt_5tb_czXt-0pNUZ1dFjZSD8DUHTeW606ZMqdjF9XUE8fuevy_-lGx5OVXd1o0ZD6UdTabLDlfaweDEiEaP4qFHRtb71phSB3eEbEfND2lxilURsL-4OztTSKOoXCXJi-BxLwHxK1-3XIFQDtPhxph-fMmO06XHnS2Gm-E";
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
