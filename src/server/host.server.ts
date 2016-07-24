import {Logger} from 'top-banana-logger';
import {Config} from '../config';
import {Location, NodeModel} from '../node/location';
import {AltFirebaseService, NodeObject} from './alt.service';
import * as http from 'http';
import * as express from 'express';
import * as expressCore from 'express-serve-static-core';

let logger = new Logger('host.server');
let app = express();

app.get('/',
    (request: expressCore.Request,
    response: expressCore.Response) => {

  // get the list of hosts from firebase
  AltFirebaseService.getHosts().then(hosts => {
    logger.debug('GET /', 200);
    response.send(hosts);
  }).catch(err => {
    logger.error('GET /', 500, err);
    response.sendStatus(500);
  });
});

/**
 * The public API endpoint. Will make patch requests to other local ip addresses
 * that have matching external addresses.
 */
app.get('/update',
    (request: expressCore.Request,
    response: expressCore.Response) => {

  // update the current machine
  AltFirebaseService.updateHost(Config.locationName).then(status => {
    if (!status) {
      logger.debug('"GET /update"', 400);
      response.sendStatus(400);
    } else {
      logger.debug('"GET /update"', 200);
      // get the list of hosts
      // the list of hosts
      // go through and make requests to other local servers
      updateAllLocal();
      response.send('done!');
    }
  }).catch(err => {
    logger.error('"GET /update"', 500, err)
    response.sendStatus(500);
  });
});

/**
 *
 */
function updateAllLocal() {
  AltFirebaseService.getHosts().then(nodeObjects => {
    let node = new NodeModel();
    Location.getLocalAddress(node)
        .then(node => Location.getExternalAddress(node))
        .then(node => {
      nodeObjects.forEach(nodeObject => {
        if (nodeObject.externalIpAddress === node.externalIpAddress &&
            nodeObject.localIpAddress !== node.localIpAddress) {
          let options = {
            host: nodeObject.localIpAddress,
            path: '/patch',
            port: 3000
          };
          let request = http.request(options, (response) => {
            let contents = '';
            response.on('data', (chunk) => {
              contents += chunk;
            });
            response.on('end', () => {
              console.log(contents);
            });
          });
          request.end();
        }
      });
    });
  });
 }

/**
 *
 */
app.get('/patch',
    (request: expressCore.Request,
    response: expressCore.Response) => {
  console.log('PATCH');
  AltFirebaseService.updateHost(Config.locationName).then((result: boolean) => {
    if (result) {
      logger.debug('"GET /patch"', 200);
      response.send('updated');
    } else {
      logger.debug('"GET /patch"', 400);
      response.send('not updated');
    }
  }).catch(err => {
    logger.debug('"GET /patch"', 500, err);
  });
});

app.listen(3000, function () {
  console.log('App listening on port 3000!');
});
