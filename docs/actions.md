# Implemented portable actions

Generated from executable registry. Native actions are listed separately.

| ID | 名称 | Category | Platforms | Risk |
|---|---|---|---|---|
| text.trim | 清理首尾空白 | Text | web, windows, linux, macos, cli | safe |
| text.lines.unique | 行去重 | Text | web, windows, linux, macos, cli | safe |
| text.lines.sort | 行排序 | Text | web, windows, linux, macos, cli | safe |
| text.lines.reverse | 倒序排列行 | Text | web, windows, linux, macos, cli | safe |
| text.lines.nonempty | 删除空白行 | Text | web, windows, linux, macos, cli | safe |
| text.stats | 文本统计 | Text | web, windows, linux, macos, cli | safe |
| text.replace | 字面替换 | Text | web, windows, linux, macos, cli | safe |
| text.normalize | Unicode 标准化 | Text | web, windows, linux, macos, cli | safe |
| text.newlines.lf | 统一换行 | Text | web, windows, linux, macos, cli | safe |
| text.lines.number | 添加行号 | Text | web, windows, linux, macos, cli | safe |
| text.html.escape | HTML 转义 | Encoding | web, windows, linux, macos, cli | safe |
| encoding.base64.encode | Base64 编码 | Encoding | web, windows, linux, macos, cli | safe |
| encoding.base64.decode | Base64 解码 | Encoding | web, windows, linux, macos, cli | safe |
| encoding.hex.encode | 十六进制编码 | Encoding | web, windows, linux, macos, cli | safe |
| encoding.hex.decode | 十六进制解码 | Encoding | web, windows, linux, macos, cli | safe |
| encoding.uri.encode | URL 组件编码 | Encoding | web, windows, linux, macos, cli | safe |
| encoding.uri.decode | URL 组件解码 | Encoding | web, windows, linux, macos, cli | safe |
| encoding.binary.encode | UTF-8 二进制 | Encoding | web, windows, linux, macos, cli | safe |
| encoding.binary.decode | 二进制解码 | Encoding | web, windows, linux, macos, cli | safe |
| encoding.codepoints | Unicode 码点 | Encoding | web, windows, linux, macos, cli | safe |
| developer.jwt.inspect | JWT 查看 | Developer | web, windows, linux, macos, cli | safe |
| json.format | JSON 格式化 | JSON | web, windows, linux, macos, cli | safe |
| json.minify | JSON 压缩 | JSON | web, windows, linux, macos, cli | safe |
| json.validate | JSON 校验 | JSON | web, windows, linux, macos, cli | safe |
| json.keys | JSON 键列表 | JSON | web, windows, linux, macos, cli | safe |
| json.sort | JSON 键排序 | JSON | web, windows, linux, macos, cli | safe |
| json.pointer | JSON Pointer 查询 | JSON | web, windows, linux, macos, cli | safe |
| json.array.ndjson | JSON 转 NDJSON | JSON | web, windows, linux, macos, cli | safe |
| json.ndjson.array | NDJSON 转 JSON | JSON | web, windows, linux, macos, cli | safe |
| url.parse | URL 解析 | Developer | web, windows, linux, macos, cli | safe |
| url.query.parse | 查询参数解析 | Developer | web, windows, linux, macos, cli | safe |
| url.query.build | 构建查询参数 | Developer | web, windows, linux, macos, cli | safe |
| time.iso.timestamp | 日期转时间戳 | Time | web, windows, linux, macos, cli | safe |
| time.timestamp.iso | 时间戳转日期 | Time | web, windows, linux, macos, cli | safe |
| time.difference | 日期差值 | Time | web, windows, linux, macos, cli | safe |
| color.hex.rgb | HEX 转 RGB | Colors | web, windows, linux, macos, cli | safe |
| color.rgb.hex | RGB 转 HEX | Colors | web, windows, linux, macos, cli | safe |
| color.contrast | 颜色对比度 | Colors | web, windows, linux, macos, cli | safe |
| developer.uuid.v4 | UUID v4 | Developer | web, windows, linux, macos, cli | safe |
| hash.sha256 | SHA-256 | Hash | web, windows, linux, macos, cli | safe |
| hash.sha384 | SHA-384 | Hash | web, windows, linux, macos, cli | safe |
| hash.sha512 | SHA-512 | Hash | web, windows, linux, macos, cli | safe |
| math.statistics | 数列统计 | Math | web, windows, linux, macos, cli | safe |
| math.gcd | 最大公约数 | Math | web, windows, linux, macos, cli | safe |
| math.lcm | 最小公倍数 | Math | web, windows, linux, macos, cli | safe |
| numbers.base.convert | 进制转换 | Numbers | web, windows, linux, macos, cli | safe |
| math.quadratic | 一元二次方程 | Math | web, windows, linux, macos, cli | safe |
| units.temperature | 温度换算 | Units | web, windows, linux, macos, cli | safe |
| units.length | 长度换算 | Units | web, windows, linux, macos, cli | safe |
| units.bytes | 存储大小换算 | Units | web, windows, linux, macos, cli | safe |
| units.pressure | 压力换算 | Units | web, windows, linux, macos, cli | safe |
| units.mass | 质量换算 | Units | web, windows, linux, macos, cli | safe |
| numbers.roman | 罗马数字 | Numbers | web, windows, linux, macos, cli | safe |
| numbers.percent | 百分比变化 | Numbers | web, windows, linux, macos, cli | safe |
| csv.to.json | CSV 转 JSON | CSV | web, windows, linux, macos, cli | safe |
| csv.from.json | JSON 转 CSV | CSV | web, windows, linux, macos, cli | safe |
| csv.transpose | CSV 行列转置 | CSV | web, windows, linux, macos, cli | safe |
| csv.stats | CSV 数据概览 | CSV | web, windows, linux, macos, cli | safe |
| semver.parse | 语义版本解析 | Developer | web, windows, linux, macos, cli | safe |
| semver.compare | 语义版本比较 | Developer | web, windows, linux, macos, cli | safe |
| semver.bump | 版本号递增 | Developer | web, windows, linux, macos, cli | safe |
| dotenv.parse | 环境变量解析 | Developer | web, windows, linux, macos, cli | safe |
| dotenv.format | 生成环境变量文件 | Developer | web, windows, linux, macos, cli | safe |
| http.headers.parse | HTTP 请求头解析 | Developer | web, windows, linux, macos, cli | safe |
| http.cookie.parse | Cookie 字段解析 | Developer | web, windows, linux, macos, cli | safe |
| http.basic.encode | Basic Auth 编码 | Developer | web, windows, linux, macos, cli | safe |
| http.basic.decode | Basic Auth 解码 | Developer | web, windows, linux, macos, cli | safe |
| developer.uuid.inspect | UUID 信息查看 | Developer | web, windows, linux, macos, cli | safe |
| csv.select | CSV 选择列 | CSV | web, windows, linux, macos, cli | safe |
| csv.filter | CSV 条件筛选 | CSV | web, windows, linux, macos, cli | safe |
| csv.sort | CSV 稳定排序 | CSV | web, windows, linux, macos, cli | safe |
| csv.unique | CSV 按列去重 | CSV | web, windows, linux, macos, cli | safe |
| csv.rename | CSV 重命名列 | CSV | web, windows, linux, macos, cli | safe |
| csv.aggregate | CSV 分组数值汇总 | CSV | web, windows, linux, macos, cli | safe |
| qr.generate | 二维码生成 | QR | web, windows, linux, macos, cli | safe |
| archive.gzip.compress | 文本压缩为 GZIP | Archive | web, windows, linux, macos, cli | safe |
| archive.gzip.decompress | GZIP 解压文本 | Archive | web, windows, linux, macos, cli | safe |
| archive.zlib.compress | 文本压缩为 Zlib | Archive | web, windows, linux, macos, cli | safe |
| archive.zlib.decompress | Zlib 解压文本 | Archive | web, windows, linux, macos, cli | safe |
| archive.zip.create | 文本文件打包 ZIP | Archive | web, windows, linux, macos, cli | safe |
| archive.zip.list | ZIP 文件目录 | Archive | web, windows, linux, macos, cli | safe |
| archive.zip.extract | ZIP 提取单个文件 | Archive | web, windows, linux, macos, cli | safe |
| text.diff | 文本差异对比 | Diff | web, windows, linux, macos, cli | safe |
| patch.create | 生成统一补丁 | Diff | web, windows, linux, macos, cli | safe |
| patch.apply | 应用文本补丁 | Diff | web, windows, linux, macos, cli | safe |
| yaml.to.json | YAML 转 JSON | YAML | web, windows, linux, macos, cli | safe |
| yaml.from.json | JSON 转 YAML | YAML | web, windows, linux, macos, cli | safe |
| yaml.validate | YAML 校验与概览 | YAML | web, windows, linux, macos, cli | safe |
| markdown.render | Markdown 排版预览 | Markdown | web, windows, linux, macos, cli | safe |
| code.format.javascript | JavaScript 格式化 | Code | web, windows, linux, macos, cli | safe |
| code.format.typescript | TypeScript 格式化 | Code | web, windows, linux, macos, cli | safe |
| code.format.css | CSS 格式化 | Code | web, windows, linux, macos, cli | safe |
| code.format.html | HTML 格式化 | Code | web, windows, linux, macos, cli | safe |
| xml.to.json | XML 转有序 JSON | XML | web, windows, linux, macos, cli | safe |
| xml.validate | XML 语法校验 | XML | web, windows, linux, macos, cli | safe |
| xml.inspect | XML 结构浏览 | XML | web, windows, linux, macos, cli | safe |
| sql.format | SQL 格式化 | Code | web, windows, linux, macos, cli | safe |
| network.ipv4.inspect | IPv4 子网计算 | Network | web, windows, linux, macos, cli | safe |
| network.ipv4.to_integer | IPv4 转整数 | Network | web, windows, linux, macos, cli | safe |
| network.ipv4.from_integer | 整数转 IPv4 | Network | web, windows, linux, macos, cli | safe |
| network.ipv6.normalize | IPv6 地址规范化 | Network | web, windows, linux, macos, cli | safe |
| network.mac.inspect | MAC 地址解析 | Network | web, windows, linux, macos, cli | safe |
| network.cidr.contains | IP 网段归属判断 | Network | web, windows, linux, macos, cli | safe |
| network.cidr.subnets | IPv4 子网划分 | Network | web, windows, linux, macos, cli | safe |
| encoding.base64url.encode | Base64URL 编码 | Encoding | web, windows, linux, macos, cli | safe |
| encoding.base64url.decode | Base64URL 解码 | Encoding | web, windows, linux, macos, cli | safe |
| crypto.random.bytes | 安全随机字节 | Crypto | web, windows, linux, macos, cli | safe |
| crypto.hmac.sha256 | HMAC SHA-256 | Crypto | web, windows, linux, macos, cli | safe |
| markdown.toc | Markdown 目录生成 | Markdown | web, windows, linux, macos, cli | safe |
| markdown.links | Markdown 链接提取 | Markdown | web, windows, linux, macos, cli | safe |
| markdown.table | CSV 转 Markdown 表格 | Markdown | web, windows, linux, macos, cli | safe |
| time.iso_week | ISO 周数计算 | Time | web, windows, linux, macos, cli | safe |
| time.duration.parse | ISO 时长解析 | Time | web, windows, linux, macos, cli | safe |
| time.timezone.format | 时区时间转换 | Time | web, windows, linux, macos, cli | safe |
| math.matrix.transpose | 矩阵转置 | Math | web, windows, linux, macos, cli | safe |
| math.matrix.multiply | 矩阵乘法 | Math | web, windows, linux, macos, cli | safe |
| math.matrix.determinant | 矩阵行列式 | Math | web, windows, linux, macos, cli | safe |
| math.matrix.solve | 线性方程组求解 | Math | web, windows, linux, macos, cli | safe |
| math.matrix.inverse | 矩阵求逆 | Math | web, windows, linux, macos, cli | safe |
| math.combinations | 组合数计算 | Math | web, windows, linux, macos, cli | safe |
| math.factorial | 大整数阶乘 | Math | web, windows, linux, macos, cli | safe |
| numbers.primality | 质数判断 | Numbers | web, windows, linux, macos, cli | safe |
| math.fraction.reduce | 分数约分 | Math | web, windows, linux, macos, cli | safe |
| json.repair | JSON 智能修复 | JSON | web, windows, linux, macos, cli | safe |
| json.flatten | JSON 扁平化 | JSON | web, windows, linux, macos, cli | safe |
| html.to.markdown | HTML 转 Markdown | Markdown | web, windows, linux, macos, cli | safe |
| developer.regex.test | 正则表达式测试器 | Developer | web, windows, linux, macos, cli | safe |
| color.gradient.css | CSS 渐变生成器 | Colors | web, windows, linux, macos, cli | safe |
