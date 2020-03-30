import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response } from 'express';
import { constants } from './constants';
var jwt = require('jsonwebtoken');

@Injectable()
export class HttpMiddleware implements NestMiddleware {
  async use(req: Request, res: Response, next: Function) {
    if(!req.headers.authorization) {
        return res.status(401).send('Unauthorized request');
      }
      let token = req.headers.authorization.split(' ')[1];
      if(token === 'null') {
        return res.status(401).send('Unauthorized request - null token');    
      }
      console.log('token',token);
      let payload = await jwt.verify(token, constants.jwtSecret,(err, decoded) => {
          return decoded;
      });
      if(!payload) {
        return res.status(401).send('Unauthorized payload request');    
      }
      if (Date.now() >= payload.exp * 1000) { 
        return res.status(401).send('Exp token - Please Reconnect!');    
      }
    next();
  }
}
