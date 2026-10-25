# 全部工具逐项说明

本目录由实际注册表生成。便携工具、特色工作台和第三方推荐分开介绍；推荐不等于已集成。

## 清理首尾空白

- 标识：`text.trim`
- 分类：Text
- 用途与限制：移除文本首尾空白，保留内部格式。
- 平台：web、windows、linux、macos、cli
- 风险：safe；权限：无额外权限

输入字段与约束：

```json
{
  "type": "object",
  "properties": {
    "text": {
      "type": "string",
      "maxLength": 1000000
    }
  },
  "required": [
    "text"
  ],
  "additionalProperties": false
}
```

输入示例：

```json
{
  "text": "  你好  "
}
```

实际示例输出：

```json
"你好"
```

## 行去重

- 标识：`text.lines.unique`
- 分类：Text
- 用途与限制：按首次出现顺序去重，区分大小写。
- 平台：web、windows、linux、macos、cli
- 风险：safe；权限：无额外权限

输入字段与约束：

```json
{
  "type": "object",
  "properties": {
    "text": {
      "type": "string",
      "maxLength": 1000000
    }
  },
  "required": [
    "text"
  ],
  "additionalProperties": false
}
```

输入示例：

```json
{
  "text": "a\nb\na"
}
```

实际示例输出：

```json
"a\nb"
```

## 行排序

- 标识：`text.lines.sort`
- 分类：Text
- 用途与限制：使用 Unicode 码点顺序排序。
- 平台：web、windows、linux、macos、cli
- 风险：safe；权限：无额外权限

输入字段与约束：

```json
{
  "type": "object",
  "properties": {
    "text": {
      "type": "string",
      "maxLength": 1000000
    }
  },
  "required": [
    "text"
  ],
  "additionalProperties": false
}
```

输入示例：

```json
{
  "text": "b\na"
}
```

实际示例输出：

```json
"a\nb"
```

## 倒序排列行

- 标识：`text.lines.reverse`
- 分类：Text
- 用途与限制：倒序排列文本行。
- 平台：web、windows、linux、macos、cli
- 风险：safe；权限：无额外权限

输入字段与约束：

```json
{
  "type": "object",
  "properties": {
    "text": {
      "type": "string",
      "maxLength": 1000000
    }
  },
  "required": [
    "text"
  ],
  "additionalProperties": false
}
```

输入示例：

```json
{
  "text": "a\nb"
}
```

实际示例输出：

```json
"b\na"
```

## 删除空白行

- 标识：`text.lines.nonempty`
- 分类：Text
- 用途与限制：删除内容为空或只有空格的行。
- 平台：web、windows、linux、macos、cli
- 风险：safe；权限：无额外权限

输入字段与约束：

```json
{
  "type": "object",
  "properties": {
    "text": {
      "type": "string",
      "maxLength": 1000000
    }
  },
  "required": [
    "text"
  ],
  "additionalProperties": false
}
```

输入示例：

```json
{
  "text": "a\n \nb"
}
```

实际示例输出：

```json
"a\nb"
```

## 文本统计

- 标识：`text.stats`
- 分类：Text
- 用途与限制：统计码点、UTF-8 字节、行和空白分隔词。
- 平台：web、windows、linux、macos、cli
- 风险：safe；权限：无额外权限

输入字段与约束：

```json
{
  "type": "object",
  "properties": {
    "text": {
      "type": "string",
      "maxLength": 1000000
    }
  },
  "required": [
    "text"
  ],
  "additionalProperties": false
}
```

输入示例：

```json
{
  "text": "你好 LR"
}
```

实际示例输出：

```json
{
  "codePoints": 5,
  "utf8Bytes": 9,
  "lines": 1,
  "words": 2
}
```

## 字面替换

- 标识：`text.replace`
- 分类：Text
- 用途与限制：替换所有字面匹配内容，不使用正则表达式。
- 平台：web、windows、linux、macos、cli
- 风险：safe；权限：无额外权限

输入字段与约束：

```json
{
  "type": "object",
  "properties": {
    "text": {
      "type": "string",
      "maxLength": 1000000
    },
    "search": {
      "type": "string",
      "maxLength": 10000
    },
    "replacement": {
      "type": "string",
      "maxLength": 1000000
    }
  },
  "required": [
    "text",
    "search",
    "replacement"
  ],
  "additionalProperties": false
}
```

输入示例：

```json
{
  "text": "hello LR",
  "search": "LR",
  "replacement": "世界"
}
```

实际示例输出：

```json
"hello 世界"
```

## Unicode 标准化

- 标识：`text.normalize`
- 分类：Text
- 用途与限制：将组合字符转换为 NFC 标准形式。
- 平台：web、windows、linux、macos、cli
- 风险：safe；权限：无额外权限

输入字段与约束：

```json
{
  "type": "object",
  "properties": {
    "text": {
      "type": "string",
      "maxLength": 1000000
    }
  },
  "required": [
    "text"
  ],
  "additionalProperties": false
}
```

输入示例：

```json
{
  "text": "é"
}
```

实际示例输出：

```json
"é"
```

## 统一换行

- 标识：`text.newlines.lf`
- 分类：Text
- 用途与限制：将 CRLF 和 CR 转换为 LF。
- 平台：web、windows、linux、macos、cli
- 风险：safe；权限：无额外权限

输入字段与约束：

```json
{
  "type": "object",
  "properties": {
    "text": {
      "type": "string",
      "maxLength": 1000000
    }
  },
  "required": [
    "text"
  ],
  "additionalProperties": false
}
```

输入示例：

```json
{
  "text": "a\r\nb\rc"
}
```

实际示例输出：

```json
"a\nb\nc"
```

## 添加行号

- 标识：`text.lines.number`
- 分类：Text
- 用途与限制：为每一行添加从 1 开始的编号。
- 平台：web、windows、linux、macos、cli
- 风险：safe；权限：无额外权限

输入字段与约束：

```json
{
  "type": "object",
  "properties": {
    "text": {
      "type": "string",
      "maxLength": 1000000
    }
  },
  "required": [
    "text"
  ],
  "additionalProperties": false
}
```

输入示例：

```json
{
  "text": "a\nb"
}
```

实际示例输出：

```json
"1. a\n2. b"
```

## HTML 转义

- 标识：`text.html.escape`
- 分类：Encoding
- 用途与限制：转义 HTML 特殊字符，结果作为纯文本展示。
- 平台：web、windows、linux、macos、cli
- 风险：safe；权限：无额外权限

输入字段与约束：

```json
{
  "type": "object",
  "properties": {
    "text": {
      "type": "string",
      "maxLength": 1000000
    }
  },
  "required": [
    "text"
  ],
  "additionalProperties": false
}
```

输入示例：

```json
{
  "text": "<b>&\""
}
```

实际示例输出：

```json
"&lt;b&gt;&amp;&quot;"
```

## Base64 编码

- 标识：`encoding.base64.encode`
- 分类：Encoding
- 用途与限制：UTF-8 文本编码为标准 Base64。
- 平台：web、windows、linux、macos、cli
- 风险：safe；权限：无额外权限

输入字段与约束：

```json
{
  "type": "object",
  "properties": {
    "text": {
      "type": "string",
      "maxLength": 1000000
    }
  },
  "required": [
    "text"
  ],
  "additionalProperties": false
}
```

输入示例：

```json
{
  "text": "你好"
}
```

实际示例输出：

```json
"5L2g5aW9"
```

## Base64 解码

- 标识：`encoding.base64.decode`
- 分类：Encoding
- 用途与限制：校验 Base64 并严格解码为 UTF-8。
- 平台：web、windows、linux、macos、cli
- 风险：safe；权限：无额外权限

输入字段与约束：

```json
{
  "type": "object",
  "properties": {
    "text": {
      "type": "string",
      "maxLength": 1000000
    }
  },
  "required": [
    "text"
  ],
  "additionalProperties": false
}
```

输入示例：

```json
{
  "text": "5L2g5aW9"
}
```

实际示例输出：

```json
"你好"
```

## 十六进制编码

- 标识：`encoding.hex.encode`
- 分类：Encoding
- 用途与限制：将 UTF-8 字节编码为十六进制。
- 平台：web、windows、linux、macos、cli
- 风险：safe；权限：无额外权限

输入字段与约束：

```json
{
  "type": "object",
  "properties": {
    "text": {
      "type": "string",
      "maxLength": 1000000
    }
  },
  "required": [
    "text"
  ],
  "additionalProperties": false
}
```

输入示例：

```json
{
  "text": "LR"
}
```

实际示例输出：

```json
"4c52"
```

## 十六进制解码

- 标识：`encoding.hex.decode`
- 分类：Encoding
- 用途与限制：校验十六进制并严格解码 UTF-8。
- 平台：web、windows、linux、macos、cli
- 风险：safe；权限：无额外权限

输入字段与约束：

```json
{
  "type": "object",
  "properties": {
    "text": {
      "type": "string",
      "maxLength": 1000000
    }
  },
  "required": [
    "text"
  ],
  "additionalProperties": false
}
```

输入示例：

```json
{
  "text": "4c52"
}
```

实际示例输出：

```json
"LR"
```

## URL 组件编码

- 标识：`encoding.uri.encode`
- 分类：Encoding
- 用途与限制：转义 URL 查询参数中的保留字符。
- 平台：web、windows、linux、macos、cli
- 风险：safe；权限：无额外权限

输入字段与约束：

```json
{
  "type": "object",
  "properties": {
    "text": {
      "type": "string",
      "maxLength": 1000000
    }
  },
  "required": [
    "text"
  ],
  "additionalProperties": false
}
```

输入示例：

```json
{
  "text": "你好 &"
}
```

实际示例输出：

```json
"%E4%BD%A0%E5%A5%BD%20%26"
```

## URL 组件解码

- 标识：`encoding.uri.decode`
- 分类：Encoding
- 用途与限制：解码百分号编码，不把加号转换为空格。
- 平台：web、windows、linux、macos、cli
- 风险：safe；权限：无额外权限

输入字段与约束：

```json
{
  "type": "object",
  "properties": {
    "text": {
      "type": "string",
      "maxLength": 1000000
    }
  },
  "required": [
    "text"
  ],
  "additionalProperties": false
}
```

输入示例：

```json
{
  "text": "%E4%BD%A0%E5%A5%BD"
}
```

实际示例输出：

```json
"你好"
```

## UTF-8 二进制

- 标识：`encoding.binary.encode`
- 分类：Encoding
- 用途与限制：将每个 UTF-8 字节编码为八位二进制。
- 平台：web、windows、linux、macos、cli
- 风险：safe；权限：无额外权限

输入字段与约束：

```json
{
  "type": "object",
  "properties": {
    "text": {
      "type": "string",
      "maxLength": 1000000
    }
  },
  "required": [
    "text"
  ],
  "additionalProperties": false
}
```

输入示例：

```json
{
  "text": "A"
}
```

实际示例输出：

```json
"01000001"
```

## 二进制解码

- 标识：`encoding.binary.decode`
- 分类：Encoding
- 用途与限制：严格解码空格分隔的八位二进制字节。
- 平台：web、windows、linux、macos、cli
- 风险：safe；权限：无额外权限

输入字段与约束：

```json
{
  "type": "object",
  "properties": {
    "text": {
      "type": "string",
      "maxLength": 1000000
    }
  },
  "required": [
    "text"
  ],
  "additionalProperties": false
}
```

输入示例：

```json
{
  "text": "01000001"
}
```

实际示例输出：

```json
"A"
```

## Unicode 码点

- 标识：`encoding.codepoints`
- 分类：Encoding
- 用途与限制：读取 Unicode 码点，包括 Emoji。
- 平台：web、windows、linux、macos、cli
- 风险：safe；权限：无额外权限

输入字段与约束：

```json
{
  "type": "object",
  "properties": {
    "text": {
      "type": "string",
      "maxLength": 1000000
    }
  },
  "required": [
    "text"
  ],
  "additionalProperties": false
}
```

输入示例：

```json
{
  "text": "LR"
}
```

实际示例输出：

```json
[
  "U+004C",
  "U+0052"
]
```

## JWT 查看

- 标识：`developer.jwt.inspect`
- 分类：Developer
- 用途与限制：解码 JWT 头与载荷；不验证签名或可信性。
- 平台：web、windows、linux、macos、cli
- 风险：safe；权限：无额外权限

输入字段与约束：

```json
{
  "type": "object",
  "properties": {
    "text": {
      "type": "string",
      "maxLength": 1000000
    }
  },
  "required": [
    "text"
  ],
  "additionalProperties": false
}
```

输入示例：

```json
{
  "text": "eyJhbGciOiJub25lIn0.eyJzdWIiOiJMUiJ9."
}
```

实际示例输出：

```json
{
  "header": {
    "alg": "none"
  },
  "payload": {
    "sub": "LR"
  },
  "signatureVerified": false
}
```

## JSON 格式化

- 标识：`json.format`
- 分类：JSON
- 用途与限制：校验并以两空格缩进 JSON；数字遵循 JS 精度。
- 平台：web、windows、linux、macos、cli
- 风险：safe；权限：无额外权限

输入字段与约束：

```json
{
  "type": "object",
  "properties": {
    "text": {
      "type": "string",
      "maxLength": 1000000
    }
  },
  "required": [
    "text"
  ],
  "additionalProperties": false
}
```

输入示例：

```json
{
  "text": "{\"a\":1}"
}
```

实际示例输出：

```json
"{\n  \"a\": 1\n}"
```

## JSON 压缩

- 标识：`json.minify`
- 分类：JSON
- 用途与限制：校验并移除 JSON 非必要空白。
- 平台：web、windows、linux、macos、cli
- 风险：safe；权限：无额外权限

输入字段与约束：

```json
{
  "type": "object",
  "properties": {
    "text": {
      "type": "string",
      "maxLength": 1000000
    }
  },
  "required": [
    "text"
  ],
  "additionalProperties": false
}
```

输入示例：

```json
{
  "text": "{ \"a\": 1 }"
}
```

实际示例输出：

```json
"{\"a\":1}"
```

## JSON 校验

- 标识：`json.validate`
- 分类：JSON
- 用途与限制：验证 JSON 语法，格式错误时返回统一错误。
- 平台：web、windows、linux、macos、cli
- 风险：safe；权限：无额外权限

输入字段与约束：

```json
{
  "type": "object",
  "properties": {
    "text": {
      "type": "string",
      "maxLength": 1000000
    }
  },
  "required": [
    "text"
  ],
  "additionalProperties": false
}
```

输入示例：

```json
{
  "text": "[1,2]"
}
```

实际示例输出：

```json
{
  "valid": true,
  "type": "array"
}
```

## JSON 键列表

- 标识：`json.keys`
- 分类：JSON
- 用途与限制：读取对象顶层键名。
- 平台：web、windows、linux、macos、cli
- 风险：safe；权限：无额外权限

输入字段与约束：

```json
{
  "type": "object",
  "properties": {
    "text": {
      "type": "string",
      "maxLength": 1000000
    }
  },
  "required": [
    "text"
  ],
  "additionalProperties": false
}
```

输入示例：

```json
{
  "text": "{\"a\":1,\"b\":2}"
}
```

实际示例输出：

```json
[
  "a",
  "b"
]
```

## JSON 键排序

- 标识：`json.sort`
- 分类：JSON
- 用途与限制：递归排序对象键，保留数组顺序。
- 平台：web、windows、linux、macos、cli
- 风险：safe；权限：无额外权限

输入字段与约束：

```json
{
  "type": "object",
  "properties": {
    "text": {
      "type": "string",
      "maxLength": 1000000
    }
  },
  "required": [
    "text"
  ],
  "additionalProperties": false
}
```

输入示例：

```json
{
  "text": "{\"b\":2,\"a\":1}"
}
```

实际示例输出：

```json
"{\n  \"a\": 1,\n  \"b\": 2\n}"
```

## JSON Pointer 查询

