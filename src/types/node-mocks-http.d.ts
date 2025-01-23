declare module 'node-mocks-http' {
  import { Request, Response } from 'express';

  export function createRequest(options?: any): Request;
  export function createResponse(options?: any): Response & {
    _getJSONData(): any;
  };
}
