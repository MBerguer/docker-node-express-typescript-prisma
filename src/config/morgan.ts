import morgan from 'morgan';
import config from './config';
import logger, {AccessLogStream} from './logger';
import moment from 'moment';

// local datetime token
morgan.token('local-datetime', () => {
  return moment().format('YYYY-MM-DD HH:mm:ss');
});

morgan(
  `:remote-addr - :remote-user :local-datetime ":method :url HTTP/:http-version" :status :res[content-length] DUR=":response-time ms" ":referrer" ":user-agent"`,
  { stream: new AccessLogStream() }
);


const getIpFormat = () => (config.env === 'production' ? ':remote-addr - ' : '');
const successResponseFormat = `${getIpFormat()}:method :url :status - :response-time ms`;
const errorResponseFormat = `${getIpFormat()}:method :url :status - :response-time ms - message: :message`;

const successHandler = morgan(successResponseFormat, {
  skip: (req, res) => res.statusCode >= 400,
  stream: { write: (message) => logger.info(message.trim()) },
});

const errorHandler = morgan(errorResponseFormat, {
  skip: (req, res) => res.statusCode < 400,
  stream: { write: (message) => logger.error(message.trim()) },
});

export default {
  successHandler,
  errorHandler,
};
