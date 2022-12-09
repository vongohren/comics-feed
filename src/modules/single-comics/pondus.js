var Feed = require('../feed');
var moment = require('moment');
const axios = require('axios');
const {Storage} = require('@google-cloud/storage');
const logger = require('../../utils/logger')

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
    try {
      const res = await axios({
        method: 'get',
        url: url,
        responseType: 'stream',
        headers: {
          Cookie: "clientBucket=11;_MBL={'u':'KDZdGELI5U','t':1661107210};id-jwt=eyJraWQiOiIzYWNkODdmNS0zYmQyLTQ5ZTMtYWFhOC0wYTI5ZjU2MzY1YTIiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiJzZHJuOnNwaWQubm86Y2xpZW50OjVhOTgxMDU3YWM0YWNlNGFlMzNkY2Y1YyIsInN1YiI6IjgzZDNhMDY1LWNhZGMtNTAzMC1hYTdmLTgyY2I4OGEzYTc3ZiIsInVzZXJfaWQiOiIyNDEyMjAiLCJpc3MiOiJodHRwczpcL1wvc2Vzc2lvbi1zZXJ2aWNlLmxvZ2luLnNjaGlic3RlZC5jb20iLCJleHAiOjE2OTM1NDkyODYsImlhdCI6MTY2MjAxMzI4NiwianRpIjoiNDQwMjY0NzktNGYxOS00OTMzLTk5YTQtZGEzMjMzNzI2NTA2In0.YdOeT1lF9UbI00UXVzCGQYYxzbIE3yISiUZehwfDx_lCKne--4rqg7Qi4Uze133ompcyJRYaGcTCZcE0NbDC8fwgsxKmfdKwKG6BUYu68qJDel1iLV2p3RNYj7vpYqxjmuznLWGEISDihtxm2rT0L7ikIsvK7lHyOX050uGiHRVyJA3wfv28nVAR80AB8PPmp_o1KINbF_t093s_lA6KO_k7Ytn7WDHFPJzgFq91arSdANvvc1ahN1WAJHWA-21YcYeR7Er2zjgIXMroj_MXvDoojxh-MOy04VgB8MGRe1LWUts5vyo6rcPNfCA4MFEdUQEC_e73eNZLjg_pgKViifLxsFEkQuQL-EeIAA7mRWbIoHLfcnPJQQkzdffmGJ8uSmZsEPfkY-sGjZxQZvgQUJqPjs2A5LNKJbcS1FbSZIUmVFJ-2fL0nN_Is_9Wk8m5Bw0eR5WGqUd7W-zLZYEgPfDzLdeH6DtHz3ALl_e0MxtwlQRfb74LtFc1Q3WFBpqwa1p16JTQx8kxG2jMFVRDvAv9RF4ADZflg5nOQzIOKERLmCoPPSkOqGrWVxUYTwtRqHdPncOAHqr6pFoBlHC4kEB6td_lUj_1VGnQRm_Iw_REbQXnvJmaeiYL5iXoeWpv2aTb169rHm26arduD1P3ov6bGxNv-bHOrzD1oPNI5MA;SP_ID=eyJjbGllbnRfaWQiOiI0ZWYxY2ZiMGU5NjJkZDJlMGQ4ZDAwMDAiLCJhdXRoIjoiVUppWEtvV0xhOGYzREFMMnRPaGpnUnBDa0I3dHBSdlU3WUFyaWtyNzZSTnhVdkJSd2VHQjhnVEZtdnN6RWtXZmUtdV9IUU5reHdQajZhRWlTbm1iYS1UTV8tTmN6VUVwcnU1MUxzWXJSVzgifQ;_pulse2data=2fa395b0-432d-4910-865d-78f7091ffef7,v,241220,1662014187591,eyJpc3N1ZWRBdCI6IjIwMTgtMDYtMjZUMDk6NDJaIiwiZW5jIjoiQTEyOENCQy1IUzI1NiIsImFsZyI6ImRpciIsImtpZCI6IjIifQ..i7nrUdUGVS8zl-0PfXdPAg.X9indU9ZhERtjXPD0cy-QDEGgaeTVnAzVWy_nIkwYGNsFZLJsGYVnblb7aJJpcQ1rJ6fL1l06Cvhmn3ibXXVRerefXwz_b9WAA3eJ0ZPfrQidiGJS-Q6ZbuhNqEOhwn1LHPEDqPT5Ndrq1DTasdqbksmzSdYl4Gy5e9QF0hD4_W6Zpvw6Ki7Knf9JdWu5URm28fCvKuKVtN-2p723Tr_PWgldo20gkvdKIxa8XcFbNdZ4SGh_1e4ra0DjnoeocZvn0Rt9Nz1nCfx8vMNggzBb_D8o7oM16Da2Su2vz0g7mw.ZENoc3mxhZ7beq5yCySzmg,4971052420334917281,1662027687591,true,,eyJraWQiOiIyIiwiYWxnIjoiSFMyNTYifQ..lJeM-ZqRICMoLq3Dsy3hSBfg8u8mFZmvf5BXa5Wu-Q4;__mbl={'u':[{'uid':'g3We5WT0wCqb6lCI','ts':1662013410},1662103410]};_pulsesession=['sdrn:schibsted:session:531f4050-5977-4c71-9d30-ad18e6930231',1662013287600,1662013412485];VPW_State=dHVwbGVzPSgoOTk4LDE2NjIwMTM1NjYpKSxzaWc9MHgyYTA5MWM2YTA3MDViNDg4ZWEzY2ZmY2IyZDI2NTVlNjEzMTNlMDliNmUwMjM3Mzc3YTY1MjBkN2RmNTZhNDUw",
          'User-Agent': "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.0.0 Safari/537.36"
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
