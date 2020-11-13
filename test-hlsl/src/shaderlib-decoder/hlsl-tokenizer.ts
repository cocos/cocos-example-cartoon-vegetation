
// The order here must match the order in the Token enum.
const _reservedWords = [
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

export enum HLSLToken {
    // Built-in types.
    Float = 256,
    Float2,
    Float3,
    Float4,
    Float2x2,
    Float3x3,
    Float4x4,
    Float4x3,
    Float4x2,
    Half,
    Half2,
    Half3,
    Half4,
    Half2x2,
    Half3x3,
    Half4x4,
    Half4x3,
    Half4x2,
    Bool,
    Bool2,
    Bool3,
    Bool4,
    Int,
    Int2,
    Int3,
    Int4,
    Uint,
    Uint2,
    Uint3,
    Uint4,
    Texture,
    Sampler,
    Sampler2D,
    Sampler3D,
    SamplerCube,
    Sampler2DShadow,
    Sampler2DMS,
    Sampler2DArray,

    // Reserved words.
    If,
    Else,
    For,
    While,
    Break,
    True,
    False,
    Void,
    Struct,
    CBuffer,
    TBuffer,
    Register,
    Return,
    Continue,
    Discard,
    Const,
    Static,
    Inline,

    // Input modifiers.
    Uniform,
    In,
    Out,
    InOut,

    // Effect keywords.
    SamplerState,
    Technique,
    Pass,

    // Multi-character symbols.
    LessEqual,
    GreaterEqual,
    EqualEqual,
    NotEqual,
    PlusPlus,
    MinusMinus,
    PlusEqual,
    MinusEqual,
    TimesEqual,
    DivideEqual,
    AndAnd,       // &&
    BarBar,       // ||

    // Other token types.
    FloatLiteral,
    HalfLiteral,
    IntLiteral,
    Identifier,

    EndOfStream,
};


export let m_buffer = '';
export let m_lineNumber = 1;
export let m_tokenLineNumber = 1;
export let m_error = false;
export let m_token: any;
export let m_identifier = '';

let m_bufferStart = 0;
let m_bufferEnd = 0;

function isspace (s: string) {
    return s === ' ';
}

function GetIsSymbol (c: string) {
    switch (c) {
        case ';':
        case ':':
        case '(': case ')':
        case '[': case ']':
        case '{': case '}':
        case '-': case '+':
        case '*': case '/':
        case '?':
        case '!':
        case ',':
        case '=':
        case '.':
        case '<': case '>':
        case '|': case '&': case '^': case '~':
        case '@':
            return true;
    }
    return false;
}

/** Returns true if the character is a valid token separator at the end of a number type token */
function GetIsNumberSeparator (c: string) {
    return /*c === 0 ||*/ isspace(c) || GetIsSymbol(c);
}

export function reset (buffer: string) {
    m_buffer = buffer;
    m_bufferStart = 0;
    m_bufferEnd = m_buffer.length;
    m_lineNumber = 1;
    m_tokenLineNumber = 1;
    m_error = false;

    Next();
}

export function Next () {
    while (SkipWhitespace() || SkipComment() || ScanLineDirective() || SkipPragmaDirective()) {
    }

    if (m_error) {
        m_token = HLSLToken.EndOfStream;
        return;
    }

    m_tokenLineNumber = m_lineNumber;

    if (m_bufferStart >= m_bufferEnd) {
        m_token = HLSLToken.EndOfStream;
        return;
    }

    let start = m_bufferStart;

    // +=, -=, *=, /=, ==, <=, >=
    if (m_buffer[m_bufferStart] == '+' && m_buffer[m_bufferStart + 1] == '=') {
        m_token = HLSLToken.PlusEqual;
        m_bufferStart += 2;
        return;
    }
    else if (m_buffer[m_bufferStart] == '-' && m_buffer[m_bufferStart + 1] == '=') {
        m_token = HLSLToken.MinusEqual;
        m_bufferStart += 2;
        return;
    }
    else if (m_buffer[m_bufferStart] == '*' && m_buffer[m_bufferStart + 1] == '=') {
        m_token = HLSLToken.TimesEqual;
        m_bufferStart += 2;
        return;
    }
    else if (m_buffer[m_bufferStart] == '/' && m_buffer[m_bufferStart + 1] == '=') {
        m_token = HLSLToken.DivideEqual;
        m_bufferStart += 2;
        return;
    }
    else if (m_buffer[m_bufferStart] == '=' && m_buffer[m_bufferStart + 1] == '=') {
        m_token = HLSLToken.EqualEqual;
        m_bufferStart += 2;
        return;
    }
    else if (m_buffer[m_bufferStart] == '!' && m_buffer[m_bufferStart + 1] == '=') {
        m_token = HLSLToken.NotEqual;
        m_bufferStart += 2;
        return;
    }
    else if (m_buffer[m_bufferStart] == '<' && m_buffer[m_bufferStart + 1] == '=') {
        m_token = HLSLToken.LessEqual;
        m_bufferStart += 2;
        return;
    }
    else if (m_buffer[m_bufferStart] == '>' && m_buffer[m_bufferStart + 1] == '=') {
        m_token = HLSLToken.GreaterEqual;
        m_bufferStart += 2;
        return;
    }
    else if (m_buffer[m_bufferStart] == '&' && m_buffer[m_bufferStart + 1] == '&') {
        m_token = HLSLToken.AndAnd;
        m_bufferStart += 2;
        return;
    }
    else if (m_buffer[m_bufferStart] == '|' && m_buffer[m_bufferStart + 1] == '|') {
        m_token = HLSLToken.BarBar;
        m_bufferStart += 2;
        return;
    }

    // ++, --
    if ((m_buffer[m_bufferStart] == '-' || m_buffer[m_bufferStart] == '+') && (m_buffer[m_bufferStart + 1] == m_buffer[m_bufferStart])) {
        m_token = (m_buffer[m_bufferStart] == '+') ? HLSLToken.PlusPlus : HLSLToken.MinusMinus;
        m_bufferStart += 2;
        return;
    }

    // Check for the start of a number.
    if (ScanNumber()) {
        return;
    }

    if (GetIsSymbol(m_buffer[m_bufferStart])) {
        m_token = m_buffer[m_bufferStart];
        ++m_bufferStart;
        return;
    }

    // Must be an identifier or a reserved word.
    while (m_bufferStart < m_bufferEnd && !GetIsSymbol(m_buffer[m_bufferStart]) && !isspace(m_buffer[m_bufferStart])) {
        ++m_bufferStart;
    }

    m_identifier = m_buffer.substring(start, m_bufferStart);

    for (let i = 0; i < _reservedWords.length; i++) {
        if (m_identifier === _reservedWords[i]) {
            m_token === 256 + i;
            return;
        }
    }

    m_token = HLSLToken.Identifier;

}

function SkipWhitespace () {
    let result = false;
    while (m_bufferStart < m_bufferEnd && isspace(m_buffer[m_bufferStart])) {
        result = true;
        if (m_buffer[m_bufferStart] == '\n') {
            ++m_lineNumber;
        }
        ++m_bufferStart;
    }
    return result;
}


function SkipComment () {
    let result = false;
    if (m_buffer[m_bufferStart] == '/') {
        if (m_buffer[m_bufferStart + 1] == '/') {
            // Single line comment.
            result = true;
            m_bufferStart += 2;
            while (m_bufferStart < m_bufferEnd) {
                if (m_buffer[m_bufferStart++] == '\n') {
                    ++m_lineNumber;
                    break;
                }
            }
        }
        else if (m_buffer[m_bufferStart + 1] == '*') {
            // Multi-line comment.
            result = true;
            m_bufferStart += 2;
            while (m_bufferStart < m_bufferEnd) {
                if (m_buffer[m_bufferStart] == '\n') {
                    ++m_lineNumber;
                }
                if (m_buffer[m_bufferStart] == '*' && m_buffer[m_bufferStart + 1] == '/') {
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

function SkipPragmaDirective () {
    let result = false;
    if (m_bufferEnd - m_bufferStart > 7 && m_buffer[m_bufferStart] == '#') {
        let ptr = m_bufferStart + 1;
        while (isspace(m_buffer[ptr]))
            ptr++;

        if (m_buffer.substring(ptr, ptr + 6) === 'pragma' && isspace(m_buffer[ptr + 6])) {
            m_bufferStart = ptr + 6;
            result = true;
            while (m_bufferStart < m_bufferEnd) {
                if (m_buffer[m_bufferStart++] == '\n') {
                    ++m_lineNumber;
                    break;
                }
            }
        }
    }
    return result;
}

function ScanNumber () {

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

function ScanLineDirective () {

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