- 标识：`json.pointer`
- 分类：JSON
- 用途与限制：通过 RFC 6901 Pointer 查询，支持 ~0 和 ~1。
- 平台：web、windows、linux、macos、cli
- 风险：safe；权限：无额外权限

输入字段与约束：

```json
{
  "type": "object",
  "properties": {
    "text": {
      "type": "string",
      "maxLength": 1000000
    },
    "pointer": {
      "type": "string",
      "maxLength": 1000000
    }
  },
  "required": [
    "text",
    "pointer"
  ],
  "additionalProperties": false
}
```

输入示例：

```json
{
  "text": "{\"a/b\":[42]}",
  "pointer": "/a~1b/0"
}
```

实际示例输出：

```json
{
  "value": 42
}
```

## JSON 转 NDJSON

- 标识：`json.array.ndjson`
- 分类：JSON
- 用途与限制：将顶层数组转换为每行一个 JSON 值。
- 平台：web、windows、linux、macos、cli
- 风险：safe；权限：无额外权限

输入字段与约束：

```json
{
  "type": "object",
  "properties": {
    "text": {
      "type": "string",
      "maxLength": 1000000
    }
  },
  "required": [
    "text"
  ],
  "additionalProperties": false
}
```

输入示例：

```json
{
  "text": "[1,{\"a\":2}]"
}
```

实际示例输出：

```json
"1\n{\"a\":2}"
```

## NDJSON 转 JSON

- 标识：`json.ndjson.array`
- 分类：JSON
- 用途与限制：逐行校验并转换为 JSON 数组，跳过空行。
- 平台：web、windows、linux、macos、cli
- 风险：safe；权限：无额外权限

输入字段与约束：

```json
{
  "type": "object",
  "properties": {
    "text": {
      "type": "string",
      "maxLength": 1000000
    }
  },
  "required": [
    "text"
  ],
  "additionalProperties": false
}
```

输入示例：

```json
{
  "text": "1\n{\"a\":2}"
}
```

实际示例输出：

```json
"[\n  1,\n  {\n    \"a\": 2\n  }\n]"
```

## URL 解析

- 标识：`url.parse`
- 分类：Developer
- 用途与限制：解析绝对 URL 的协议、主机、端口与参数。
- 平台：web、windows、linux、macos、cli
- 风险：safe；权限：无额外权限

输入字段与约束：

```json
{
  "type": "object",
  "properties": {
    "text": {
      "type": "string",
      "maxLength": 1000000
    }
  },
  "required": [
    "text"
  ],
  "additionalProperties": false
}
```

输入示例：

```json
{
  "text": "https://example.com/a?q=LR"
}
```

实际示例输出：

```json
{
  "protocol": "https:",
  "hostname": "example.com",
  "port": "",
  "pathname": "/a",
  "search": "?q=LR",
  "hash": "",
  "parameters": [
    {
      "key": "q",
      "value": "LR"
    }
  ]
}
```

## 查询参数解析

- 标识：`url.query.parse`
- 分类：Developer
- 用途与限制：保留重复参数和空值。
- 平台：web、windows、linux、macos、cli
- 风险：safe；权限：无额外权限

输入字段与约束：

```json
{
  "type": "object",
  "properties": {
    "text": {
      "type": "string",
      "maxLength": 1000000
    }
  },
  "required": [
    "text"
  ],
  "additionalProperties": false
}
```

输入示例：

```json
{
  "text": "a=1&a=2"
}
```

实际示例输出：

```json
{
  "entries": [
    {
      "key": "a",
      "value": "1"
    },
    {
      "key": "a",
      "value": "2"
    }
  ]
}
```

## 构建查询参数

- 标识：`url.query.build`
- 分类：Developer
- 用途与限制：JSON 对象的字符串值编码为查询参数。
- 平台：web、windows、linux、macos、cli
- 风险：safe；权限：无额外权限

输入字段与约束：

```json
{
  "type": "object",
  "properties": {
    "text": {
      "type": "string",
      "maxLength": 1000000
    }
  },
  "required": [
    "text"
  ],
  "additionalProperties": false
}
```

输入示例：

```json
{
  "text": "{\"q\":\"你好\"}"
}
```

实际示例输出：

```json
"q=%E4%BD%A0%E5%A5%BD"
```

## 日期转时间戳

- 标识：`time.iso.timestamp`
- 分类：Time
- 用途与限制：ISO 日期转换为 Unix 秒（包含小数）。
- 平台：web、windows、linux、macos、cli
- 风险：safe；权限：无额外权限

输入字段与约束：

```json
{
  "type": "object",
  "properties": {
    "text": {
      "type": "string",
      "maxLength": 1000000
    }
  },
  "required": [
    "text"
  ],
  "additionalProperties": false
}
```

输入示例：

```json
{
  "text": "1970-01-01T00:00:01Z"
}
```

实际示例输出：

```json
1
```

## 时间戳转日期

- 标识：`time.timestamp.iso`
- 分类：Time
- 用途与限制：Unix 秒转换为 UTC ISO 日期。
- 平台：web、windows、linux、macos、cli
- 风险：safe；权限：无额外权限

输入字段与约束：

```json
{
  "type": "object",
  "properties": {
    "seconds": {
      "type": "number",
      "minimum": -8640000000000,
      "maximum": 8640000000000
    }
  },
  "required": [
    "seconds"
  ],
  "additionalProperties": false
}
```

输入示例：

```json
{
  "seconds": 0
}
```

实际示例输出：

```json
"1970-01-01T00:00:00.000Z"
```

## 日期差值

- 标识：`time.difference`
- 分类：Time
- 用途与限制：计算带时区 ISO 日期之间的秒数。
- 平台：web、windows、linux、macos、cli
- 风险：safe；权限：无额外权限

输入字段与约束：

```json
{
  "type": "object",
  "properties": {
    "start": {
      "type": "string",
      "maxLength": 1000000
    },
    "end": {
      "type": "string",
      "maxLength": 1000000
    }
  },
  "required": [
    "start",
    "end"
  ],
  "additionalProperties": false
}
```

输入示例：

```json
{
  "start": "2026-01-01T00:00:00Z",
  "end": "2026-01-02T00:00:00Z"
}
```

实际示例输出：

```json
86400
```

## HEX 转 RGB

- 标识：`color.hex.rgb`
- 分类：Colors
- 用途与限制：解析六位 HEX 颜色。
- 平台：web、windows、linux、macos、cli
- 风险：safe；权限：无额外权限

输入字段与约束：

```json
{
  "type": "object",
  "properties": {
    "text": {
      "type": "string",
      "maxLength": 1000000
    }
  },
  "required": [
    "text"
  ],
  "additionalProperties": false
}
```

输入示例：

```json
{
  "text": "#74E0B8"
}
```

实际示例输出：

```json
{
  "r": 116,
  "g": 224,
  "b": 184
}
```

## RGB 转 HEX

- 标识：`color.rgb.hex`
- 分类：Colors
- 用途与限制：RGB 整数转换为 HEX 颜色。
- 平台：web、windows、linux、macos、cli
- 风险：safe；权限：无额外权限

输入字段与约束：

```json
{
  "type": "object",
  "properties": {
    "r": {
      "type": "integer",
      "minimum": 0,
      "maximum": 255
    },
    "g": {
      "type": "integer",
      "minimum": 0,
      "maximum": 255
    },
    "b": {
      "type": "integer",
      "minimum": 0,
      "maximum": 255
    }
  },
  "required": [
    "r",
    "g",
    "b"
  ],
  "additionalProperties": false
}
```

输入示例：

```json
{
  "r": 116,
  "g": 224,
  "b": 184
}
```

实际示例输出：

```json
"#74E0B8"
```

## 颜色对比度

- 标识：`color.contrast`
- 分类：Colors
- 用途与限制：计算 WCAG 2.x sRGB 相对亮度对比度。
- 平台：web、windows、linux、macos、cli
- 风险：safe；权限：无额外权限

输入字段与约束：

```json
{
  "type": "object",
  "properties": {
    "foreground": {
      "type": "string",
      "maxLength": 1000000
    },
    "background": {
      "type": "string",
      "maxLength": 1000000
    }
  },
  "required": [
    "foreground",
    "background"
  ],
  "additionalProperties": false
}
```

输入示例：

```json
{
  "foreground": "#000000",
  "background": "#FFFFFF"
}
```

实际示例输出：

```json
{
  "ratio": 21,
  "aaNormal": true,
  "aaaNormal": true
}
```

## UUID v4

- 标识：`developer.uuid.v4`
- 分类：Developer
- 用途与限制：使用加密安全随机数生成 UUID；输入为生成数量。
- 平台：web、windows、linux、macos、cli
- 风险：safe；权限：无额外权限

输入字段与约束：

```json
{
  "type": "object",
  "properties": {
    "count": {
      "type": "integer",
      "minimum": 1,
      "maximum": 100
    }
  },
  "required": [
    "count"
  ],
  "additionalProperties": false
}
```

输入示例：

```json
{
  "count": 1
}
```

实际示例输出：

```json
[
  "01bc69db-6fc1-46d8-b203-f3ab1e56f66d"
]
```

## SHA-256

- 标识：`hash.sha256`
- 分类：Hash
- 用途与限制：计算 UTF-8 文本 SHA-256，不适用于密码存储。
- 平台：web、windows、linux、macos、cli
- 风险：safe；权限：无额外权限

输入字段与约束：

```json
{
  "type": "object",
  "properties": {
    "text": {
      "type": "string",
      "maxLength": 1000000
    }
  },
  "required": [
    "text"
  ],
  "additionalProperties": false
}
```

输入示例：

```json
{
  "text": "abc"
}
```

实际示例输出：

```json
"ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad"
```

## SHA-384

- 标识：`hash.sha384`
- 分类：Hash
- 用途与限制：计算 UTF-8 文本 SHA-384。
- 平台：web、windows、linux、macos、cli
- 风险：safe；权限：无额外权限

输入字段与约束：

```json
{
  "type": "object",
  "properties": {
    "text": {
      "type": "string",
      "maxLength": 1000000
    }
  },
  "required": [
    "text"
  ],
  "additionalProperties": false
}
```

输入示例：

```json
{
  "text": "abc"
}
```

实际示例输出：

```json
"cb00753f45a35e8bb5a03d699ac65007272c32ab0eded1631a8b605a43ff5bed8086072ba1e7cc2358baeca134c825a7"
```

## SHA-512

- 标识：`hash.sha512`
- 分类：Hash
- 用途与限制：计算 UTF-8 文本 SHA-512。
- 平台：web、windows、linux、macos、cli
- 风险：safe；权限：无额外权限

输入字段与约束：

```json
{
  "type": "object",
  "properties": {
    "text": {
      "type": "string",
      "maxLength": 1000000
    }
  },
  "required": [
    "text"
  ],
  "additionalProperties": false
}
```

输入示例：

```json
{
  "text": "abc"
}
```

实际示例输出：

```json
"ddaf35a193617abacc417349ae20413112e6fa4e89a97ea20a9eeee64b55d39a2192992a274fc1a836ba3c23a3feebbd454d4423643ce80e2a9ac94fa54ca49f"
```

## 数列统计

- 标识：`math.statistics`
- 分类：Math
- 用途与限制：计算逗号分隔数列的总和、均值、中位数、总体方差。
- 平台：web、windows、linux、macos、cli
- 风险：safe；权限：无额外权限

输入字段与约束：

```json
{
  "type": "object",
  "properties": {
    "text": {
      "type": "string",
      "maxLength": 1000000
    }
  },
  "required": [
    "text"
  ],
  "additionalProperties": false
}
```

输入示例：

```json
{
  "text": "1,2,3"
}
```

实际示例输出：

```json
{
  "count": 3,
  "sum": 6,
  "mean": 2,
  "median": 2,
  "min": 1,
  "max": 3,
  "populationVariance": 0.6666666666666666
}
```

## 最大公约数

- 标识：`math.gcd`
- 分类：Math
- 用途与限制：欧几里得算法，要求安全整数。
- 平台：web、windows、linux、macos、cli
- 风险：safe；权限：无额外权限

输入字段与约束：

```json
{
  "type": "object",
  "properties": {
    "a": {
      "type": "integer",
      "minimum": -9007199254740991,
      "maximum": 9007199254740991
    },
    "b": {
      "type": "integer",
      "minimum": -9007199254740991,
      "maximum": 9007199254740991
    }
  },
  "required": [
    "a",
    "b"
  ],
  "additionalProperties": false
}
```

输入示例：

```json
{
  "a": 48,
  "b": 18
}
```

实际示例输出：

```json
6
```

## 最小公倍数

- 标识：`math.lcm`
- 分类：Math
- 用途与限制：计算两个安全整数的最小公倍数，溢出时报告错误。
- 平台：web、windows、linux、macos、cli
- 风险：safe；权限：无额外权限

输入字段与约束：

```json
{
  "type": "object",
  "properties": {
    "a": {
      "type": "integer",
      "minimum": -9007199254740991,
      "maximum": 9007199254740991
    },
    "b": {
      "type": "integer",
      "minimum": -9007199254740991,
      "maximum": 9007199254740991
    }
  },
  "required": [
    "a",
    "b"
  ],
  "additionalProperties": false
}
```

输入示例：

```json
{
  "a": 12,
  "b": 18
}
```

实际示例输出：

```json
36
```

## 进制转换

- 标识：`numbers.base.convert`
- 分类：Numbers
- 用途与限制：转换 2–36 进制整数，使用 BigInt 保持精度。
- 平台：web、windows、linux、macos、cli
- 风险：safe；权限：无额外权限

输入字段与约束：

```json
{
  "type": "object",
  "properties": {
    "text": {
      "type": "string",
      "maxLength": 10000
    },
    "from": {
      "type": "integer",
      "minimum": 2,
      "maximum": 36
    },
    "to": {
      "type": "integer",
      "minimum": 2,
      "maximum": 36
    }
  },
  "required": [
    "text",
    "from",
    "to"
  ],
  "additionalProperties": false
}
```

输入示例：

```json
{
  "text": "ff",
  "from": 16,
  "to": 2
}
```

实际示例输出：

```json
"11111111"
```

## 一元二次方程

- 标识：`math.quadratic`
- 分类：Math
- 用途与限制：求实数域根，负判别式时给出说明。
- 平台：web、windows、linux、macos、cli
- 风险：safe；权限：无额外权限

输入字段与约束：

```json
{
  "type": "object",
  "properties": {
    "a": {
      "type": "number",
      "minimum": -1e+100,
      "maximum": 1e+100
    },
    "b": {
      "type": "number",
      "minimum": -1e+100,
      "maximum": 1e+100
    },
    "c": {
      "type": "number",
      "minimum": -1e+100,
      "maximum": 1e+100
    }
  },
  "required": [
    "a",
    "b",
    "c"
  ],
  "additionalProperties": false
}
```

输入示例：

```json
{
  "a": 1,
  "b": -3,
  "c": 2
}
```

实际示例输出：

```json
{
  "discriminant": 1,
  "realRoots": [
    1,
    2
  ]
}
```

## 温度换算

- 标识：`units.temperature`
- 分类：Units
- 用途与限制：摄氏度转换为华氏度与开尔文，禁止低于绝对零度。
- 平台：web、windows、linux、macos、cli
- 风险：safe；权限：无额外权限

输入字段与约束：

```json
{
  "type": "object",
  "properties": {
    "celsius": {
      "type": "number",
      "minimum": -273.15,
      "maximum": 1e+100
    }
  },
  "required": [
    "celsius"
  ],
  "additionalProperties": false
}
```

输入示例：

```json
{
  "celsius": 0
}
```

实际示例输出：

```json
{
  "celsius": 0,
  "fahrenheit": 32,
  "kelvin": 273.15
}
```

## 长度换算

- 标识：`units.length`
- 分类：Units
- 用途与限制：米换算为厘米、毫米、英寸、英尺和千米。
- 平台：web、windows、linux、macos、cli
- 风险：safe；权限：无额外权限

