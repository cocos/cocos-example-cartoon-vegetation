import fs from 'fs';
import path from 'path';

import * as token from './shaderlib-decoder/hlsl-tokenizer';

var source = fs.readFileSync(
  path.join(__dirname, '../res/AN_Surface.shader'),
  'utf8'
);

token.reset(source);

while (token.m_token !== token.HLSLToken.EndOfStream) {
  token.Next();
}
