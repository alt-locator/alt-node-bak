import {Logger} from 'top-banana-logger';
import {Config, CurrNode} from '../config';
import {Location, NodeModel} from '../node/location';
import {AltFirebaseService, AltFirebaseClient} from './alt.service';
import * as https from 'https';
import * as http from 'http';
import * as express from 'express';
import * as expressCore from 'express-serve-static-core';

let logger = new Logger('host.server');
let app = express();
let port = 3000;

/**
 * GET /
 * Responds with the list of hosts.
 */
app.get('/',
    (request: expressCore.Request,
    response: expressCore.Response) => {
  AltFirebaseService.getHosts().then(hosts => {
    logger.debug('GET /', 200);
    response.status(200).send(hosts);
  }).catch(err => {
    logger.error('GET /', 500, err);
    response.status(500).send(err);
  });
});

/**
 * GET /update
 * Updates the current host and makes requests to patch other local
 * ip addresses.
 */
app.get('/update',
    (request: expressCore.Request,
    response: expressCore.Response) => {
  // update this host
  AltFirebaseService.updateThis().then(status => {
    if (!status) {
      logger.debug('"GET /update"', 400);
      response.status(400)
        .send({code: 400, status: 'could not update this host'});
    } else {
      AltFirebaseService.updateAllLocal().then(results => {
        for (let result of results) {
          if (!result) {
            response.status(200)
              .send({code: 200, status: 'not all hosts updated'});
          }
        }
      });
      logger.debug('"GET /update"', 200);
      response.status(200)
        .send({code: 200, status: 'completed'});
    }
  }).catch(err => {
    logger.error('"GET /update"', 500, err)
    response.status(500).send(err);
  });
});

/**
 * GET /patch
 * Update for this host only.
 */
app.get('/patch',
    (request: expressCore.Request,
    response: expressCore.Response) => {
  AltFirebaseService.updateThis().then((result: boolean) => {
    if (result) {
      logger.debug('"GET /patch"', 200);
      response.status(200).send({code: 200, status: 'updated'});
    } else {
      logger.debug('"GET /patch"', 400);
      response.status(200).send({code: 200, status: 'not updated'});
    }
  }).catch(err => {
    logger.debug('"GET /patch"', 500, err);
    response.status(500).send(err);
  });
});

/**
 * Start the app a port
 */
app.listen(port, () => {
  console.log('App listening on port ' + port + '!');
});