输入字段与约束：

```json
{
  "type": "object",
  "properties": {
    "meters": {
      "type": "number",
      "minimum": 0,
      "maximum": 1e+100
    }
  },
  "required": [
    "meters"
  ],
  "additionalProperties": false
}
```

输入示例：

```json
{
  "meters": 1
}
```

实际示例输出：

```json
{
  "meters": 1,
  "centimeters": 100,
  "millimeters": 1000,
  "inches": 39.37007874015748,
  "feet": 3.280839895013123,
  "kilometers": 0.001
}
```

## 存储大小换算

- 标识：`units.bytes`
- 分类：Units
- 用途与限制：字节换算 SI 与 IEC 单位。
- 平台：web、windows、linux、macos、cli
- 风险：safe；权限：无额外权限

输入字段与约束：

```json
{
  "type": "object",
  "properties": {
    "bytes": {
      "type": "number",
      "minimum": 0,
      "maximum": 1e+100
    }
  },
  "required": [
    "bytes"
  ],
  "additionalProperties": false
}
```

输入示例：

```json
{
  "bytes": 1024
}
```

实际示例输出：

```json
{
  "bytes": 1024,
  "kB": 1.024,
  "MB": 0.001024,
  "GB": 0.000001024,
  "KiB": 1,
  "MiB": 0.0009765625,
  "GiB": 9.5367431640625e-7
}
```

## 压力换算

- 标识：`units.pressure`
- 分类：Units
- 用途与限制：帕斯卡换算 bar、atm、psi。
- 平台：web、windows、linux、macos、cli
- 风险：safe；权限：无额外权限

输入字段与约束：

```json
{
  "type": "object",
  "properties": {
    "pascals": {
      "type": "number",
      "minimum": 0,
      "maximum": 1e+100
    }
  },
  "required": [
    "pascals"
  ],
  "additionalProperties": false
}
```

输入示例：

```json
{
  "pascals": 101325
}
```

实际示例输出：

```json
{
  "pascals": 101325,
  "bar": 1.01325,
  "atm": 1,
  "psi": 14.69594877551422
}
```

## 质量换算

- 标识：`units.mass`
- 分类：Units
- 用途与限制：千克换算克、吨、磅和盎司。
- 平台：web、windows、linux、macos、cli
- 风险：safe；权限：无额外权限

输入字段与约束：

```json
{
  "type": "object",
  "properties": {
    "kilograms": {
      "type": "number",
      "minimum": 0,
      "maximum": 1e+100
    }
  },
  "required": [
    "kilograms"
  ],
  "additionalProperties": false
}
```

输入示例：

```json
{
  "kilograms": 1
}
```

实际示例输出：

```json
{
  "grams": 1000,
  "tonnes": 0.001,
  "pounds": 2.2046226218487757,
  "ounces": 35.27396194958041
}
```

## 罗马数字

- 标识：`numbers.roman`
- 分类：Numbers
- 用途与限制：将 1–3999 整数转换为罗马数字。
- 平台：web、windows、linux、macos、cli
- 风险：safe；权限：无额外权限

输入字段与约束：

```json
{
  "type": "object",
  "properties": {
    "value": {
      "type": "integer",
      "minimum": 1,
      "maximum": 3999
    }
  },
  "required": [
    "value"
  ],
  "additionalProperties": false
}
```

输入示例：

```json
{
  "value": 2026
}
```

实际示例输出：

```json
"MMXXVI"
```

## 百分比变化

- 标识：`numbers.percent`
- 分类：Numbers
- 用途与限制：计算初值到终值的百分比变化，初值不能为零。
- 平台：web、windows、linux、macos、cli
- 风险：safe；权限：无额外权限

输入字段与约束：

```json
{
  "type": "object",
  "properties": {
    "initial": {
      "type": "number",
      "minimum": -1e+100,
      "maximum": 1e+100
    },
    "final": {
      "type": "number",
      "minimum": -1e+100,
      "maximum": 1e+100
    }
  },
  "required": [
    "initial",
    "final"
  ],
  "additionalProperties": false
}
```

输入示例：

```json
{
  "initial": 100,
  "final": 125
}
```

实际示例输出：

```json
25
```

## CSV 转 JSON

- 标识：`csv.to.json`
- 分类：CSV
- 用途与限制：首行作表头，按 RFC 4180 解析；字段保留为字符串。
- 平台：web、windows、linux、macos、cli
- 风险：safe；权限：无额外权限

输入字段与约束：

```json
{
  "type": "object",
  "properties": {
    "text": {
      "type": "string",
      "maxLength": 1000000
    }
  },
  "required": [
    "text"
  ],
  "additionalProperties": false
}
```

输入示例：

```json
{
  "text": "name,note\nLR,\"hello, world\""
}
```

实际示例输出：

```json
{
  "rows": [
    {
      "name": "LR",
      "note": "hello, world"
    }
  ]
}
```

## JSON 转 CSV

- 标识：`csv.from.json`
- 分类：CSV
- 用途与限制：将对象数组转换为带转义的 CSV；键按首次出现排序。
- 平台：web、windows、linux、macos、cli
- 风险：safe；权限：无额外权限

输入字段与约束：

```json
{
  "type": "object",
  "properties": {
    "text": {
      "type": "string",
      "maxLength": 1000000
    }
  },
  "required": [
    "text"
  ],
  "additionalProperties": false
}
```

输入示例：

```json
{
  "text": "[{\"name\":\"LR\",\"value\":2}]"
}
```

实际示例输出：

```json
"name,value\r\nLR,2"
```

## CSV 行列转置

- 标识：`csv.transpose`
- 分类：CSV
- 用途与限制：交换 CSV 行与列，支持带引号的字段。最多 256 行列。
- 平台：web、windows、linux、macos、cli
- 风险：safe；权限：无额外权限

输入字段与约束：

```json
{
  "type": "object",
  "properties": {
    "text": {
      "type": "string",
      "maxLength": 1000000
    }
  },
  "required": [
    "text"
  ],
  "additionalProperties": false
}
```

输入示例：

```json
{
  "text": "a,b\nc,d"
}
```

实际示例输出：

```json
"a,c\r\nb,d"
```

## CSV 数据概览

- 标识：`csv.stats`
- 分类：CSV
- 用途与限制：统计记录、列数、空单元格与列宽一致性。含表头行。
- 平台：web、windows、linux、macos、cli
- 风险：safe；权限：无额外权限

输入字段与约束：

```json
{
  "type": "object",
  "properties": {
    "text": {
      "type": "string",
      "maxLength": 1000000
    }
  },
  "required": [
    "text"
  ],
  "additionalProperties": false
}
```

输入示例：

```json
{
  "text": "a,b\n1,"
}
```

实际示例输出：

```json
{
  "rows": 2,
  "columns": 2,
  "emptyCells": 1,
  "rectangular": true
}
```

## 语义版本解析

- 标识：`semver.parse`
- 分类：Developer
- 用途与限制：校验 SemVer 2.0 并拆分主次版本、预发布与构建标识。
- 平台：web、windows、linux、macos、cli
- 风险：safe；权限：无额外权限

输入字段与约束：

```json
{
  "type": "object",
  "properties": {
    "text": {
      "type": "string",
      "maxLength": 1000000
    }
  },
  "required": [
    "text"
  ],
  "additionalProperties": false
}
```

输入示例：

```json
{
  "text": "1.2.3-beta.1+build.7"
}
```

实际示例输出：

```json
{
  "major": 1,
  "minor": 2,
  "patch": 3,
  "prerelease": "beta.1",
  "build": "build.7"
}
```

## 语义版本比较

- 标识：`semver.compare`
- 分类：Developer
- 用途与限制：按 SemVer 优先级比较，返回 -1、0 或 1；忽略构建标识。
- 平台：web、windows、linux、macos、cli
- 风险：safe；权限：无额外权限

输入字段与约束：

```json
{
  "type": "object",
  "properties": {
    "a": {
      "type": "string",
      "maxLength": 1000000
    },
    "b": {
      "type": "string",
      "maxLength": 1000000
    }
  },
  "required": [
    "a",
    "b"
  ],
  "additionalProperties": false
}
```

输入示例：

```json
{
  "a": "1.0.0-beta.2",
  "b": "1.0.0-beta.11"
}
```

实际示例输出：

```json
-1
```

## 版本号递增

- 标识：`semver.bump`
- 分类：Developer
- 用途与限制：递增 major、minor 或 patch，并移除预发布与构建标识。
- 平台：web、windows、linux、macos、cli
- 风险：safe；权限：无额外权限

输入字段与约束：

```json
{
  "type": "object",
  "properties": {
    "text": {
      "type": "string",
      "maxLength": 1000000
    },
    "part": {
      "type": "string",
      "enum": [
        "major",
        "minor",
        "patch"
      ]
    }
  },
  "required": [
    "text",
    "part"
  ],
  "additionalProperties": false
}
```

输入示例：

```json
{
  "text": "1.2.3-beta",
  "part": "minor"
}
```

实际示例输出：

```json
"1.3.0"
```

## 环境变量解析

- 标识：`dotenv.parse`
- 分类：Developer
- 用途与限制：解析单行 dotenv、export 与引号；不展开变量，不执行命令。
- 平台：web、windows、linux、macos、cli
- 风险：safe；权限：无额外权限

输入字段与约束：

```json
{
  "type": "object",
  "properties": {
    "text": {
      "type": "string",
      "maxLength": 1000000
    }
  },
  "required": [
    "text"
  ],
  "additionalProperties": false
}
```

输入示例：

```json
{
  "text": "PORT=3000\nNAME=\"LR Toolbox\""
}
```

实际示例输出：

```json
{
  "PORT": "3000",
  "NAME": "LR Toolbox"
}
```

## 生成环境变量文件

- 标识：`dotenv.format`
- 分类：Developer
- 用途与限制：将字符串值 JSON 对象转换为带引号的 dotenv。
- 平台：web、windows、linux、macos、cli
- 风险：safe；权限：无额外权限

输入字段与约束：

```json
{
  "type": "object",
  "properties": {
    "text": {
      "type": "string",
      "maxLength": 1000000
    }
  },
  "required": [
    "text"
  ],
  "additionalProperties": false
}
```

输入示例：

```json
{
  "text": "{\"PORT\":\"3000\"}"
}
```

实际示例输出：

```json
"PORT=\"3000\""
```

## HTTP 请求头解析

- 标识：`http.headers.parse`
- 分类：Developer
- 用途与限制：解析逐行请求头，重复字段保留数组；不发起请求。
- 平台：web、windows、linux、macos、cli
- 风险：safe；权限：无额外权限

输入字段与约束：

```json
{
  "type": "object",
  "properties": {
    "text": {
      "type": "string",
      "maxLength": 1000000
    }
  },
  "required": [
    "text"
  ],
  "additionalProperties": false
}
```

输入示例：

```json
{
  "text": "Content-Type: application/json\nX-Tag: a\nX-Tag: b"
}
```

实际示例输出：

```json
{
  "content-type": [
    "application/json"
  ],
  "x-tag": [
    "a",
    "b"
  ]
}
```

## Cookie 字段解析

- 标识：`http.cookie.parse`
- 分类：Developer
- 用途与限制：解析 Cookie 请求头；保留重复名称，不解码或发送内容。
- 平台：web、windows、linux、macos、cli
- 风险：safe；权限：无额外权限

输入字段与约束：

```json
{
  "type": "object",
  "properties": {
    "text": {
      "type": "string",
      "maxLength": 1000000
    }
  },
  "required": [
    "text"
  ],
  "additionalProperties": false
}
```

输入示例：

```json
{
  "text": "session=abc; theme=dark"
}
```

实际示例输出：

```json
{
  "cookies": [
    {
      "name": "session",
      "value": "abc"
    },
    {
      "name": "theme",
      "value": "dark"
    }
  ]
}
```

## Basic Auth 编码

- 标识：`http.basic.encode`
- 分类：Developer
- 用途与限制：UTF-8 编码用户名与密码，仅本地生成授权字段。
- 平台：web、windows、linux、macos、cli
- 风险：safe；权限：无额外权限

输入字段与约束：

```json
{
  "type": "object",
  "properties": {
    "username": {
      "type": "string",
      "maxLength": 1000000
    },
    "password": {
      "type": "string",
      "maxLength": 1000000
    }
  },
  "required": [
    "username",
    "password"
  ],
  "additionalProperties": false
}
```

输入示例：

```json
{
  "username": "LR",
  "password": "demo"
}
```

实际示例输出：

```json
"Basic TFI6ZGVtbw=="
```

## Basic Auth 解码

- 标识：`http.basic.decode`
- 分类：Developer
- 用途与限制：本地解码 Basic 授权字段，不保存账号内容。
- 平台：web、windows、linux、macos、cli
- 风险：safe；权限：无额外权限

输入字段与约束：

```json
{
  "type": "object",
  "properties": {
    "text": {
      "type": "string",
      "maxLength": 1000000
    }
  },
  "required": [
    "text"
  ],
  "additionalProperties": false
}
```

输入示例：

```json
{
  "text": "Basic TFI6ZGVtbw=="
}
```

实际示例输出：

```json
{
  "username": "LR",
  "password": "demo"
}
```

## UUID 信息查看

- 标识：`developer.uuid.inspect`
- 分类：Developer
- 用途与限制：校验标准 UUID 格式，显示版本与变体；不查询外部服务。
- 平台：web、windows、linux、macos、cli
- 风险：safe；权限：无额外权限

输入字段与约束：

```json
{
  "type": "object",
  "properties": {
    "text": {
      "type": "string",
      "maxLength": 1000000
    }
  },
  "required": [
    "text"
  ],
  "additionalProperties": false
}
```

输入示例：

```json
{
  "text": "550e8400-e29b-41d4-a716-446655440000"
}
```

实际示例输出：

```json
{
  "canonical": "550e8400-e29b-41d4-a716-446655440000",
  "version": 4,
  "variant": "RFC 9562",
  "nil": false
}
```

## CSV 选择列

- 标识：`csv.select`
- 分类：CSV
- 用途与限制：按 JSON 数组指定列名和顺序，保留引号与换行字段。
- 平台：web、windows、linux、macos、cli
- 风险：safe；权限：无额外权限

输入字段与约束：

```json
{
  "type": "object",
  "properties": {
    "text": {
      "type": "string",
      "maxLength": 1000000,
      "title": "CSV 原始数据"
    },
    "columns": {
      "type": "string",
      "maxLength": 1000000,
      "title": "列名（JSON 数组）"
    }
  },
  "required": [
    "text",
    "columns"
  ],
  "additionalProperties": false
}
```

输入示例：

```json
{
  "text": "name,city,score\nLR,Lanzhou,90",
  "columns": "[\"name\",\"score\"]"
}
```

实际示例输出：

```json
"name,score\r\nLR,90"
```

## CSV 条件筛选

- 标识：`csv.filter`
- 分类：CSV
- 用途与限制：按列精确匹配、包含、空值或数值大小筛选；数值比较拒绝非法数字。
- 平台：web、windows、linux、macos、cli
- 风险：safe；权限：无额外权限

输入字段与约束：

```json
{
  "type": "object",
  "properties": {
    "text": {
      "type": "string",
      "maxLength": 1000000,
      "title": "CSV 原始数据"
    },
    "column": {
      "type": "string",
      "maxLength": 1000000,
      "title": "目标列名"
    },
    "operator": {
      "title": "筛选条件",
      "type": "string",
      "enum": [
        "equals",
        "not_equals",
        "contains",
        "empty",
        "not_empty",
        "greater",
        "less"
      ]
    },
    "value": {
      "type": "string",
      "maxLength": 1000000,
      "title": "比较值"
    }
  },
  "required": [
    "text",
    "column",
    "operator",
    "value"
  ],
  "additionalProperties": false
}
```

输入示例：

