import { Logger } from '@nestjs/common';

export default (logger: Logger, message: String) => {
  logger.log(message);
};
