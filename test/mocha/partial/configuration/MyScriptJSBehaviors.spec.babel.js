import { describe, it } from 'mocha';
import { assert } from 'chai';
import * as MyScriptJSParameter from '../../../../src/configuration/MyScriptJSParameters';
import * as MyScriptJSBehaviors from '../../../../src/configuration/MyScriptJSBehaviors';

describe('Check behaviors', () => {
  const behaviors = ['V3_REST_TEXT', 'V3_REST_MATH', 'V3_REST_SHAPE', 'V3_REST_MUSIC', 'V3_REST_ANALYZER', 'V3_WEBSOCKET_TEXT', 'V3_WEBSOCKET_MATH'];
  behaviors.forEach((behavior) => {
    const parts = behavior.split('_');
    const type = parts.pop();
    const protocol = parts.pop();
    const trigger = protocol === 'REST' ? 'QUIET_PERIOD' : 'PEN_UP';

    // it(`Should have ${trigger} trigger for ${type} ${protocol} recognition`, () => {
    //   const parameters = MyScriptJSParameter.overrideDefaultOptions();
    //   parameters.recognitionParams.type = type;
    //   parameters.recognitionParams.protocol = protocol;
    //   const defaultBehaviors = MyScriptJSBehaviors.getBehaviorsFromOptions(parameters);
    //   assert.strictEqual(defaultBehaviors.optimizedParameters.triggerRecognitionOn, trigger, `${trigger} should be the default value for ${behavior} triggerRecognitionOn`);
    // });
  });
});