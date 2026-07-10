import {ExpressRequestHandler, Request, Response} from '@loopback/rest';

export const cookieToToken: ExpressRequestHandler = (
  request: Request,
  res: Response,
  next: Function,
) => {
  let cookies;
  if (request.headers.cookie) {
    cookies = request.headers.cookie
      .split('; ')
      .reduce((prev: {[key: string]: string}, current: string) => {
        const [name, ...value] = current.split('=');
        prev[name] = value.join('=');
        return prev;
      }, {});
    if (cookies.id_token)
      request.headers.authorization = `Bearer ${cookies.id_token}`;
  }
  next();
};
