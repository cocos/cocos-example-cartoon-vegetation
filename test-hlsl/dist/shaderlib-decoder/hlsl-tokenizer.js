"use strict";
exports.__esModule = true;
exports.Next = exports.reset = exports.m_identifier = exports.m_token = exports.m_error = exports.m_tokenLineNumber = exports.m_lineNumber = exports.m_buffer = exports.HLSLToken = void 0;
// The order here must match the order in the Token enum.
var _reservedWords = [
    "float",
    "float2",
    "float3",
    "float4",
    "float2x2",
    "float3x3",
    "float4x4",
    "float4x3",
    "float4x2",
    "half",
    "half2",
    "half3",
    "half4",
    "half2x2",
    "half3x3",
    "half4x4",
    "half4x3",
    "half4x2",
    "bool",
    "bool2",
    "bool3",
    "bool4",
    "int",
    "int2",
    "int3",
    "int4",
    "uint",
    "uint2",
    "uint3",
    "uint4",
    "texture",
    "sampler",
    "sampler2D",
    "sampler3D",
    "samplerCUBE",
    "sampler2DShadow",
    "sampler2DMS",
    "sampler2DArray",
    "if",
    "else",
    "for",
    "while",
    "break",
    "true",
    "false",
    "void",
    "struct",
    "cbuffer",
    "tbuffer",
    "register",
    "return",
    "continue",
    "discard",
    "const",
    "static",
    "inline",
    "uniform",
    "in",
    "out",
    "inout",
    "sampler_state",
    "technique",
    "pass",
];
var HLSLToken;
(function (HLSLToken) {
    // Built-in types.
    HLSLToken[HLSLToken["Float"] = 256] = "Float";
    HLSLToken[HLSLToken["Float2"] = 257] = "Float2";
    HLSLToken[HLSLToken["Float3"] = 258] = "Float3";
    HLSLToken[HLSLToken["Float4"] = 259] = "Float4";
    HLSLToken[HLSLToken["Float2x2"] = 260] = "Float2x2";
    HLSLToken[HLSLToken["Float3x3"] = 261] = "Float3x3";
    HLSLToken[HLSLToken["Float4x4"] = 262] = "Float4x4";
    HLSLToken[HLSLToken["Float4x3"] = 263] = "Float4x3";
    HLSLToken[HLSLToken["Float4x2"] = 264] = "Float4x2";
    HLSLToken[HLSLToken["Half"] = 265] = "Half";
    HLSLToken[HLSLToken["Half2"] = 266] = "Half2";
    HLSLToken[HLSLToken["Half3"] = 267] = "Half3";
    HLSLToken[HLSLToken["Half4"] = 268] = "Half4";
    HLSLToken[HLSLToken["Half2x2"] = 269] = "Half2x2";
    HLSLToken[HLSLToken["Half3x3"] = 270] = "Half3x3";
    HLSLToken[HLSLToken["Half4x4"] = 271] = "Half4x4";
    HLSLToken[HLSLToken["Half4x3"] = 272] = "Half4x3";
    HLSLToken[HLSLToken["Half4x2"] = 273] = "Half4x2";
    HLSLToken[HLSLToken["Bool"] = 274] = "Bool";
    HLSLToken[HLSLToken["Bool2"] = 275] = "Bool2";
    HLSLToken[HLSLToken["Bool3"] = 276] = "Bool3";
    HLSLToken[HLSLToken["Bool4"] = 277] = "Bool4";
    HLSLToken[HLSLToken["Int"] = 278] = "Int";
    HLSLToken[HLSLToken["Int2"] = 279] = "Int2";
    HLSLToken[HLSLToken["Int3"] = 280] = "Int3";
    HLSLToken[HLSLToken["Int4"] = 281] = "Int4";
    HLSLToken[HLSLToken["Uint"] = 282] = "Uint";
    HLSLToken[HLSLToken["Uint2"] = 283] = "Uint2";
    HLSLToken[HLSLToken["Uint3"] = 284] = "Uint3";
    HLSLToken[HLSLToken["Uint4"] = 285] = "Uint4";
    HLSLToken[HLSLToken["Texture"] = 286] = "Texture";
    HLSLToken[HLSLToken["Sampler"] = 287] = "Sampler";
    HLSLToken[HLSLToken["Sampler2D"] = 288] = "Sampler2D";
    HLSLToken[HLSLToken["Sampler3D"] = 289] = "Sampler3D";
    HLSLToken[HLSLToken["SamplerCube"] = 290] = "SamplerCube";
    HLSLToken[HLSLToken["Sampler2DShadow"] = 291] = "Sampler2DShadow";
    HLSLToken[HLSLToken["Sampler2DMS"] = 292] = "Sampler2DMS";
    HLSLToken[HLSLToken["Sampler2DArray"] = 293] = "Sampler2DArray";
    // Reserved words.
    HLSLToken[HLSLToken["If"] = 294] = "If";
    HLSLToken[HLSLToken["Else"] = 295] = "Else";
    HLSLToken[HLSLToken["For"] = 296] = "For";
    HLSLToken[HLSLToken["While"] = 297] = "While";
    HLSLToken[HLSLToken["Break"] = 298] = "Break";
    HLSLToken[HLSLToken["True"] = 299] = "True";
    HLSLToken[HLSLToken["False"] = 300] = "False";
    HLSLToken[HLSLToken["Void"] = 301] = "Void";
    HLSLToken[HLSLToken["Struct"] = 302] = "Struct";
    HLSLToken[HLSLToken["CBuffer"] = 303] = "CBuffer";
    HLSLToken[HLSLToken["TBuffer"] = 304] = "TBuffer";
    HLSLToken[HLSLToken["Register"] = 305] = "Register";
    HLSLToken[HLSLToken["Return"] = 306] = "Return";
    HLSLToken[HLSLToken["Continue"] = 307] = "Continue";
    HLSLToken[HLSLToken["Discard"] = 308] = "Discard";
    HLSLToken[HLSLToken["Const"] = 309] = "Const";
    HLSLToken[HLSLToken["Static"] = 310] = "Static";
    HLSLToken[HLSLToken["Inline"] = 311] = "Inline";
    // Input modifiers.
    HLSLToken[HLSLToken["Uniform"] = 312] = "Uniform";
    HLSLToken[HLSLToken["In"] = 313] = "In";
    HLSLToken[HLSLToken["Out"] = 314] = "Out";
    HLSLToken[HLSLToken["InOut"] = 315] = "InOut";
    // Effect keywords.
    HLSLToken[HLSLToken["SamplerState"] = 316] = "SamplerState";
    HLSLToken[HLSLToken["Technique"] = 317] = "Technique";
    HLSLToken[HLSLToken["Pass"] = 318] = "Pass";
    // Multi-character symbols.
    HLSLToken[HLSLToken["LessEqual"] = 319] = "LessEqual";
    HLSLToken[HLSLToken["GreaterEqual"] = 320] = "GreaterEqual";
    HLSLToken[HLSLToken["EqualEqual"] = 321] = "EqualEqual";
    HLSLToken[HLSLToken["NotEqual"] = 322] = "NotEqual";
    HLSLToken[HLSLToken["PlusPlus"] = 323] = "PlusPlus";
    HLSLToken[HLSLToken["MinusMinus"] = 324] = "MinusMinus";
    HLSLToken[HLSLToken["PlusEqual"] = 325] = "PlusEqual";
    HLSLToken[HLSLToken["MinusEqual"] = 326] = "MinusEqual";
    HLSLToken[HLSLToken["TimesEqual"] = 327] = "TimesEqual";
    HLSLToken[HLSLToken["DivideEqual"] = 328] = "DivideEqual";
    HLSLToken[HLSLToken["AndAnd"] = 329] = "AndAnd";
    HLSLToken[HLSLToken["BarBar"] = 330] = "BarBar";
    // Other token types.
    HLSLToken[HLSLToken["FloatLiteral"] = 331] = "FloatLiteral";
    HLSLToken[HLSLToken["HalfLiteral"] = 332] = "HalfLiteral";
    HLSLToken[HLSLToken["IntLiteral"] = 333] = "IntLiteral";
    HLSLToken[HLSLToken["Identifier"] = 334] = "Identifier";
    HLSLToken[HLSLToken["EndOfStream"] = 335] = "EndOfStream";
})(HLSLToken = exports.HLSLToken || (exports.HLSLToken = {}));
;
exports.m_buffer = '';
exports.m_lineNumber = 1;
exports.m_tokenLineNumber = 1;
exports.m_error = false;
exports.m_identifier = '';
var m_bufferStart = 0;
var m_bufferEnd = 0;
function isspace(s) {
    return s === ' ';
}
function GetIsSymbol(c) {
    switch (c) {
        case ';':
        case ':':
        case '(':
        case ')':
        case '[':
        case ']':
        case '{':
        case '}':
        case '-':
        case '+':
        case '*':
        case '/':
        case '?':
        case '!':
        case ',':
        case '=':
        case '.':
        case '<':
        case '>':
        case '|':
        case '&':
        case '^':
        case '~':
        case '@':
            return true;
    }
    return false;
}
/** Returns true if the character is a valid token separator at the end of a number type token */
function GetIsNumberSeparator(c) {
    return /*c === 0 ||*/ isspace(c) || GetIsSymbol(c);
}
function reset(buffer) {
    exports.m_buffer = buffer;
    m_bufferStart = 0;
    m_bufferEnd = exports.m_buffer.length;
    exports.m_lineNumber = 1;
    exports.m_tokenLineNumber = 1;
    exports.m_error = false;
    Next();
}
exports.reset = reset;
function Next() {
    while (SkipWhitespace() || SkipComment() || ScanLineDirective() || SkipPragmaDirective()) {
    }
    if (exports.m_error) {
        exports.m_token = HLSLToken.EndOfStream;
        return;
    }
    exports.m_tokenLineNumber = exports.m_lineNumber;
    if (m_bufferStart >= m_bufferEnd) {
        exports.m_token = HLSLToken.EndOfStream;
        return;
    }
    var start = m_bufferStart;
    // +=, -=, *=, /=, ==, <=, >=
    if (exports.m_buffer[m_bufferStart] == '+' && exports.m_buffer[m_bufferStart + 1] == '=') {
        exports.m_token = HLSLToken.PlusEqual;
        m_bufferStart += 2;
        return;
    }
    else if (exports.m_buffer[m_bufferStart] == '-' && exports.m_buffer[m_bufferStart + 1] == '=') {
        exports.m_token = HLSLToken.MinusEqual;
        m_bufferStart += 2;
        return;
    }
    else if (exports.m_buffer[m_bufferStart] == '*' && exports.m_buffer[m_bufferStart + 1] == '=') {
        exports.m_token = HLSLToken.TimesEqual;
        m_bufferStart += 2;
        return;
    }
    else if (exports.m_buffer[m_bufferStart] == '/' && exports.m_buffer[m_bufferStart + 1] == '=') {
        exports.m_token = HLSLToken.DivideEqual;
        m_bufferStart += 2;
        return;
    }
    else if (exports.m_buffer[m_bufferStart] == '=' && exports.m_buffer[m_bufferStart + 1] == '=') {
        exports.m_token = HLSLToken.EqualEqual;
        m_bufferStart += 2;
        return;
    }
    else if (exports.m_buffer[m_bufferStart] == '!' && exports.m_buffer[m_bufferStart + 1] == '=') {
        exports.m_token = HLSLToken.NotEqual;
        m_bufferStart += 2;
        return;
    }
    else if (exports.m_buffer[m_bufferStart] == '<' && exports.m_buffer[m_bufferStart + 1] == '=') {
        exports.m_token = HLSLToken.LessEqual;
        m_bufferStart += 2;
        return;
    }
    else if (exports.m_buffer[m_bufferStart] == '>' && exports.m_buffer[m_bufferStart + 1] == '=') {
        exports.m_token = HLSLToken.GreaterEqual;
        m_bufferStart += 2;
        return;
    }
    else if (exports.m_buffer[m_bufferStart] == '&' && exports.m_buffer[m_bufferStart + 1] == '&') {
        exports.m_token = HLSLToken.AndAnd;
        m_bufferStart += 2;
        return;
    }
    else if (exports.m_buffer[m_bufferStart] == '|' && exports.m_buffer[m_bufferStart + 1] == '|') {
        exports.m_token = HLSLToken.BarBar;
        m_bufferStart += 2;
        return;
    }
    // ++, --
    if ((exports.m_buffer[m_bufferStart] == '-' || exports.m_buffer[m_bufferStart] == '+') && (exports.m_buffer[m_bufferStart + 1] == exports.m_buffer[m_bufferStart])) {
        exports.m_token = (exports.m_buffer[m_bufferStart] == '+') ? HLSLToken.PlusPlus : HLSLToken.MinusMinus;
        m_bufferStart += 2;
        return;
    }
    // Check for the start of a number.
    if (ScanNumber()) {
        return;
    }
    if (GetIsSymbol(exports.m_buffer[m_bufferStart])) {
        exports.m_token = exports.m_buffer[m_bufferStart];
        ++m_bufferStart;
        return;
    }
    // Must be an identifier or a reserved word.
    while (m_bufferStart < m_bufferEnd && !GetIsSymbol(exports.m_buffer[m_bufferStart]) && !isspace(exports.m_buffer[m_bufferStart])) {
        ++m_bufferStart;
    }
    exports.m_identifier = exports.m_buffer.substring(start, m_bufferStart);
    for (var i = 0; i < _reservedWords.length; i++) {
        if (exports.m_identifier === _reservedWords[i]) {
            exports.m_token === 256 + i;
            return;
        }
    }
    exports.m_token = HLSLToken.Identifier;
}
exports.Next = Next;
function SkipWhitespace() {
    var result = false;
    while (m_bufferStart < m_bufferEnd && isspace(exports.m_buffer[m_bufferStart])) {
        result = true;
        if (exports.m_buffer[m_bufferStart] == '\n') {
            ++exports.m_lineNumber;
        }
        ++m_bufferStart;
    }
    return result;
}
function SkipComment() {
    var result = false;
    if (exports.m_buffer[m_bufferStart] == '/') {
        if (exports.m_buffer[m_bufferStart + 1] == '/') {
            // Single line comment.
            result = true;
            m_bufferStart += 2;
            while (m_bufferStart < m_bufferEnd) {
                if (exports.m_buffer[m_bufferStart++] == '\n') {
                    ++exports.m_lineNumber;
                    break;
                }
            }
        }
        else if (exports.m_buffer[m_bufferStart + 1] == '*') {
            // Multi-line comment.
            result = true;
            m_bufferStart += 2;
            while (m_bufferStart < m_bufferEnd) {
                if (exports.m_buffer[m_bufferStart] == '\n') {
                    ++exports.m_lineNumber;
                }
                if (exports.m_buffer[m_bufferStart] == '*' && exports.m_buffer[m_bufferStart + 1] == '/') {
                    break;
                }
                ++m_bufferStart;
            }
            if (m_bufferStart < m_bufferEnd) {
                m_bufferStart += 2;
            }
        }
    }
    return result;
}
function SkipPragmaDirective() {
    var result = false;
    if (m_bufferEnd - m_bufferStart > 7 && exports.m_buffer[m_bufferStart] == '#') {
        var ptr = m_bufferStart + 1;
        while (isspace(exports.m_buffer[ptr]))
            ptr++;
        if (exports.m_buffer.substring(ptr, ptr + 6) === 'pragma' && isspace(exports.m_buffer[ptr + 6])) {
            m_bufferStart = ptr + 6;
            result = true;
            while (m_bufferStart < m_bufferEnd) {
                if (exports.m_buffer[m_bufferStart++] == '\n') {
                    ++exports.m_lineNumber;
                    break;
                }
            }
        }
    }
    return result;
}
function ScanNumber() {
    // // Don't treat the + or - as part of the number.
    // if (m_buffer[m_bufferStart] == '+' || m_buffer[m_bufferStart] == '-') {
    //     return false;
    // }
    // // Parse hex literals.
    // if (m_bufferEnd - m_bufferStart > 2 && m_buffer[m_bufferStart] == '0' && m_buffer[m_bufferStart + 1] == 'x') {
    //     char * hEnd = NULL;
    //     int     iValue = strtol(m_bufferStart + 2, & hEnd, 16);
    //     if (GetIsNumberSeparator(hEnd[0])) {
    //         m_buffer = hEnd;
    //         m_token = HLSLToken.IntLiteral;
    //         m_iValue = iValue;
    //         return true;
    //     }
    // }
    // char * fEnd = NULL;
    // double fValue = String_ToDouble(m_buffer, & fEnd);
    // if (fEnd == m_buffer) {
    //     return false;
    // }
    // char * iEnd = NULL;
    // int    iValue = String_ToInteger(m_buffer, & iEnd);
    // // If the character after the number is an f then the f is treated as part
    // // of the number (to handle 1.0f syntax).
    // if ((fEnd[0] == 'f' || fEnd[0] == 'h') && fEnd < m_bufferEnd) {
    //     ++fEnd;
    // }
    // if (fEnd > iEnd && GetIsNumberSeparator(fEnd[0])) {
    //     m_buffer = fEnd;
    //     m_token = fEnd[0] == 'f' ? HLSLToken.FloatLiteral : HLSLToken.HalfLiteral;
    //     m_fValue = static_cast<float>(fValue);
    //     return true;
    // }
    // else if (iEnd > m_buffer && GetIsNumberSeparator(iEnd[0])) {
    //     m_buffer = iEnd;
    //     m_token = HLSLToken.IntLiteral;
    //     m_iValue = iValue;
    //     return true;
    // }
    return false;
}
function ScanLineDirective() {
    // if (m_bufferEnd - m_buffer > 5 && strncmp(m_buffer, "#line", 5) == 0 && isspace(m_buffer[5])) {
    //     m_bufferStart += 5;
    //     while (m_bufferStart < m_bufferEnd && isspace(m_buffer[m_bufferStart])) {
    //         if (m_buffer[m_bufferStart] == '\n') {
    //             Error("Syntax error: expected line number after #line");
    //             return false;
    //         }
    //         ++m_bufferStart;
    //     }
    //     char * iEnd = NULL;
    //     int lineNumber = String_ToInteger(m_buffer, & iEnd);
    //     if (!isspace(* iEnd)) {
    //         Error("Syntax error: expected line number after #line");
    //         return false;
    //     }
    //     m_buffer = iEnd;
    //     while (m_bufferStart < m_bufferEnd && isspace(m_buffer[m_bufferStart])) {
    //         char c = m_buffer[m_bufferStart];
    //         ++m_bufferStart;
    //         if (c == '\n') {
    //             m_lineNumber = lineNumber;
    //             return true;
    //         }
    //     }
    //     if (m_buffer >= m_bufferEnd) {
    //         m_lineNumber = lineNumber;
    //         return true;
    //     }
    //     if (m_buffer[m_bufferStart] != '"') {
    //         Error("Syntax error: expected '\"' after line number near #line");
    //         return false;
    //     }
    //     ++m_bufferStart;
    //     int i = 0;
    //     while (i + 1 < s_maxIdentifier && m_bufferStart < m_bufferEnd && m_buffer[m_bufferStart] != '"') {
    //         if (m_buffer[m_bufferStart] == '\n') {
    //             Error("Syntax error: expected '\"' before end of line near #line");
    //             return false;
    //         }
    //         m_lineDirectiveFileName[i] = * m_buffer;
    //         ++m_bufferStart;
    //         ++i;
    //     }
    //     m_lineDirectiveFileName[i] = 0;
    //     if (m_buffer >= m_bufferEnd) {
    //         Error("Syntax error: expected '\"' before end of file near #line");
    //         return false;
    //     }
    //     if (i + 1 >= s_maxIdentifier) {
    //         Error("Syntax error: file name too long near #line");
    //         return false;
    //     }
    //     // Skip the closing quote
    //     ++m_bufferStart;
    //     while (m_bufferStart < m_bufferEnd && m_buffer[m_bufferStart] != '\n') {
    //         if (!isspace(m_buffer[m_bufferStart])) {
    //             Error("Syntax error: unexpected input after file name near #line");
    //             return false;
    //         }
    //         ++m_bufferStart;
    //     }
    //     // Skip new line
    //     ++m_bufferStart;
    //     m_lineNumber = lineNumber;
    //     m_fileName = m_lineDirectiveFileName;
    //     return true;
    // }
    return false;
}
// void Error(const char* format, ...)
// {
//     // It's not always convenient to stop executing when an error occurs,
//     // so just track once we've hit an error and stop reporting them until
//     // we successfully bail out of execution.
//     if (m_error) {
//         return;
//     }
//     m_error = true;
//     char buffer[1024];
//     va_list args;
//     va_start(args, format);
//     int result = vsnprintf(buffer, sizeof(buffer) - 1, format, args);
//     va_end(args);
//     Log_Error("%s(%d) : %s\n", m_fileName, m_lineNumber, buffer);
// }
// function GetTokenName(char buffer[s_maxIdentifier]) const
//     {
//         if (m_token == HLSLToken.FloatLiteral || m_token == HLSLToken.HalfLiteral)
// {
//     sprintf(buffer, "%f", m_fValue);
// }
// else if (m_token == HLSLToken.IntLiteral) {
//     sprintf(buffer, "%d", m_iValue);
// }
// else if (m_token == HLSLToken.Identifier) {
//     strcpy(buffer, m_identifier);
// }
// else {
//     GetTokenName(m_token, buffer);
// }
// }
// void GetTokenName(int token, char buffer[s_maxIdentifier])
// {
//     if (token < 256) {
//         buffer[0] = (char)token;
//         buffer[1] = 0;
//     }
//     else if (token < HLSLToken.LessEqual) {
//         strcpy(buffer, _reservedWords[token - 256]);
//     }
//     else {
//         switch (token) {
//             case HLSLToken.PlusPlus:
//                 strcpy(buffer, "++");
//                 break;
//             case HLSLToken.MinusMinus:
//                 strcpy(buffer, "--");
//                 break;
//             case HLSLToken.PlusEqual:
//                 strcpy(buffer, "+=");
//                 break;
//             case HLSLToken.MinusEqual:
//                 strcpy(buffer, "-=");
//                 break;
//             case HLSLToken.TimesEqual:
//                 strcpy(buffer, "*=");
//                 break;
//             case HLSLToken.DivideEqual:
//                 strcpy(buffer, "/=");
//                 break;
//             case HLSLToken.HalfLiteral:
//                 strcpy(buffer, "half");
//                 break;
//             case HLSLToken.FloatLiteral:
//                 strcpy(buffer, "float");
//                 break;
//             case HLSLToken.IntLiteral:
//                 strcpy(buffer, "int");
//                 break;
//             case HLSLToken.Identifier:
//                 strcpy(buffer, "identifier");
//                 break;
//             case HLSLToken.EndOfStream:
//                 strcpy(buffer, "<eof>");
//                 break;
//             default:
//                 strcpy(buffer, "unknown");
//                 break;
//         }
//     }
// }
//# sourceMappingURL=hlsl-tokenizer.js.map