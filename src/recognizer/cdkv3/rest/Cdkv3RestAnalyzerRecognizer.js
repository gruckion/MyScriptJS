import { recognizerLogger as logger } from '../../../configuration/LoggerConfig';
import MyScriptJSConstants from '../../../configuration/MyScriptJSConstants';
import * as InkModel from '../../../model/InkModel';
import * as StrokeComponent from '../../../model/StrokeComponent';
import * as NetworkInterface from '../../networkHelper/rest/networkInterface';
import * as CryptoHelper from '../../CryptoHelper';
import {
  updateSentRecognitionPositions,
  resetRecognitionPositions
} from '../../../model/RecognizerContext';
import {
  commonRestV3Configuration,
  updateModelReceivedPosition
} from './Cdkv3CommonRestRecognizer'; // Configuring recognition trigger
import { extractSymbols as extractShapeSymbols } from '../common/Cdkv3CommonShapeRecognizer';

export { init, close } from '../../DefaultRecognizer';

/**
 * Recognizer configuration
 * @type {{type: String, protocol: String, apiVersion: String}}
 */
export const analyzerRestV3Configuration = {
  type: MyScriptJSConstants.RecognitionType.ANALYZER,
  protocol: MyScriptJSConstants.Protocol.REST,
  apiVersion: 'V3'
};

/**
 * Get the configuration supported by this recognizer
 * @return {RecognizerInfo}
 */
export function getInfo() {
  return Object.assign({}, commonRestV3Configuration, analyzerRestV3Configuration);
}

function buildInput(options, model, instanceId) {
  const input = {
    // Incremental
    components: model.rawStrokes.map(stroke => StrokeComponent.toJSON(stroke))
  };
  Object.assign(input, { parameter: options.recognitionParams.analyzerParameter }); // Building the input with the suitable parameters

  logger.debug(`input.components size is ${input.components.length}`);

  const data = {
    instanceId,
    applicationKey: options.recognitionParams.server.applicationKey,
    analyzerInput: JSON.stringify(input)
  };

  if (options.recognitionParams.server.hmacKey) {
    data.hmac = CryptoHelper.computeHmac(data.analyzerInput, options.recognitionParams.server.applicationKey, options.recognitionParams.server.hmacKey);
  }
  return data;
}

function getStyleToApply(model, element) {
  // FIXME hack to apply the rendering param of the first element' stroke
  const strokes = element.inkRanges
      .map(inkRange => InkModel.extractStrokesFromInkRange(model, inkRange.stroke, inkRange.stroke, inkRange.firstPoint, inkRange.lastPoint))
      .reduce((a, b) => a.concat(b));
  const style = {
    color: strokes[0].color,
    width: strokes[0].width
  };
  Object.assign(element, style);
  return style;
}

function extractSymbols(model, element) {
  switch (element.elementType) {
    case 'table':
      return element.lines.map(line => Object.assign(line, getStyleToApply(model, element)));
    case 'textLine':
      return [element].map(textLine => Object.assign(textLine, textLine.result.textSegmentResult.candidates[textLine.result.textSegmentResult.selectedCandidateIdx], getStyleToApply(model, element)));
    case 'shape':
      return extractShapeSymbols(model, element);
    default:
      return [];
  }
}

function extractRecognizedSymbolsFromAnalyzerResult(model) {
  const result = model.rawResult.result;
  if (result) {
    return [...result.shapes, ...result.tables, ...result.textLines]
        .map(element => extractSymbols(model, element))
        .reduce((a, b) => a.concat(b));
  }
  return [];
}

/**
 * Enrich the model with recognized symbols
 * @param {Model} model Current model
 * @return {Model} Updated model
 */
function processRenderingResult(model) {
  const modelReference = model;
  logger.debug('Building the rendering model', modelReference);
  modelReference.recognizedSymbols = extractRecognizedSymbolsFromAnalyzerResult(model);
  return modelReference;
}

/**
 * Do the recognition
 * @param {Options} options Current configuration
 * @param {Model} model Current model
 * @param {RecognizerContext} recognizerContext Current recognizer context
 * @return {Promise.<Model>} Promise that return an updated model as a result
 */
export function recognize(options, model, recognizerContext) {
  const modelReference = model;
  const recognizerContextReference = recognizerContext;

  const data = buildInput(options, model, recognizerContextReference.analyzerInstanceId);
  updateSentRecognitionPositions(recognizerContextReference, modelReference);
  return NetworkInterface.post(`${options.recognitionParams.server.scheme}://${options.recognitionParams.server.host}/api/v3.0/recognition/rest/analyzer/doSimpleRecognition.json`, data)
      .then(
          // logResponseOnSuccess
          (response) => {
            logger.debug('Cdkv3RestAnalyzerRecognizer success', response);
            // memorizeInstanceId
            recognizerContextReference.analyzerInstanceId = response.instanceId;
            logger.debug('Cdkv3RestAnalyzerRecognizer update model', response);
            modelReference.rawResult = response;
            modelReference.rawResult.type = `${analyzerRestV3Configuration.type.toLowerCase()}Result`;
            return modelReference;
          }
      )
      .then(processRenderingResult)
      .then(updateModelReceivedPosition);
}

/**
 * Do what is needed to clean the server context.
 * @param {Options} options Current configuration
 * @param {Model} model Current model
 * @param {RecognizerContext} recognizerContext Current recognizer context
 * @return {Promise}
 */
export function reset(options, model, recognizerContext) {
  resetRecognitionPositions(recognizerContext, model);
  // We are explicitly manipulating a reference here.
  // eslint-disable-next-line no-param-reassign
  delete recognizerContext.analyzerInstanceId;
  return Promise.resolve();
}