```json
{
  "text": "name,score\nLR,90\nAlex,70",
  "column": "score",
  "operator": "greater",
  "value": "80"
}
```

实际示例输出：

```json
"name,score\r\nLR,90"
```

## CSV 稳定排序

- 标识：`csv.sort`
- 分类：CSV
- 用途与限制：按列文本或数值稳定排序；文本按字符序，数值模式拒绝空值。
- 平台：web、windows、linux、macos、cli
- 风险：safe；权限：无额外权限

输入字段与约束：

```json
{
  "type": "object",
  "properties": {
    "text": {
      "type": "string",
      "maxLength": 1000000,
      "title": "CSV 原始数据"
    },
    "column": {
      "type": "string",
      "maxLength": 1000000,
      "title": "目标列名"
    },
    "mode": {
      "title": "排序方式",
      "type": "string",
      "enum": [
        "text",
        "number"
      ]
    },
    "direction": {
      "title": "排序方向",
      "type": "string",
      "enum": [
        "asc",
        "desc"
      ]
    }
  },
  "required": [
    "text",
    "column",
    "mode",
    "direction"
  ],
  "additionalProperties": false
}
```

输入示例：

```json
{
  "text": "name,score\nLR,90\nAlex,100",
  "column": "score",
  "mode": "number",
  "direction": "desc"
}
```

实际示例输出：

```json
"name,score\r\nAlex,100\r\nLR,90"
```

## CSV 按列去重

- 标识：`csv.unique`
- 分类：CSV
- 用途与限制：按指定列去重并保留首条记录；列名填 [] 时按整行去重。
- 平台：web、windows、linux、macos、cli
- 风险：safe；权限：无额外权限

输入字段与约束：

```json
{
  "type": "object",
  "properties": {
    "text": {
      "type": "string",
      "maxLength": 1000000,
      "title": "CSV 原始数据"
    },
    "columns": {
      "type": "string",
      "maxLength": 1000000,
      "title": "列名（JSON 数组）"
    }
  },
  "required": [
    "text",
    "columns"
  ],
  "additionalProperties": false
}
```

输入示例：

```json
{
  "text": "id,name\n1,LR\n1,Alex\n2,Sam",
  "columns": "[\"id\"]"
}
```

实际示例输出：

```json
"id,name\r\n1,LR\r\n2,Sam"
```

## CSV 重命名列

- 标识：`csv.rename`
- 分类：CSV
- 用途与限制：修改指定表头，拒绝空名称和重复名称，不修改数据。
- 平台：web、windows、linux、macos、cli
- 风险：safe；权限：无额外权限

输入字段与约束：

```json
{
  "type": "object",
  "properties": {
    "text": {
      "type": "string",
      "maxLength": 1000000,
      "title": "CSV 原始数据"
    },
    "column": {
      "type": "string",
      "maxLength": 1000000,
      "title": "目标列名"
    },
    "name": {
      "type": "string",
      "maxLength": 1000000,
      "title": "新列名"
    }
  },
  "required": [
    "text",
    "column",
    "name"
  ],
  "additionalProperties": false
}
```

输入示例：

```json
{
  "text": "name,score\nLR,90",
  "column": "score",
  "name": "成绩"
}
```

实际示例输出：

```json
"name,成绩\r\nLR,90"
```

## CSV 分组数值汇总

- 标识：`csv.aggregate`
- 分类：CSV
- 用途与限制：按列分组统计计数、和、均值、最小和最大值；空值单列计数，groupBy 留空统计全表。
- 平台：web、windows、linux、macos、cli
- 风险：safe；权限：无额外权限

输入字段与约束：

```json
{
  "type": "object",
  "properties": {
    "text": {
      "type": "string",
      "maxLength": 1000000,
      "title": "CSV 原始数据"
    },
    "column": {
      "type": "string",
      "maxLength": 1000000,
      "title": "目标列名"
    },
    "groupBy": {
      "type": "string",
      "maxLength": 1000000,
      "title": "分组列名（留空汇总全表）"
    }
  },
  "required": [
    "text",
    "column",
    "groupBy"
  ],
  "additionalProperties": false
}
```

输入示例：

```json
{
  "text": "team,score\nA,80\nA,100\nB,70",
  "column": "score",
  "groupBy": "team"
}
```

实际示例输出：

```json
{
  "groups": [
    {
      "group": "A",
      "count": 2,
      "empty": 0,
      "sum": 180,
      "min": 80,
      "max": 100,
      "mean": 90
    },
    {
      "group": "B",
      "count": 1,
      "empty": 0,
      "sum": 70,
      "min": 70,
      "max": 70,
      "mean": 70
    }
  ]
}
```

## 二维码生成

- 标识：`qr.generate`
- 分类：QR
- 用途与限制：离线生成 UTF-8 二维码，可预览、下载 SVG 或 PNG；内容最多 1000 字节。
- 平台：web、windows、linux、macos、cli
- 风险：safe；权限：无额外权限

输入字段与约束：

```json
{
  "type": "object",
  "properties": {
    "text": {
      "title": "文字或链接",
      "type": "string",
      "maxLength": 1000
    },
    "correction": {
      "title": "纠错等级",
      "type": "string",
      "enum": [
        "L",
        "M",
        "Q",
        "H"
      ]
    }
  },
  "required": [
    "text",
    "correction"
  ],
  "additionalProperties": false
}
```

输入示例：

```json
{
  "text": "https://example.com/你好",
  "correction": "M"
}
```

实际示例输出：

```json
"<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 33 33\" width=\"264\" height=\"264\" shape-rendering=\"crispEdges\"><rect width=\"33\" height=\"33\" fill=\"white\"/><path d=\"M4 4h7v1H4zM15 4h3v1H15zM20 4h1v1H20zM22 4h7v1H22zM4 5h1v1H4zM10 5h1v1H10zM14 5h1v1H14zM17 5h4v1H17zM22 5h1v1H22zM28 5h1v1H28zM4 6h1v1H4zM6 6h3v1H6zM10 6h1v1H10zM12 6h4v1H12zM18 6h1v1H18zM22 6h1v1H22zM24 6h3v1H24zM28 6h1v1H28zM4 7h1v1H4zM6 7h3v1H6zM10 7h1v1H10zM12 7h1v1H12zM14 7h1v1H14zM17 7h3v1H17zM22 7h1v1H22zM24 7h3v1H24zM28 7h1v1H28zM4 8h1v1H4zM6 8h3v1H6zM10 8h1v1H10zM12 8h4v1H12zM17 8h1v1H17zM20 8h1v1H20zM22 8h1v1H22zM24 8h3v1H24zM28 8h1v1H28zM4 9h1v1H4zM10 9h1v1H10zM12 9h5v1H12zM18 9h2v1H18zM22 9h1v1H22zM28 9h1v1H28zM4 10h7v1H4zM12 10h1v1H12zM14 10h1v1H14zM16 10h1v1H16zM18 10h1v1H18zM20 10h1v1H20zM22 10h7v1H22zM12 11h5v1H12zM18 11h1v1H18zM20 11h1v1H20zM4 12h1v1H4zM6 12h5v1H6zM14 12h1v1H14zM17 12h1v1H17zM22 12h5v1H22zM4 13h5v1H4zM11 13h3v1H11zM15 13h3v1H15zM21 13h1v1H21zM23 13h1v1H23zM27 13h1v1H27zM4 14h1v1H4zM6 14h1v1H6zM8 14h1v1H8zM10 14h1v1H10zM17 14h4v1H17zM23 14h1v1H23zM25 14h1v1H25zM27 14h2v1H27zM5 15h2v1H5zM8 15h1v1H8zM13 15h1v1H13zM17 15h4v1H17zM22 15h2v1H22zM28 15h1v1H28zM4 16h2v1H4zM10 16h2v1H10zM14 16h1v1H14zM16 16h4v1H16zM21 16h2v1H21zM24 16h1v1H24zM26 16h3v1H26zM4 17h1v1H4zM7 17h2v1H7zM11 17h1v1H11zM14 17h1v1H14zM16 17h1v1H16zM20 17h1v1H20zM23 17h1v1H23zM25 17h1v1H25zM27 17h1v1H27zM4 18h1v1H4zM7 18h1v1H7zM10 18h5v1H10zM18 18h2v1H18zM22 18h4v1H22zM27 18h2v1H27zM4 19h1v1H4zM6 19h1v1H6zM8 19h2v1H8zM11 19h1v1H11zM13 19h2v1H13zM17 19h1v1H17zM19 19h6v1H19zM28 19h1v1H28zM4 20h1v1H4zM10 20h4v1H10zM15 20h1v1H15zM17 20h1v1H17zM20 20h5v1H20zM26 20h1v1H26zM12 21h1v1H12zM15 21h6v1H15zM24 21h2v1H24zM4 22h7v1H4zM13 22h1v1H13zM15 22h1v1H15zM18 22h1v1H18zM20 22h1v1H20zM22 22h1v1H22zM24 22h1v1H24zM26 22h3v1H26zM4 23h1v1H4zM10 23h1v1H10zM12 23h2v1H12zM17 23h2v1H17zM20 23h1v1H20zM24 23h2v1H24zM4 24h1v1H4zM6 24h3v1H6zM10 24h1v1H10zM12 24h3v1H12zM16 24h2v1H16zM19 24h6v1H19zM26 24h1v1H26zM4 25h1v1H4zM6 25h3v1H6zM10 25h1v1H10zM12 25h1v1H12zM15 25h2v1H15zM19 25h1v1H19zM21 25h2v1H21zM24 25h5v1H24zM4 26h1v1H4zM6 26h3v1H6zM10 26h1v1H10zM12 26h1v1H12zM14 26h2v1H14zM19 26h1v1H19zM25 26h2v1H25zM28 26h1v1H28zM4 27h1v1H4zM10 27h1v1H10zM13 27h1v1H13zM17 27h1v1H17zM20 27h2v1H20zM23 27h3v1H23zM28 27h1v1H28zM4 28h7v1H4zM12 28h1v1H12zM16 28h3v1H16zM21 28h8v1H21z\" fill=\"black\"/></svg>"
```

## 文本压缩为 GZIP

- 标识：`archive.gzip.compress`
- 分类：Archive
- 用途与限制：将 UTF-8 文本压缩为可下载的 .gz 文件；输入最多 512 KB。
- 平台：web、windows、linux、macos、cli
- 风险：safe；权限：无额外权限

输入字段与约束：

```json
{
  "type": "object",
  "properties": {
    "text": {
      "type": "string",
      "maxLength": 1000000,
      "title": "输入文本"
    }
  },
  "required": [
    "text"
  ],
  "additionalProperties": false
}
```

输入示例：

```json
{
  "text": "你好 LR Toolbox"
}
```

实际示例输出：

```json
{
  "kind": "binary",
  "filename": "text.txt.gz",
  "mime": "application/gzip",
  "bytes": 37,
  "base64": "H4sIAAAAAAAAA3uyd8HTpXsVfIIUQvLzc5LyKwDZz55qEQAAAA=="
}
```

## GZIP 解压文本

- 标识：`archive.gzip.decompress`
- 分类：Archive
- 用途与限制：导入 .gz 或粘贴 Base64，验证校验和后解码 UTF-8；输出最多 4 MB，支持单个 GZIP 成员。
- 平台：web、windows、linux、macos、cli
- 风险：safe；权限：无额外权限

输入字段与约束：

```json
{
  "type": "object",
  "properties": {
    "text": {
      "type": "string",
      "maxLength": 1000000,
      "title": "压缩文件 Base64（也可点击导入文件）"
    }
  },
  "required": [
    "text"
  ],
  "additionalProperties": false
}
```

输入示例：

```json
{
  "text": "H4sIAAAAAAAAA3uyd8HTpXsVfIIA8K45ewkAAAA="
}
```

实际示例输出：

```json
"你好 LR"
```

## 文本压缩为 Zlib

- 标识：`archive.zlib.compress`
- 分类：Archive
- 用途与限制：将 UTF-8 文本压缩为带校验和的 .zlib 文件；输入最多 512 KB。
- 平台：web、windows、linux、macos、cli
- 风险：safe；权限：无额外权限

输入字段与约束：

```json
{
  "type": "object",
  "properties": {
    "text": {
      "type": "string",
      "maxLength": 1000000,
      "title": "输入文本"
    }
  },
  "required": [
    "text"
  ],
  "additionalProperties": false
}
```

输入示例：

```json
{
  "text": "你好 LR Toolbox"
}
```

实际示例输出：

```json
{
  "kind": "binary",
  "filename": "text.zlib",
  "mime": "application/zlib",
  "bytes": 25,
  "base64": "eJx7snfB06V7FXyCFELy83OS8isAVZ8ITg=="
}
```

## Zlib 解压文本

- 标识：`archive.zlib.decompress`
- 分类：Archive
- 用途与限制：导入 .zlib 或粘贴 Base64，验证 Adler-32 后解码 UTF-8；输出最多 4 MB，不支持字典。
- 平台：web、windows、linux、macos、cli
- 风险：safe；权限：无额外权限

输入字段与约束：

```json
{
  "type": "object",
  "properties": {
    "text": {
      "type": "string",
      "maxLength": 1000000,
      "title": "压缩文件 Base64（也可点击导入文件）"
    }
  },
  "required": [
    "text"
  ],
  "additionalProperties": false
}
```

输入示例：

```json
{
  "text": "eJx7snfB06V7FXyCAB8qBUc="
}
```

实际示例输出：

```json
"你好 LR"
```

## 文本文件打包 ZIP

- 标识：`archive.zip.create`
- 分类：Archive
- 用途与限制：将 JSON 文件名→文本对象打包为 ZIP；最多 64 文件、450 KB 内容，支持相对目录。
- 平台：web、windows、linux、macos、cli
- 风险：safe；权限：无额外权限

输入字段与约束：

```json
{
  "type": "object",
  "properties": {
    "text": {
      "type": "string",
      "maxLength": 1000000,
      "title": "JSON 文件名与文本内容"
    }
  },
  "required": [
    "text"
  ],
  "additionalProperties": false
}
```

输入示例：

```json
{
  "text": "{\"说明.txt\":\"你好 LR\",\"notes/readme.md\":\"# Toolbox\"}"
}
```

实际示例输出：

```json
{
  "kind": "binary",
  "filename": "archive.zip",
  "mime": "application/zip",
  "bytes": 246,
  "base64": "UEsDBBQAAAgIAAAAIVDwrjl7CwAAAAkAAAAKAAAA6K+05piOLnR4dHuyd8HTpXsVfIIAUEsDBBQAAAAIAAAAIVC6gUEXCwAAAAkAAAAPAAAAbm90ZXMvcmVhZG1lLm1kU1YIyc/PScqvAABQSwECFAAUAAAICAAAACFQ8K45ewsAAAAJAAAACgAAAAAAAAAAAAAAAAAAAAAA6K+05piOLnR4dFBLAQIUABQAAAAIAAAAIVC6gUEXCwAAAAkAAAAPAAAAAAAAAAAAAAAAADMAAABub3Rlcy9yZWFkbWUubWRQSwUGAAAAAAIAAgB1AAAAawAAAAAA"
}
```

## ZIP 文件目录

- 标识：`archive.zip.list`
- 分类：Archive
- 用途与限制：导入 ZIP 查看路径和文件大小，不解压内容；支持 Store/Deflate、UTF-8、ZIP32，最多 64 项 / 4 MB。
- 平台：web、windows、linux、macos、cli
- 风险：safe；权限：无额外权限

输入字段与约束：

```json
{
  "type": "object",
  "properties": {
    "text": {
      "type": "string",
      "maxLength": 1000000,
      "title": "压缩文件 Base64（也可点击导入文件）"
    }
  },
  "required": [
    "text"
  ],
  "additionalProperties": false
}
```

输入示例：

