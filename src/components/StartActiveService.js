import pMap from 'p-map';
import {isFunction, keys} from 'lodash';
import addDays from 'date-fns/add_days';
import format from 'date-fns/format';

class StartActiveService {
  constructor(config) {
    this.config = {
      protocol: null,
      host: null,
      league: null,
      leagueId: null,
      teamId: null,
      crumb: null,
    };

    this.validateConfig(config); // throws if wrong
    this.config = config;
    this.startActiveUrl = `${config.protocol}://${config.host}/${config.league}/${config.leagueId}/${config.teamId}/startactiveplayers?crumb=${config.crumb}`;
  }

  validateConfig(config) {
    const requiredKeys = keys(this.config);
    const valid = requiredKeys.every(key => keys(config).indexOf(key) != -1);

    if (!valid) {
      throw 'StartActiveService: Missing config values.';
    }
  }

  startActive(startDate, daysToSet, progress) {
    const urls = this.getStartActiveUrls(startDate, daysToSet);
    let daysDone = 0;

    return pMap(urls, url => {
      return this.callUrl(url)
        .then(() => {
          daysDone++;
          if (isFunction(progress)) {
            progress(daysDone, daysToSet);
          }
        });
    }, { concurrency: 5 });
  }

  getStartActiveUrls(startDate, daysToSet) {
    let urls = [];
    let newDay;

    // starts at 0, setting roster for current date.
    for (let i = 0; i < daysToSet; i++) {
      newDay = addDays(startDate, i);
      urls.push(`${this.startActiveUrl}&date=${format(newDay, 'YYYY-MM-DD')}`);
    }

    return urls;
  }

  callUrl(url, progress) {
    // const fetch = (url) => { return new Promise(resolve => {
    //   console.log(url);
    //   setTimeout(resolve, Math.round(Math.random()*300))
    // }); };

    // return fetch(url);

    return fetch(url, {
      credentials: 'include'
    });
  }
}

export default StartActiveService;