import { recognizerLogger as logger } from '../configuration/LoggerConfig';

/**
 * Recognizer info
 * @typedef {Object} RecognizerInfo
 * @property {String} type Supported recognition type (TEXT, MATH, SHAPE, MUSIC, ANALYZER).
 * @property {String} protocol Supported protocol (REST, WEBSOCKET).
 * @property {String} apiVersion Supported API version.
 * @property {Array<String>} availableTriggers Supported triggers for this recognizer.
 * @property {String} preferredTrigger Preferred recognition trigger for this recognizer.
 */

/**
 * Recognition service entry point
 * @typedef {Object} Recognizer
 * @property {function(): RecognizerInfo} getInfo Get information about the supported configuration (protocol, type, apiVersion, ...).
 * @property {function(options: Options, model: Model, recognizerContext: RecognizerContext): Promise.<Model>} init Initialize recognition.
 * @property {function(options: Options, model: Model, recognizerContext: RecognizerContext): Promise.<Model>} reset Clear server context. Currently nothing to do there.
 * @property {function(options: Options, model: Model, recognizerContext: RecognizerContext): Promise.<Model>} recognize Do the recognition.
 * @property {function(options: Options, model: Model, recognizerContext: RecognizerContext): Promise.<Model>} close Close and free all resources that will no longer be used by the recognizer.
 */

/**
 * Clear server context. Currently nothing to do there.
 * @param {Options} options Current configuration
 * @param {Model} model Current model
 * @param {RecognizerContext} recognizerContext Current recognizer context
 * @return {Promise.<Model>}
 */
export function reset(options, model, recognizerContext) {
  logger.debug('No reset behavior');
  return Promise.resolve(model);
}

/**
 * Close and free all resources that will no longer be used by the recognizer.
 * @param {Options} options Current configuration
 * @param {Model} model Current model
 * @param {RecognizerContext} recognizerContext Current recognizer context
 * @return {Promise.<Model>} Fulfilled when the close phase is over.
 */
export function close(options, model, recognizerContext) {
  logger.debug('No close behavior');
  return Promise.resolve(model);
}

/**
 * Initialize recognition
 * @param {Options} options Current configuration
 * @param {Model} model Current model
 * @param {RecognizerContext} recognizerContext Current recognizer context
 * @return {Promise.<Model>} Fulfilled when the init phase is over.
 */
export function init(options, model, recognizerContext) {
  logger.debug('No init behavior');
  return Promise.resolve(model);
}