```json
{
  "text": "UEsDBBQAAAAIAAAAIVDwrjl7CwAAAAkAAAAJAAAAaGVsbG8udHh0e7J3wdOlexV8ggBQSwECFAAUAAAACAAAACFQ8K45ewsAAAAJAAAACQAAAAAAAAAAAAAAAAAAAAAAaGVsbG8udHh0UEsFBgAAAAABAAEANwAAADIAAAAAAA=="
}
```

实际示例输出：

```json
{
  "entries": [
    {
      "name": "hello.txt",
      "directory": false,
      "bytes": 9,
      "compressedBytes": 11
    }
  ]
}
```

## ZIP 提取单个文件

- 标识：`archive.zip.extract`
- 分类：Archive
- 用途与限制：导入 ZIP 并填写完整内部路径，校验 CRC 后下载原始文件；不写入设备目录，输出最多 4 MB。
- 平台：web、windows、linux、macos、cli
- 风险：safe；权限：无额外权限

输入字段与约束：

```json
{
  "type": "object",
  "properties": {
    "text": {
      "type": "string",
      "maxLength": 1000000,
      "title": "压缩文件 Base64（也可点击导入文件）"
    },
    "path": {
      "type": "string",
      "maxLength": 1000000,
      "title": "ZIP 内部文件路径"
    }
  },
  "required": [
    "text",
    "path"
  ],
  "additionalProperties": false
}
```

输入示例：

```json
{
  "text": "UEsDBBQAAAAIAAAAIVDwrjl7CwAAAAkAAAAJAAAAaGVsbG8udHh0e7J3wdOlexV8ggBQSwECFAAUAAAACAAAACFQ8K45ewsAAAAJAAAACQAAAAAAAAAAAAAAAAAAAAAAaGVsbG8udHh0UEsFBgAAAAABAAEANwAAADIAAAAAAA==",
  "path": "hello.txt"
}
```

实际示例输出：

```json
{
  "kind": "binary",
  "filename": "hello.txt",
  "mime": "application/octet-stream",
  "bytes": 9,
  "base64": "5L2g5aW9IExS"
}
```

## 文本差异对比

- 标识：`text.diff`
- 分类：Diff
- 用途与限制：按行、单词或字符显示新增与删除；每段最多 20000 字符 / 2000 行，复杂差异会中止。
- 平台：web、windows、linux、macos、cli
- 风险：safe；权限：无额外权限

输入字段与约束：

```json
{
  "type": "object",
  "properties": {
    "before": {
      "type": "string",
      "maxLength": 20000,
      "title": "原始文本"
    },
    "after": {
      "type": "string",
      "maxLength": 20000,
      "title": "修改后文本"
    },
    "mode": {
      "type": "string",
      "title": "对比方式",
      "enum": [
        "lines",
        "words",
        "characters"
      ]
    }
  },
  "required": [
    "before",
    "after",
    "mode"
  ],
  "additionalProperties": false
}
```

输入示例：

```json
{
  "before": "Hello LR\n旧内容\n",
  "after": "Hello LR\n新内容\n",
  "mode": "lines"
}
```

实际示例输出：

```json
{
  "kind": "diff",
  "mode": "lines",
  "added": 1,
  "removed": 1,
  "changes": [
    {
      "value": "Hello LR\n",
      "added": false,
      "removed": false,
      "count": 1
    },
    {
      "value": "旧内容\n",
      "added": false,
      "removed": true,
      "count": 1
    },
    {
      "value": "新内容\n",
      "added": true,
      "removed": false,
      "count": 1
    }
  ]
}
```

## 生成统一补丁

- 标识：`patch.create`
- 分类：Diff
- 用途与限制：对比两个文本，生成单文件 unified diff；不访问磁盘，最多 2000 行。
- 平台：web、windows、linux、macos、cli
- 风险：safe；权限：无额外权限

输入字段与约束：

```json
{
  "type": "object",
  "properties": {
    "before": {
      "type": "string",
      "maxLength": 20000,
      "title": "原始文本"
    },
    "after": {
      "type": "string",
      "maxLength": 20000,
      "title": "修改后文本"
    }
  },
  "required": [
    "before",
    "after"
  ],
  "additionalProperties": false
}
```

输入示例：

```json
{
  "before": "Hello LR\nold\n",
  "after": "Hello LR\nnew\n"
}
```

实际示例输出：

```json
"===================================================================\n--- before.txt\n+++ after.txt\n@@ -1,2 +1,2 @@\n Hello LR\n-old\n+new\n"
```

## 应用文本补丁

- 标识：`patch.apply`
- 分类：Diff
- 用途与限制：把单文件 unified diff 应用于输入文本，要求上下文匹配；只返回结果，不修改磁盘文件。
- 平台：web、windows、linux、macos、cli
- 风险：safe；权限：无额外权限

输入字段与约束：

```json
{
  "type": "object",
  "properties": {
    "text": {
      "type": "string",
      "maxLength": 20000,
      "title": "原始文本"
    },
    "patch": {
      "type": "string",
      "maxLength": 50000,
      "title": "Unified diff 补丁"
    }
  },
  "required": [
    "text",
    "patch"
  ],
  "additionalProperties": false
}
```

输入示例：

```json
{
  "text": "hello\n",
  "patch": "--- before.txt\n+++ after.txt\n@@ -1,1 +1,1 @@\n-hello\n+world\n"
}
```

实际示例输出：

```json
"world\n"
```

## YAML 转 JSON

- 标识：`yaml.to.json`
- 分类：YAML
- 用途与限制：将单文档 YAML 转为 JSON；拒绝重复键、别名、自定义标签及超过 60 层的结构。
- 平台：web、windows、linux、macos、cli
- 风险：safe；权限：无额外权限

输入字段与约束：

```json
{
  "type": "object",
  "properties": {
    "text": {
      "type": "string",
      "maxLength": 200000,
      "title": "YAML 内容"
    }
  },
  "required": [
    "text"
  ],
  "additionalProperties": false
}
```

输入示例：

```json
{
  "text": "name: LR Toolbox\nenabled: true\ntags:\n  - offline\n  - 中文\n"
}
```

实际示例输出：

```json
"{\n  \"name\": \"LR Toolbox\",\n  \"enabled\": true,\n  \"tags\": [\n    \"offline\",\n    \"中文\"\n  ]\n}"
```

## JSON 转 YAML

- 标识：`yaml.from.json`
- 分类：YAML
- 用途与限制：将 JSON 转为 YAML，保留字符串类型、中文和键顺序；不展开引用。
- 平台：web、windows、linux、macos、cli
- 风险：safe；权限：无额外权限

输入字段与约束：

```json
{
  "type": "object",
  "properties": {
    "text": {
      "type": "string",
      "maxLength": 200000,
      "title": "JSON 内容"
    }
  },
  "required": [
    "text"
  ],
  "additionalProperties": false
}
```

输入示例：

```json
{
  "text": "{\"name\":\"LR\",\"enabled\":true,\"code\":\"001\"}"
}
```

实际示例输出：

```json
"name: LR\nenabled: true\ncode: 001\n"
```

## YAML 校验与概览

- 标识：`yaml.validate`
- 分类：YAML
- 用途与限制：检查单文档 YAML 语法、重复键和 JSON 兼容性，返回根类型与节点数量；别名不受支持。
- 平台：web、windows、linux、macos、cli
- 风险：safe；权限：无额外权限

输入字段与约束：

```json
{
  "type": "object",
  "properties": {
    "text": {
      "type": "string",
      "maxLength": 200000,
      "title": "YAML 内容"
    }
  },
  "required": [
    "text"
  ],
  "additionalProperties": false
}
```

输入示例：

```json
{
  "text": "name: LR\nenabled: true"
}
```

实际示例输出：

```json
{
  "valid": true,
  "rootType": "object",
  "nodes": 3
}
```

## Markdown 排版预览

- 标识：`markdown.render`
- 分类：Markdown
- 用途与限制：把 Markdown 渲染为可下载 HTML 文档；原始 HTML 显示为文本，图片只显示替代文字，不加载外部资源。
- 平台：web、windows、linux、macos、cli
- 风险：safe；权限：无额外权限

输入字段与约束：

```json
{
  "type": "object",
  "properties": {
    "text": {
      "type": "string",
      "maxLength": 20000,
      "title": "Markdown 内容"
    }
  },
  "required": [
    "text"
  ],
  "additionalProperties": false
}
```

输入示例：

```json
{
  "text": "# LR Toolbox\n\n**离线创造**，专注你的工作。\n\n| 工具 | 状态 |\n|---|---|\n| Markdown | 就绪 |\n\n```js\nconsole.log('Hello LR');\n```"
}
```

实际示例输出：

```json
"<!doctype html><html lang=\"zh-CN\"><head><meta charset=\"utf-8\"><meta name=\"viewport\" content=\"width=device-width,initial-scale=1\"><meta http-equiv=\"Content-Security-Policy\" content=\"default-src 'none'; style-src 'unsafe-inline'; img-src data:; base-uri 'none'; form-action 'none'\"><title>Markdown document</title><style>body{font:16px/1.8 system-ui,sans-serif;color:#23324b;background:#fff;max-width:860px;margin:0 auto;padding:30px;overflow-wrap:anywhere}h1,h2,h3{line-height:1.4;color:#152948}h1{border-bottom:2px solid #e5eaf2;padding-bottom:14px}a{color:#526cca}pre{background:#101d32;color:#d8e7ff;padding:18px;border-radius:10px;overflow:auto}code{font-family:monospace}table{border-collapse:collapse;display:block;overflow:auto}td,th{border:1px solid #dbe3ef;padding:9px 16px}th{background:#eef3fa}blockquote{border-left:3px solid #8ca3db;margin-left:0;padding-left:18px;color:#697c98}.image-placeholder{color:#8793a6}input{pointer-events:none}</style></head><body><h1>LR Toolbox</h1>\n<p><strong>离线创造</strong>，专注你的工作。</p>\n<table>\n<thead>\n<tr>\n<th>工具</th>\n<th>状态</th>\n</tr>\n</thead>\n<tbody><tr>\n<td>Markdown</td>\n<td>就绪</td>\n</tr>\n</tbody></table>\n<pre><code class=\"language-js\">console.log(&#39;Hello LR&#39;);\n</code></pre>\n</body></html>"
```

## JavaScript 格式化

- 标识：`code.format.javascript`
- 分类：Code
- 用途与限制：使用 Prettier 整理 JavaScript；只解析排版、不执行代码；最多 40000 字符，嵌入语言保持原样。
- 平台：web、windows、linux、macos、cli
- 风险：safe；权限：无额外权限

输入字段与约束：

```json
{
  "type": "object",
  "properties": {
    "text": {
      "type": "string",
      "maxLength": 40000,
      "title": "源代码"
    },
    "indent": {
      "type": "integer",
      "enum": [
        2,
        4
      ],
      "title": "缩进空格"
    },
    "width": {
      "type": "integer",
      "minimum": 40,
      "maximum": 160,
      "title": "建议行宽"
    }
  },
  "required": [
    "text",
    "indent",
    "width"
  ],
  "additionalProperties": false
}
```

输入示例：

```json
{
  "text": "const tools=[\"LR\",\"中文\"];tools.map(x=>({name:x}));",
  "indent": 2,
  "width": 80
}
```

实际示例输出：

```json
"const tools = [\"LR\", \"中文\"];\ntools.map((x) => ({ name: x }));\n"
```

## TypeScript 格式化

- 标识：`code.format.typescript`
- 分类：Code
- 用途与限制：使用 Prettier 整理 TypeScript；只解析排版、不执行代码；最多 40000 字符，嵌入语言保持原样。
- 平台：web、windows、linux、macos、cli
- 风险：safe；权限：无额外权限

输入字段与约束：

```json
{
  "type": "object",
  "properties": {
    "text": {
      "type": "string",
      "maxLength": 40000,
      "title": "源代码"
    },
    "indent": {
      "type": "integer",
      "enum": [
        2,
        4
      ],
      "title": "缩进空格"
    },
    "width": {
      "type": "integer",
      "minimum": 40,
      "maximum": 160,
      "title": "建议行宽"
    }
  },
  "required": [
    "text",
    "indent",
    "width"
  ],
  "additionalProperties": false
}
```

输入示例：

```json
{
  "text": "interface Tool{name:string;enabled:boolean} const tool:Tool={name:\"LR\",enabled:true};",
  "indent": 2,
  "width": 80
}
```

实际示例输出：

```json
"interface Tool {\n  name: string;\n  enabled: boolean;\n}\nconst tool: Tool = { name: \"LR\", enabled: true };\n"
```

## CSS 格式化

- 标识：`code.format.css`
- 分类：Code
- 用途与限制：使用 Prettier 整理 CSS；只解析排版、不执行代码；最多 40000 字符，嵌入语言保持原样。
- 平台：web、windows、linux、macos、cli
- 风险：safe；权限：无额外权限

输入字段与约束：

```json
{
  "type": "object",
  "properties": {
    "text": {
      "type": "string",
      "maxLength": 40000,
      "title": "源代码"
    },
    "indent": {
      "type": "integer",
      "enum": [
        2,
        4
      ],
      "title": "缩进空格"
    },
    "width": {
      "type": "integer",
      "minimum": 40,
      "maximum": 160,
      "title": "建议行宽"
    }
  },
  "required": [
    "text",
    "indent",
    "width"
  ],
  "additionalProperties": false
}
```

输入示例：

```json
{
  "text": ".tool{color:#fff;background:#142038;padding:12px 16px;}@media(max-width:600px){.tool{padding:8px;}}",
  "indent": 2,
  "width": 80
}
```

实际示例输出：

```json
".tool {\n  color: #fff;\n  background: #142038;\n  padding: 12px 16px;\n}\n@media (max-width: 600px) {\n  .tool {\n    padding: 8px;\n  }\n}\n"
```

## HTML 格式化

- 标识：`code.format.html`
- 分类：Code
- 用途与限制：使用 Prettier 整理 HTML；只解析排版、不执行代码；最多 40000 字符，嵌入语言保持原样。
- 平台：web、windows、linux、macos、cli
- 风险：safe；权限：无额外权限

输入字段与约束：

```json
{
  "type": "object",
  "properties": {
    "text": {
      "type": "string",
      "maxLength": 40000,
      "title": "源代码"
    },
    "indent": {
      "type": "integer",
      "enum": [
        2,
        4
      ],
      "title": "缩进空格"
    },
    "width": {
      "type": "integer",
      "minimum": 40,
      "maximum": 160,
      "title": "建议行宽"
    }
  },
  "required": [
    "text",
    "indent",
    "width"
  ],
  "additionalProperties": false
}
```

输入示例：

```json
{
  "text": "<main><h1>LR Toolbox</h1><p>本地创造</p></main>",
  "indent": 2,
  "width": 80
}
```

实际示例输出：

```json
"<main>\n  <h1>LR Toolbox</h1>\n  <p>本地创造</p>\n</main>\n"
```

## XML 转有序 JSON

- 标识：`xml.to.json`
- 分类：XML
- 用途与限制：保留元素顺序、重复节点、属性、文本、注释和 CDATA；值保持字符串，属性以 @_ 开头；拒绝 DTD，最多 60 层 / 5000 元素。
- 平台：web、windows、linux、macos、cli
- 风险：safe；权限：无额外权限

输入字段与约束：

```json
{
  "type": "object",
  "properties": {
    "text": {
      "type": "string",
      "maxLength": 40000,
      "title": "XML 内容"
    }
  },
  "required": [
    "text"
  ],
  "additionalProperties": false
}
```

输入示例：

```json
{
  "text": "<?xml version=\"1.0\"?><tools><tool id=\"001\">中文🧪</tool><tool id=\"002\">Offline</tool></tools>"
}
```

实际示例输出：

```json
"[\n  {\n    \"?xml\": [\n      {\n        \"#text\": \"\"\n      }\n    ],\n    \":@\": {\n      \"@_version\": \"1.0\"\n    }\n  },\n  {\n    \"tools\": [\n      {\n        \"tool\": [\n          {\n            \"#text\": \"中文🧪\"\n          }\n        ],\n        \":@\": {\n          \"@_id\": \"001\"\n        }\n      },\n      {\n        \"tool\": [\n          {\n            \"#text\": \"Offline\"\n          }\n        ],\n        \":@\": {\n          \"@_id\": \"002\"\n        }\n      }\n    ]\n  }\n]"
```

## XML 语法校验

- 标识：`xml.validate`
- 分类：XML
- 用途与限制：校验单根 XML 文档并返回根名称、元素、属性数和深度；最多 40000 字符，不支持 DTD 和自定义实体。
- 平台：web、windows、linux、macos、cli
- 风险：safe；权限：无额外权限

输入字段与约束：

```json
{
  "type": "object",
  "properties": {
    "text": {
      "type": "string",
      "maxLength": 40000,
      "title": "XML 内容"
    }
  },
  "required": [
    "text"
  ],
  "additionalProperties": false
}
```

输入示例：

```json
{
  "text": "<?xml version=\"1.0\"?><tools><tool id=\"001\">中文🧪</tool><tool id=\"002\">Offline</tool></tools>"
}
```

实际示例输出：

```json
{
  "valid": true,
  "root": "tools",
  "elements": 3,
  "attributes": 2,
  "maxDepth": 2
}
```

## XML 结构浏览

- 标识：`xml.inspect`
- 分类：XML
- 用途与限制：查看真实元素路径、同名节点序号、属性和直接子元素数；预览最多 200 元素，统计覆盖整份文档。
- 平台：web、windows、linux、macos、cli
- 风险：safe；权限：无额外权限

输入字段与约束：

```json
{
  "type": "object",
  "properties": {
    "text": {
      "type": "string",
      "maxLength": 40000,
      "title": "XML 内容"
    }
  },
  "required": [
    "text"
  ],
  "additionalProperties": false
}
```

输入示例：

```json
{
  "text": "<?xml version=\"1.0\"?><tools><tool id=\"001\">中文🧪</tool><tool id=\"002\">Offline</tool></tools>"
}
```

实际示例输出：

```json
{
  "root": "tools",
  "elements": 3,
  "attributes": 2,
  "maxDepth": 2,
  "paths": [
    {
      "path": "/tools[1]",
      "tag": "tools",
      "attributes": {},
      "childElements": 2
    },
    {
      "path": "/tools[1]/tool[1]",
      "tag": "tool",
      "attributes": {
        "id": "001"
      },
      "childElements": 0
    },
    {
      "path": "/tools[1]/tool[2]",
      "tag": "tool",
      "attributes": {
        "id": "002"
      },
      "childElements": 0
    }
  ],
  "truncated": false
}
```

## SQL 格式化

- 标识：`sql.format`
- 分类：Code
- 用途与限制：整理 SQL 语句，保留注释与字面量；只排版、不连接数据库、不执行查询。
- 平台：web、windows、linux、macos、cli
- 风险：safe；权限：无额外权限

输入字段与约束：

```json
{
  "type": "object",
  "properties": {
    "text": {
      "type": "string",
      "maxLength": 40000
    },
    "dialect": {
      "type": "string",
      "enum": [
        "sql",
        "mysql",
        "postgresql",
        "sqlite"
      ]
    },
    "indent": {
      "type": "integer",
      "enum": [
        2,
        4
      ]
    }
  },
  "required": [
    "text",
    "dialect",
    "indent"
  ],
  "additionalProperties": false
}
```

输入示例：

```json
{
  "text": "select id,name from users where active=1 order by id;",
  "dialect": "mysql",
  "indent": 2
}
```

实际示例输出：

```json
"SELECT\n  id,\n  name\nFROM\n  users\nWHERE\n  active = 1\nORDER BY\n  id;"
```

## IPv4 子网计算

- 标识：`network.ipv4.inspect`
- 分类：Network
- 用途与限制：计算网络地址、广播地址与可用范围；/31、/32 按点对点处理。
- 平台：web、windows、linux、macos、cli
- 风险：safe；权限：无额外权限

输入字段与约束：

```json
{
  "type": "object",
  "properties": {
    "text": {
      "type": "string",
      "maxLength": 1000000
    }
  },
  "required": [
    "text"
  ],
  "additionalProperties": false
}
```

输入示例：

```json
{
  "text": "192.168.1.42/24"
}
```

实际示例输出：

```json
{
  "network": "192.168.1.0",
  "broadcast": "192.168.1.255",
  "prefix": 24,
  "mask": "255.255.255.0",
  "addresses": 256,
  "usableHosts": 254,
  "firstHost": "192.168.1.1",
  "lastHost": "192.168.1.254"
}
```

## IPv4 转整数

- 标识：`network.ipv4.to_integer`
- 分类：Network
- 用途与限制：将 IPv4 地址转换为无符号 32 位十进制整数。
- 平台：web、windows、linux、macos、cli
- 风险：safe；权限：无额外权限

输入字段与约束：

```json
{
  "type": "object",
  "properties": {
    "text": {
      "type": "string",
      "maxLength": 1000000
    }
  },
  "required": [
    "text"
  ],
  "additionalProperties": false
}
```

输入示例：

```json
{
  "text": "192.168.1.1"
}
```

实际示例输出：

```json
3232235777
```

## 整数转 IPv4

- 标识：`network.ipv4.from_integer`
- 分类：Network
- 用途与限制：将 0–4294967295 的整数转换为点分 IPv4 地址。
- 平台：web、windows、linux、macos、cli
- 风险：safe；权限：无额外权限

输入字段与约束：

```json
{
  "type": "object",
  "properties": {
    "value": {
      "type": "number",
      "minimum": 0,
      "maximum": 4294967295
    }
  },
  "required": [
    "value"
  ],
  "additionalProperties": false
}
```

输入示例：

```json
{
  "value": 3232235777
}
```

实际示例输出：

```json
"192.168.1.1"
```

## IPv6 地址规范化

- 标识：`network.ipv6.normalize`
- 分类：Network
- 用途与限制：规范化纯 IPv6 地址，并展开为八组十六进制；不支持区域标识。
- 平台：web、windows、linux、macos、cli
- 风险：safe；权限：无额外权限

输入字段与约束：

```json
{
  "type": "object",
  "properties": {
    "text": {
      "type": "string",
      "maxLength": 1000000
    }
  },
  "required": [
    "text"
  ],
  "additionalProperties": false
}
```

输入示例：

```json
{
  "text": "2001:0db8:0:0:0:0:0:1"
}
```

实际示例输出：

```json
{
  "compressed": "2001:db8::1",
  "expanded": "2001:0db8:0000:0000:0000:0000:0000:0001"
}
```

## MAC 地址解析

- 标识：`network.mac.inspect`
- 分类：Network
- 用途与限制：规范化 48 位 MAC 地址，显示 OUI 与单播/本地管理标志。
- 平台：web、windows、linux、macos、cli
- 风险：safe；权限：无额外权限

输入字段与约束：

```json
{
  "type": "object",
  "properties": {
    "text": {
      "type": "string",
      "maxLength": 1000000
    }
  },
  "required": [
    "text"
  ],
  "additionalProperties": false
}
```

输入示例：

```json
{
  "text": "02:11:22:33:44:55"
}
```

实际示例输出：

```json
{
  "canonical": "02:11:22:33:44:55",
  "oui": "021122",
  "multicast": false,
  "locallyAdministered": true
}
```

## IP 网段归属判断

- 标识：`network.cidr.contains`
- 分类：Network
- 用途与限制：判断指定 IPv4 地址是否处于给定 CIDR 范围内。
- 平台：web、windows、linux、macos、cli
- 风险：safe；权限：无额外权限

输入字段与约束：

```json
{
  "type": "object",
  "properties": {
    "cidr": {
      "type": "string",
      "maxLength": 1000000
    },
    "address": {
      "type": "string",
      "maxLength": 1000000
    }
  },
  "required": [
    "cidr",
    "address"
  ],
  "additionalProperties": false
}
```

输入示例：

```json
{
  "cidr": "10.0.0.0/8",
  "address": "10.2.3.4"
}
```

实际示例输出：

```json
true
```

## IPv4 子网划分

- 标识：`network.cidr.subnets`
- 分类：Network
- 用途与限制：按新前缀划分网络，一次最多输出 256 个子网。
- 平台：web、windows、linux、macos、cli
- 风险：safe；权限：无额外权限

输入字段与约束：

```json
{
  "type": "object",
  "properties": {
    "text": {
      "type": "string",
      "maxLength": 1000000
    },
    "prefix": {
      "type": "number",
      "minimum": 0,
      "maximum": 32
    }
  },
  "required": [
    "text",
    "prefix"
  ],
  "additionalProperties": false
}
```

输入示例：

```json
{
  "text": "192.168.1.0/24",
  "prefix": 26
}
```

实际示例输出：

```json
[
  "192.168.1.0/26",
  "192.168.1.64/26",
  "192.168.1.128/26",
  "192.168.1.192/26"
]
```

## Base64URL 编码

- 标识：`encoding.base64url.encode`
- 分类：Encoding
- 用途与限制：将 UTF-8 文本转换为不带填充的 URL 安全 Base64。
- 平台：web、windows、linux、macos、cli
- 风险：safe；权限：无额外权限

输入字段与约束：

```json
{
  "type": "object",
  "properties": {
    "text": {
      "type": "string",
      "maxLength": 1000000
    }
  },
  "required": [
    "text"
  ],
  "additionalProperties": false
}
```

输入示例：

```json
{
  "text": "Hello?"
}
```

实际示例输出：

```json
"SGVsbG8_"
```

## Base64URL 解码

- 标识：`encoding.base64url.decode`
- 分类：Encoding
- 用途与限制：解码不带填充的 Base64URL 文本，严格校验 UTF-8。
- 平台：web、windows、linux、macos、cli
- 风险：safe；权限：无额外权限

输入字段与约束：

```json
{
  "type": "object",
  "properties": {
    "text": {
      "type": "string",
      "maxLength": 1000000
    }
  },
  "required": [
    "text"
  ],
  "additionalProperties": false
}
```

输入示例：

```json
{
  "text": "SGVsbG8_"
}
```

实际示例输出：

```json
"Hello?"
```

## 安全随机字节

- 标识：`crypto.random.bytes`
- 分类：Crypto
- 用途与限制：使用系统密码学随机源生成 1–4096 字节的十六进制值。
- 平台：web、windows、linux、macos、cli
- 风险：safe；权限：无额外权限

输入字段与约束：

```json
{
  "type": "object",
  "properties": {
    "count": {
      "type": "number",
      "minimum": 1,
      "maximum": 4096
    }
  },
  "required": [
    "count"
  ],
  "additionalProperties": false
}
```

输入示例：

```json
{
  "count": 16
}
```

实际示例输出：

```json
"fe93a5904ee835117a0e3838f9719c01"
```

## HMAC SHA-256

- 标识：`crypto.hmac.sha256`
- 分类：Crypto
- 用途与限制：以 UTF-8 密钥计算消息认证码；密钥只在当前执行中使用。
- 平台：web、windows、linux、macos、cli
- 风险：safe；权限：无额外权限

输入字段与约束：

```json
{
  "type": "object",
  "properties": {
    "key": {
      "type": "string",
      "maxLength": 1000000
    },
    "text": {
      "type": "string",
      "maxLength": 1000000
    }
  },
  "required": [
    "key",
    "text"
  ],
  "additionalProperties": false
}
```

输入示例：

```json
{
  "key": "key",
  "text": "The quick brown fox jumps over the lazy dog"
}
```

实际示例输出：

```json
"f7bc83f430538424b13298e6aa6fb143ef4d59a14946175997479dbc2d1a3cd8"
```

## Markdown 目录生成

- 标识：`markdown.toc`
- 分类：Markdown
- 用途与限制：提取 ATX 标题，跳过围栏代码；最多 10000 个标题，每个最多 4096 字。
- 平台：web、windows、linux、macos、cli
- 风险：safe；权限：无额外权限

输入字段与约束：

```json
{
  "type": "object",
  "properties": {
    "text": {
      "type": "string",
      "maxLength": 1000000
    }
  },
  "required": [
    "text"
  ],
  "additionalProperties": false
}
```

输入示例：

```json
{
  "text": "# Hello\n## World\n## World"
}
```

实际示例输出：

```json
"- [Hello](#hello)\n  - [World](#world)\n  - [World](#world-1)"
```

## Markdown 链接提取

- 标识：`markdown.links`
- 分类：Markdown
- 用途与限制：提取单行行内链接（不含图片、嵌套括号、引用式与代码块）。
- 平台：web、windows、linux、macos、cli
- 风险：safe；权限：无额外权限

输入字段与约束：

```json
{
  "type": "object",
  "properties": {
    "text": {
      "type": "string",
      "maxLength": 1000000
    }
  },
  "required": [
    "text"
  ],
  "additionalProperties": false
}
```

输入示例：

```json
{
  "text": "See [LR](https://example.com) and ![image](a.png)"
}
```

实际示例输出：

```json
{
  "links": [
    {
      "label": "LR",
      "url": "https://example.com"
    }
  ]
}
```

## CSV 转 Markdown 表格

- 标识：`markdown.table`
- 分类：Markdown
- 用途与限制：将带表头的矩形 CSV 转为 Markdown 表格，转义竖线和换行。
- 平台：web、windows、linux、macos、cli
- 风险：safe；权限：无额外权限

输入字段与约束：

```json
{
  "type": "object",
  "properties": {
    "text": {
      "type": "string",
      "maxLength": 1000000
    }
  },
  "required": [
    "text"
  ],
  "additionalProperties": false
}
```

输入示例：

```json
{
  "text": "name,value\nLR,42"
}
```

实际示例输出：

```json
"| name | value |\n| --- | --- |\n| LR | 42 |"
```

## ISO 周数计算

- 标识：`time.iso_week`
- 分类：Time
- 用途与限制：按 UTC 日期计算 ISO 8601 周所属年份和周数。
- 平台：web、windows、linux、macos、cli
- 风险：safe；权限：无额外权限

输入字段与约束：

```json
{
  "type": "object",
  "properties": {
    "text": {
      "type": "string",
      "maxLength": 1000000
    }
  },
  "required": [
    "text"
  ],
  "additionalProperties": false
}
```

输入示例：

```json
{
  "text": "2021-01-01T12:00:00Z"
}
```

实际示例输出：

```json
{
  "year": 2020,
  "week": 53,
  "weekday": 5
}
```

## ISO 时长解析

- 标识：`time.duration.parse`
- 分类：Time
- 用途与限制：解析非负 ISO 8601 周、天、时、分、秒；不含长度不固定的年月。
- 平台：web、windows、linux、macos、cli
- 风险：safe；权限：无额外权限

输入字段与约束：

```json
{
  "type": "object",
  "properties": {
    "text": {
      "type": "string",
      "maxLength": 1000000
    }
  },
  "required": [
    "text"
  ],
  "additionalProperties": false
}
```

输入示例：

```json
{
  "text": "P1DT2H30M"
}
```

实际示例输出：

```json
{
  "seconds": 95400,
  "milliseconds": 95400000
}
```

## 时区时间转换

- 标识：`time.timezone.format`
- 分类：Time
- 用途与限制：将带时区的 ISO 时间转换为指定 IANA 时区。
- 平台：web、windows、linux、macos、cli
- 风险：safe；权限：无额外权限

输入字段与约束：

```json
{
  "type": "object",
  "properties": {
    "text": {
      "type": "string",
      "maxLength": 1000000
    },
    "zone": {
      "type": "string",
      "maxLength": 1000000
    }
  },
  "required": [
    "text",
    "zone"
  ],
  "additionalProperties": false
}
```

输入示例：

```json
{
  "text": "2024-01-01T00:00:00Z",
  "zone": "Asia/Shanghai"
}
```

实际示例输出：

```json
{
  "zone": "Asia/Shanghai",
  "date": "2024-01-01",
  "time": "08:00:00",
  "offset": "GMT+08:00"
}
```

## 矩阵转置

- 标识：`math.matrix.transpose`
- 分类：Math
- 用途与限制：交换 JSON 数值矩阵的行列，最大 10 × 10。
- 平台：web、windows、linux、macos、cli
- 风险：safe；权限：无额外权限

输入字段与约束：

```json
{
  "type": "object",
  "properties": {
    "text": {
      "type": "string",
      "maxLength": 1000000
    }
  },
  "required": [
    "text"
  ],
  "additionalProperties": false
}
```

输入示例：

```json
{
  "text": "[[1,2,3],[4,5,6]]"
}
```

实际示例输出：

```json
{
  "matrix": [
    [
      1,
      4
    ],
    [
      2,
      5
    ],
    [
      3,
      6
    ]
  ]
}
```

## 矩阵乘法

- 标识：`math.matrix.multiply`
- 分类：Math
- 用途与限制：计算两个 JSON 数值矩阵的乘积，最大 10 × 10。
- 平台：web、windows、linux、macos、cli
- 风险：safe；权限：无额外权限

输入字段与约束：

```json
{
  "type": "object",
  "properties": {
    "a": {
      "type": "string",
      "maxLength": 1000000
    },
    "b": {
      "type": "string",
      "maxLength": 1000000
    }
  },
  "required": [
    "a",
    "b"
  ],
  "additionalProperties": false
}
```

输入示例：

```json
{
  "a": "[[1,2],[3,4]]",
  "b": "[[5],[6]]"
}
```

实际示例输出：

```json
{
  "matrix": [
    [
      17
    ],
    [
      39
    ]
  ]
}
```

## 矩阵行列式

- 标识：`math.matrix.determinant`
- 分类：Math
- 用途与限制：部分选主元消元法计算行列式，使用浮点数近似。
- 平台：web、windows、linux、macos、cli
- 风险：safe；权限：无额外权限

输入字段与约束：

```json
{
  "type": "object",
  "properties": {
    "text": {
      "type": "string",
      "maxLength": 1000000
    }
  },
  "required": [
    "text"
  ],
  "additionalProperties": false
}
```

输入示例：

```json
{
  "text": "[[1,2],[3,4]]"
}
```

实际示例输出：

```json
-2
```

## 线性方程组求解

- 标识：`math.matrix.solve`
- 分类：Math
- 用途与限制：输入系数矩阵 A 和列矩阵 b；用浮点消元计算 Ax=b。
- 平台：web、windows、linux、macos、cli
- 风险：safe；权限：无额外权限

输入字段与约束：

```json
{
  "type": "object",
  "properties": {
    "a": {
      "type": "string",
      "maxLength": 1000000
    },
    "b": {
      "type": "string",
      "maxLength": 1000000
    }
  },
  "required": [
    "a",
    "b"
  ],
  "additionalProperties": false
}
```

输入示例：

```json
{
  "a": "[[2,1],[1,-1]]",
  "b": "[[5],[1]]"
}
```

实际示例输出：

```json
{
  "solution": [
    2,
    1
  ]
}
```

## 矩阵求逆

- 标识：`math.matrix.inverse`
- 分类：Math
- 用途与限制：用部分选主元消元法求逆；浮点计算，不适用于病态精确计算。
- 平台：web、windows、linux、macos、cli
- 风险：safe；权限：无额外权限

输入字段与约束：

```json
{
  "type": "object",
  "properties": {
    "text": {
      "type": "string",
      "maxLength": 1000000
    }
  },
  "required": [
    "text"
  ],
  "additionalProperties": false
}
```

输入示例：

```json
{
  "text": "[[2,0],[0,4]]"
}
```

实际示例输出：

```json
{
  "matrix": [
    [
      0.5,
      0
    ],
    [
      0,
      0.25
    ]
  ]
}
```

## 组合数计算

- 标识：`math.combinations`
- 分类：Math
- 用途与限制：以任意精度整数计算 C(n,k)，n 最大 1000。
- 平台：web、windows、linux、macos、cli
- 风险：safe；权限：无额外权限

输入字段与约束：

```json
{
  "type": "object",
  "properties": {
    "n": {
      "type": "number",
      "minimum": 0,
      "maximum": 1000
    },
    "k": {
      "type": "number",
      "minimum": 0,
      "maximum": 1000
    }
  },
  "required": [
    "n",
    "k"
  ],
  "additionalProperties": false
}
```

输入示例：

```json
{
  "n": 52,
  "k": 5
}
```

实际示例输出：

```json
"2598960"
```

## 大整数阶乘

- 标识：`math.factorial`
- 分类：Math
- 用途与限制：以任意精度整数计算 0–1000 的阶乘，返回十进制字符串。
- 平台：web、windows、linux、macos、cli
- 风险：safe；权限：无额外权限

输入字段与约束：

```json
{
  "type": "object",
  "properties": {
    "value": {
      "type": "number",
      "minimum": 0,
      "maximum": 1000
    }
  },
  "required": [
    "value"
  ],
  "additionalProperties": false
}
```

输入示例：

```json
{
  "value": 20
}
```

实际示例输出：

```json
"2432902008176640000"
```

## 质数判断

- 标识：`numbers.primality`
- 分类：Numbers
- 用途与限制：精确判断 0–10 亿整数是否为质数，使用有界试除法。
- 平台：web、windows、linux、macos、cli
- 风险：safe；权限：无额外权限

输入字段与约束：

```json
{
  "type": "object",
  "properties": {
    "value": {
      "type": "number",
      "minimum": 0,
      "maximum": 1000000000
    }
  },
  "required": [
    "value"
  ],
  "additionalProperties": false
}
```

输入示例：

```json
{
  "value": 104729
}
```

实际示例输出：

```json
true
```

## 分数约分

- 标识：`math.fraction.reduce`
- 分类：Math
- 用途与限制：将整数分子、非零分母约至最简，支持最多 500 位整数。
- 平台：web、windows、linux、macos、cli
- 风险：safe；权限：无额外权限

输入字段与约束：

```json
{
  "type": "object",
  "properties": {
    "numerator": {
      "type": "string",
      "maxLength": 1000000
    },
    "denominator": {
      "type": "string",
      "maxLength": 1000000
    }
  },
  "required": [
    "numerator",
    "denominator"
  ],
  "additionalProperties": false
}
```

输入示例：

```json
{
  "numerator": "-42",
  "denominator": "-56"
}
```

实际示例输出：

```json
{
  "numerator": "3",
  "denominator": "4"
}
```

## JSON 智能修复

- 标识：`json.repair`
- 分类：JSON
- 用途与限制：修复缺失引号、逗号、注释、尾逗号等常见损坏 JSON，再输出标准格式。由 jsonrepair 驱动。
- 平台：web、windows、linux、macos、cli
- 风险：safe；权限：无额外权限

输入字段与约束：

```json
{
  "type": "object",
  "properties": {
    "text": {
      "type": "string",
      "maxLength": 1000000
    }
  },
  "required": [
    "text"
  ],
  "additionalProperties": false
}
```

输入示例：

```json
{
  "text": "{name: 'LR', tools: [1,2,3,],}"
}
```

实际示例输出：

```json
"{\n  \"name\": \"LR\",\n  \"tools\": [\n    1,\n    2,\n    3\n  ]\n}"
```

## JSON 扁平化

- 标识：`json.flatten`
- 分类：JSON
- 用途与限制：把嵌套对象和数组转换为点路径 / 索引路径，便于查字段、做表格或调试。
- 平台：web、windows、linux、macos、cli
- 风险：safe；权限：无额外权限

输入字段与约束：

```json
{
  "type": "object",
  "properties": {
    "text": {
      "type": "string",
      "maxLength": 1000000
    }
  },
  "required": [
    "text"
  ],
  "additionalProperties": false
}
```

输入示例：

```json
{
  "text": "{\"user\":{\"name\":\"LR\",\"skills\":[\"JS\",\"Rust\"]}}"
}
```

实际示例输出：

```json
{
  "user.name": "LR",
  "user.skills[0]": "JS",
  "user.skills[1]": "Rust"
}
```

## HTML 转 Markdown

- 标识：`html.to.markdown`
- 分类：Markdown
- 用途与限制：把网页片段、富文本和编辑器 HTML 转成干净 Markdown。由 Turndown 驱动。
- 平台：web、windows、linux、macos、cli
- 风险：safe；权限：无额外权限

输入字段与约束：

```json
{
  "type": "object",
  "properties": {
    "text": {
      "type": "string",
      "maxLength": 1000000
    }
  },
  "required": [
    "text"
  ],
  "additionalProperties": false
}
```

输入示例：

```json
{
  "text": "<h1>LR Toolbox X</h1><p>Hello <strong>world</strong>.</p>"
}
```

实际示例输出：

```json
"# LR Toolbox X\n\nHello **world**."
```

## 正则表达式测试器

- 标识：`developer.regex.test`
- 分类：Developer
- 用途与限制：在本地测试 JavaScript 正则，返回匹配文本、索引和捕获组；默认最多返回 200 个匹配。
- 平台：web、windows、linux、macos、cli
- 风险：safe；权限：无额外权限

输入字段与约束：

```json
{
  "type": "object",
  "properties": {
    "pattern": {
      "type": "string",
      "maxLength": 1000000
    },
    "flags": {
      "type": "string",
      "maxLength": 1000000
    },
    "text": {
      "type": "string",
      "maxLength": 1000000
    }
  },
  "required": [
    "pattern",
    "flags",
    "text"
  ],
  "additionalProperties": false
}
```

输入示例：

```json
{
  "pattern": "(LR)-(?<tool>Toolbox)",
  "flags": "gi",
  "text": "LR-Toolbox / lr-toolbox"
}
```

实际示例输出：

```json
{
  "count": 2,
  "matches": [
    {
      "match": "LR-Toolbox",
      "index": 0,
      "groups": [
        "LR",
        "Toolbox"
      ],
      "named": {
        "tool": "Toolbox"
      }
    },
    {
      "match": "lr-toolbox",
      "index": 13,
      "groups": [
        "lr",
        "toolbox"
      ],
      "named": {
        "tool": "toolbox"
      }
    }
  ],
  "truncated": false
}
```

## CSS 渐变生成器

- 标识：`color.gradient.css`
- 分类：Colors
- 用途与限制：用两个 HEX 颜色和角度生成可直接复制的 linear-gradient CSS。
- 平台：web、windows、linux、macos、cli
- 风险：safe；权限：无额外权限

输入字段与约束：

```json
{
  "type": "object",
  "properties": {
    "start": {
      "type": "string",
      "maxLength": 1000000
    },
    "end": {
      "type": "string",
      "maxLength": 1000000
    },
    "angle": {
      "type": "number",
      "minimum": -360,
      "maximum": 360
    }
  },
  "required": [
    "start",
    "end",
    "angle"
  ],
  "additionalProperties": false
}
```

输入示例：

```json
{
  "start": "#596FE8",
  "end": "#A06DE4",
  "angle": 135
}
```

实际示例输出：

```json
"linear-gradient(135deg, #596FE8, #A06DE4)"
```

## 两份名单对比

- 标识：`text.lists.compare`
- 分类：Text
- 用途与限制：逐行精确比较两份名单，返回交集和各自独有项；去重、忽略空行，保留空格与首次出现顺序。
- 平台：web、windows、linux、macos、cli
- 风险：safe；权限：无额外权限

输入字段与约束：

```json
{
  "type": "object",
  "properties": {
    "left": {
      "type": "string",
      "maxLength": 1000000
    },
    "right": {
      "type": "string",
      "maxLength": 1000000
    }
  },
  "required": [
    "left",
    "right"
  ],
  "additionalProperties": false
}
```

输入示例：

```json
{
  "left": "李明\n王芳\n张伟",
  "right": "王芳\n赵敏"
}
```

实际示例输出：

```json
{
  "common": [
    "王芳"
  ],
  "onlyLeft": [
    "李明",
    "张伟"
  ],
  "onlyRight": [
    "赵敏"
  ]
}
```

## 重复行频次统计

- 标识：`text.lines.frequency`
- 分类：Text
- 用途与限制：统计每个非空行的出现次数，按频次降序排列，同频保留首次出现顺序；精确区分空格和大小写。
- 平台：web、windows、linux、macos、cli
- 风险：safe；权限：无额外权限

输入字段与约束：

```json
{
  "type": "object",
  "properties": {
    "text": {
      "type": "string",
      "maxLength": 1000000
    }
  },
  "required": [
    "text"
  ],
  "additionalProperties": false
}
```

输入示例：

```json
{
  "text": "apple\nbanana\napple\n梨\n梨\n梨"
}
```

实际示例输出：

```json
{
  "total": 6,
  "unique": 3,
  "rows": [
    {
      "value": "梨",
      "count": 3
    },
    {
      "value": "apple",
      "count": 2
    },
    {
      "value": "banana",
      "count": 1
    }
  ]
}
```

## 不可见字符检查

- 标识：`text.invisible.inspect`
- 分类：Text
- 用途与限制：定位常见控制字符、零宽字符、不换行空格及双向文本标记。位置为从 1 开始的 Unicode 码点序号；最多列出 10000 项，不修改原文。
- 平台：web、windows、linux、macos、cli
- 风险：safe；权限：无额外权限

输入字段与约束：

```json
{
  "type": "object",
  "properties": {
    "text": {
      "type": "string",
      "maxLength": 1000000
    }
  },
  "required": [
    "text"
  ],
  "additionalProperties": false
}
```

输入示例：

```json
{
  "text": "hello​ world !"
}
```

实际示例输出：

```json
{
  "total": 2,
  "truncated": false,
  "matches": [
    {
      "position": 6,
      "codepoint": "U+200B",
      "name": "ZERO WIDTH SPACE"
    },
    {
      "position": 13,
      "codepoint": "U+00A0",
      "name": "NO-BREAK SPACE"
    }
  ]
}
```

## 长文本等长分段

- 标识：`text.chunk`
- 分类：Text
- 用途与限制：按 Unicode 码点分段，不拆开 emoji 的代理对；组合字符或复合 emoji 可能跨段。每段 1–100000 码点，最多输出 10000 段。
- 平台：web、windows、linux、macos、cli
- 风险：safe；权限：无额外权限

输入字段与约束：

```json
{
  "type": "object",
  "properties": {
    "text": {
      "type": "string",
      "maxLength": 1000000
    },
    "size": {
      "type": "integer",
      "minimum": 1,
      "maximum": 100000
    }
  },
  "required": [
    "text",
    "size"
  ],
  "additionalProperties": false
}
```

输入示例：

```json
{
  "text": "一份长文，分段后更容易处理。",
  "size": 6
}
```

实际示例输出：

```json
[
  "一份长文，分",
  "段后更容易处",
  "理。"
]
```

## 链接追踪参数清理

- 标识：`url.tracking.clean`
- 分类：Developer
- 用途与限制：移除 HTTP(S) 链接中的 utm_*、fbclid、gclid、dclid、msclkid 和 mc_*id 参数，保留其他参数与片段；不访问链接，签名链接修改后可能失效。
- 平台：web、windows、linux、macos、cli
- 风险：safe；权限：无额外权限

输入字段与约束：

```json
{
  "type": "object",
  "properties": {
    "text": {
      "type": "string",
      "maxLength": 1000000
    }
  },
  "required": [
    "text"
  ],
  "additionalProperties": false
}
```

输入示例：

```json
{
  "text": "https://example.com/article?id=42&utm_source=share&fbclid=abc#intro"
}
```

实际示例输出：

```json
{
  "url": "https://example.com/article?id=42#intro",
  "removed": [
    "utm_source",
    "fbclid"
  ]
}
```

## JSON 合并补丁

- 标识：`json.merge.patch`
- 分类：JSON
- 用途与限制：按 RFC 7396 合并配置：对象递归合并，null 删除字段，数组及非对象整体替换。支持最多 64 层补丁对象；数字遵循 JS 精度。
- 平台：web、windows、linux、macos、cli
- 风险：safe；权限：无额外权限

输入字段与约束：

```json
{
  "type": "object",
  "properties": {
    "target": {
      "type": "string",
      "maxLength": 1000000
    },
    "patch": {
      "type": "string",
      "maxLength": 1000000
    }
  },
  "required": [
    "target",
    "patch"
  ],
  "additionalProperties": false
}
```

输入示例：

```json
{
  "target": "{\"name\":\"LR\",\"settings\":{\"theme\":\"light\",\"old\":true}}",
  "patch": "{\"settings\":{\"theme\":\"dark\",\"old\":null}}"
}
```

实际示例输出：

```json
"{\n  \"name\": \"LR\",\n  \"settings\": {\n    \"theme\": \"dark\"\n  }\n}"
```

# 特色工作台逐项说明

## 数据分析台

上传 CSV，用 SQL 完成筛选与汇总。

- 用途：浏览器数据分析 · JSON 导出
- 引擎/运行方式：DuckDB-Wasm
- [上游项目](https://github.com/duckdb/duckdb-wasm)
- 接入与平台限制：[逐项状态](LOCAL-INTEGRATIONS.md)。桌面配套入口不在浏览器执行。

## 重复文件整理

定位重复文件、空目录和相似图片。

- 用途：独立安装 · 扫描与预览指引
- 引擎/运行方式：Czkawka · 桌面配套
- [上游项目](https://github.com/qarmin/czkawka)
- 接入与平台限制：[逐项状态](LOCAL-INTEGRATIONS.md)。桌面配套入口不在浏览器执行。

## 无损音视频剪辑

快速整理长视频、录音和素材片段。

- 用途：独立安装 · 无损剪切使用指引
- 引擎/运行方式：LosslessCut · 桌面配套
- [上游项目](https://github.com/mifi/lossless-cut)
- 接入与平台限制：[逐项状态](LOCAL-INTEGRATIONS.md)。桌面配套入口不在浏览器执行。

## AI 编程助手

给编辑器部署自己的 AI 编程助手。

- 用途：Docker 启动脚本 · 部署指引
- 引擎/运行方式：Tabby · 独立服务
- [上游项目](https://github.com/TabbyML/tabby)
- 接入与平台限制：[逐项状态](LOCAL-INTEGRATIONS.md)。桌面配套入口不在浏览器执行。

## PDF 整理台

把零散资料，整理成一份完整文件。

- 用途：合并 · 提取页面 · 旋转 · 页码与水印
- 引擎/运行方式：pdf-lib
- [上游项目](https://github.com/Hopding/pdf-lib)
- 接入与平台限制：[逐项状态](LOCAL-INTEGRATIONS.md)。桌面配套入口不在浏览器执行。

## 图片轻量化

画面依旧清晰，文件轻装上阵。

- 用途：批量压缩 · 缩小尺寸 · JPEG / PNG / WebP
- 引擎/运行方式：Compressor.js
- [上游项目](https://github.com/fengyuanchen/compressorjs)
- 接入与平台限制：[逐项状态](LOCAL-INTEGRATIONS.md)。桌面配套入口不在浏览器执行。

## 图片裁剪台

留下你想表达的那一部分。

- 用途：拖拽选区 · 固定比例 · 旋转 · 导出 PNG
- 引擎/运行方式：Cropper.js
- [上游项目](https://github.com/fengyuanchen/cropperjs)
- 接入与平台限制：[逐项状态](LOCAL-INTEGRATIONS.md)。桌面配套入口不在浏览器执行。

## 图片转文字

让截图和扫描件，重新变成文字。

- 用途：中文 / 英文识别 · 编辑校对 · TXT 下载
- 引擎/运行方式：Tesseract.js
- [上游项目](https://github.com/naptha/tesseract.js)
- 接入与平台限制：[逐项状态](LOCAL-INTEGRATIONS.md)。桌面配套入口不在浏览器执行。

## Word 内容提取

提取正文与图片，专注内容本身。

- 用途：DOCX 排版预览 · 正文提取 · 内嵌图片下载
- 引擎/运行方式：Mammoth
- [上游项目](https://github.com/mwilliamson/mammoth.js)
- 接入与平台限制：[逐项状态](LOCAL-INTEGRATIONS.md)。桌面配套入口不在浏览器执行。

## 音视频小工坊

从一段视频，得到你需要的片段。

- 用途：提取音频 · 截取片段 · 转 MP4 · 制作 GIF
- 引擎/运行方式：ffmpeg.wasm
- [上游项目](https://github.com/ffmpegwasm/ffmpeg.wasm)
- 接入与平台限制：[逐项状态](LOCAL-INTEGRATIONS.md)。桌面配套入口不在浏览器执行。

## SQL 整理器

把拥挤的查询语句，变得一目了然。

- 用途：MySQL · PostgreSQL · SQLite · 统一缩进
- 引擎/运行方式：SQL Formatter
- [上游项目](https://github.com/sql-formatter-org/sql-formatter)
- 接入与平台限制：[逐项状态](LOCAL-INTEGRATIONS.md)。桌面配套入口不在浏览器执行。

## Mermaid 图表画布

把几行文本，变成可以展示的流程与关系。

- 用途：流程图 · 时序图 · ER · 甘特图 · SVG 导出
- 引擎/运行方式：Mermaid
- [上游项目](https://github.com/mermaid-js/mermaid)
- 接入与平台限制：[逐项状态](LOCAL-INTEGRATIONS.md)。桌面配套入口不在浏览器执行。

## Excel 数据台

不用打开 Office，也能快速看懂一张表。

- 用途：XLS / XLSX / CSV · Sheet 预览 · CSV / JSON / XLSX 导出
- 引擎/运行方式：@stackline/xlsx
- [上游项目](https://github.com/stackline/xlsx)
- 接入与平台限制：[逐项状态](LOCAL-INTEGRATIONS.md)。桌面配套入口不在浏览器执行。

## SVG 实验室

让矢量图更干净、更轻，也更容易检查。

- 用途：安全预览 · SVGO 优化 · 体积对比 · SVG 导出
- 引擎/运行方式：SVGO
- [上游项目](https://github.com/svg/svgo)
- 接入与平台限制：[逐项状态](LOCAL-INTEGRATIONS.md)。桌面配套入口不在浏览器执行。

## 照片信息台

一眼看懂照片背后的相机、镜头和隐私信息。

- 用途：EXIF · 相机参数 · GPS 隐私提示 · JSON 导出
- 引擎/运行方式：ExifReader
- [上游项目](https://github.com/mattiasw/ExifReader)
- 接入与平台限制：[逐项状态](LOCAL-INTEGRATIONS.md)。桌面配套入口不在浏览器执行。

## HEIC 图片转换

把 iPhone 照片，变成到处都能打开的图片。

- 用途：HEIC / HEIF · JPEG / PNG · 质量控制 · 本地下载
- 引擎/运行方式：heic2any
- [上游项目](https://github.com/alexcorvi/heic2any)
- 接入与平台限制：[逐项状态](LOCAL-INTEGRATIONS.md)。桌面配套入口不在浏览器执行。

## 图片配色工作室

从一张图里，抽出一套真正能用的颜色。

- 用途：主色 · 8 色色板 · 语义色 · CSS Variables
- 引擎/运行方式：Color Thief
- [上游项目](https://github.com/lokesh/color-thief)
- 接入与平台限制：[逐项状态](LOCAL-INTEGRATIONS.md)。桌面配套入口不在浏览器执行。

## HTML 卡片截图

把一段本地 HTML，做成可以分享的图片卡片。

- 用途：安全 HTML · 卡片尺寸 · 背景 · PNG 导出
- 引擎/运行方式：html2canvas
- [上游项目](https://github.com/niklasvh/html2canvas)
- 接入与平台限制：[逐项状态](LOCAL-INTEGRATIONS.md)。桌面配套入口不在浏览器执行。

## Cron 时间轴

别再猜表达式下一次到底什么时候运行。

- 用途：快捷模板 · 表达式校验 · 时区 · 后续 10 次运行
- 引擎/运行方式：cron-parser
- [上游项目](https://github.com/harrisiirak/cron-parser)
- 接入与平台限制：[逐项状态](LOCAL-INTEGRATIONS.md)。桌面配套入口不在浏览器执行。

## 密码强度实验室

不是只看长度，而是识别真实世界里的弱模式。

- 用途：强度仪表 · 模式分析 · 破解时间估算 · 不保存密码
- 引擎/运行方式：zxcvbn-ts
- [上游项目](https://github.com/zxcvbn-ts/zxcvbn)
- 接入与平台限制：[逐项状态](LOCAL-INTEGRATIONS.md)。桌面配套入口不在浏览器执行。

## 世界时间控制台

把时区、时间戳和日期差放在同一块时间面板。

- 用途：时区转换 · Unix / ISO · 日期差 · 世界时间
- 引擎/运行方式：Day.js
- [上游项目](https://github.com/iamkun/dayjs)
- 接入与平台限制：[逐项状态](LOCAL-INTEGRATIONS.md)。桌面配套入口不在浏览器执行。

## 开源与设备资源库

让上传资源和开源灵感，各有清晰的去处。

- 用途：四份资源 · 本地校验 · POC 文档索引 · 精选开源推荐
- 引擎/运行方式：Fuse.js + fflate
- [上游项目](https://github.com/krisk/Fuse)
- 接入与平台限制：[逐项状态](LOCAL-INTEGRATIONS.md)。桌面配套入口不在浏览器执行。

## 二维码识别台

从图片读出信息，链接由你决定是否打开。

- 用途：离线图片识别 · 纯文本结果 · 下载内容
- 引擎/运行方式：jsQR
- [上游项目](https://github.com/cozmo/jsQR)
- 接入与平台限制：[逐项状态](LOCAL-INTEGRATIONS.md)。桌面配套入口不在浏览器执行。

## 日历文件台

把日历文件，变成一目了然的事件表。

- 用途：ICS 解析 · 时区与重复规则 · JSON 导出
- 引擎/运行方式：ICAL.js
- [上游项目](https://github.com/kewisch/ical.js)
- 接入与平台限制：[逐项状态](LOCAL-INTEGRATIONS.md)。桌面配套入口不在浏览器执行。

## CyberChef 数据实验室

将数百项开源数据操作，串成可复用的处理配方。

- 用途：自托管完整应用 · 操作目录搜索 · 编码 / 分析 / 压缩
- 引擎/运行方式：CyberChef 11.5.0
- [上游项目](https://github.com/gchq/CyberChef)
- 接入与平台限制：[逐项状态](LOCAL-INTEGRATIONS.md)。桌面配套入口不在浏览器执行。

# 开源资源逐项说明

## Ghostfolio

统一记录股票、ETF 和加密资产持仓，查看资产配置与组合表现。国内场外基金覆盖需逐项核查，行情能力取决于数据提供商。

- 场景：资产组合记录与配置分析
- 当前状态：独立自托管服务 · 未在本站运行；不连接交易账户
- [官方项目](https://github.com/ghostfolio/ghostfolio)

## AKShare

Python 财经数据接口库，包含股票与公募基金数据接口，适合导出历史数据后在 DuckDB 分析。上游接口可能变更或限流，需遵守数据源条款并核对更新时间。

- 场景：股票历史数据 · 公募基金净值与资料研究
- 当前状态：本机 Python · 需安装；本站未提供实时行情 API
- [官方项目](https://github.com/akfamily/akshare)

## Freqtrade

开源加密资产策略研究工具，支持历史回测与 dry-run 模拟钱包。本站推荐先使用模拟模式；回测不代表未来收益，需计入手续费、滑点和数据偏差。

- 场景：历史策略回测 · dry-run 模拟研究
- 当前状态：独立部署 · 本站不运行机器人、不收集交易密钥、不下单
- [官方项目](https://github.com/freqtrade/freqtrade)

## jq

筛选、转换和聚合大型 JSON 数据，适合接口调试与批处理脚本。

- 场景：JSON 查询与数据流水线
- 当前状态：独立命令行 · 需单独安装
- [官方项目](https://github.com/jqlang/jq)

## fd

快速按名称和模式查找文件，适合代码库、资料库与日常目录检索。

- 场景：高效定位文件与批量查找
- 当前状态：独立命令行 · 需单独安装
- [官方项目](https://github.com/sharkdp/fd)

## gdu

交互查看磁盘空间被哪些目录占用，帮助找到大文件与清理候选项。

- 场景：磁盘占用分析
- 当前状态：独立命令行 · 需单独安装；删除操作需谨慎确认
- [官方项目](https://github.com/dundee/gdu)

## OCRmyPDF

给扫描 PDF 添加可搜索文字层，适合论文、讲义和档案检索。

- 场景：扫描件变为可检索 PDF
- 当前状态：本机命令行 · 需安装 Tesseract 等依赖
- [官方项目](https://github.com/ocrmypdf/OCRmyPDF)

## copyparty

轻量文件服务器，支持断点续传、媒体浏览和多种传输协议，适合自己的多设备资料库。

- 场景：局域网大文件共享与资料服务
- 当前状态：独立服务 · 需自行部署并配置访问权限
- [官方项目](https://github.com/9001/copyparty)

## Fast Music Remover

基于 DeepFilterNet 增强语音、减少背景音乐和噪声，适合口播素材预处理。

- 场景：语音素材降噪与背景音乐削弱
- 当前状态：本机程序 / Docker · 需单独安装
- [官方项目](https://github.com/omeryusufyagci/fast-music-remover)

## noble-hashes

分块核对大文件的 SHA-256 指纹，不依赖云端服务或安全上下文。

- 场景：资源包增量完整性校验
- 当前状态：已接入 · 资源库完整性比对
- [官方项目](https://github.com/paulmillr/noble-hashes)

## Excalidraw

把想法变成手绘白板，适合架构、课程笔记和头脑风暴。

- 场景：协作白板与可编辑图形
- 当前状态：外部项目 · 独立使用
- [官方项目](https://github.com/excalidraw/excalidraw)

## Docling

把复杂文档解析为结构化内容，适合论文资料库和 RAG 预处理。

- 场景：文档结构、表格与布局提取
- 当前状态：本机 Python · 需单独安装
- [官方项目](https://github.com/docling-project/docling)

## MarkItDown

将办公文件转成 Markdown，方便后续整理、检索和交给模型处理。

- 场景：多格式文档转 Markdown
- 当前状态：本机 Python · 需单独安装
- [官方项目](https://github.com/microsoft/markitdown)

## LocalSend

局域网里在电脑和手机之间传文件，适合多设备工作流。

- 场景：跨平台局域网文件传输
- 当前状态：独立客户端 · 需单独安装
- [官方项目](https://github.com/localsend/localsend)

## Stirling PDF

需要比轻量 PDF 工作台更多处理能力时，可以使用独立的 PDF 平台。

- 场景：完整 PDF 编辑与自托管
- 当前状态：外部项目 · 独立部署
- [官方项目](https://github.com/Stirling-Tools/Stirling-PDF)

## IT-Tools

界面清晰的开发工具集合，适合日常编码、转换与调试。

- 场景：开发者常用工具集
- 当前状态：外部项目 · 独立使用
- [官方项目](https://github.com/CorentinTh/it-tools)

## jsQR

图片里读出二维码内容，离线完成，识别出的链接由你自行决定是否打开。

- 场景：图片二维码识别与结果下载
- 当前状态：已接入 · 二维码识别台
- [官方项目](https://github.com/cozmo/jsQR)

## ICAL.js

把日历文件展开成清晰的事件表格，查看原始时区和重复规则。

- 场景：ICS 解析与 JSON 导出
- 当前状态：已接入 · 日历文件台
- [官方项目](https://github.com/kewisch/ical.js)

