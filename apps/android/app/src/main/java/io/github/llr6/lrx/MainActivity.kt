package io.github.llr6.lrx

import android.os.Bundle
import android.graphics.BitmapFactory
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.selection.SelectionContainer
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.asImageBitmap
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalClipboardManager
import androidx.compose.ui.platform.LocalConfiguration
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.AnnotatedString
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import androidx.compose.ui.window.DialogProperties
import org.json.JSONArray
import org.json.JSONObject

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        val catalog = JSONArray(assets.open("action-catalog.json").bufferedReader().use { it.readText() })
        val tools = (0 until catalog.length()).map { catalog.getJSONObject(it) }.filter { it.getString("id") in Codec.ids }
        val prefs = getSharedPreferences("lrx", MODE_PRIVATE)
        val backdrop = assets.open("alpine-dusk.png").use { BitmapFactory.decodeStream(it).asImageBitmap() }
        val version = packageManager.getPackageInfo(packageName, 0).versionName ?: ""
        setContent {
            val scheme = darkColorScheme(primary = Color(0xFFA6B8FF), background = Color(0xFF090F1A), surface = Color(0xFF111E30), secondary = Color(0xFFC0A6EE), outline = Color(0xFF30455E))
            MaterialTheme(colorScheme = scheme) {
                var selected by remember { mutableStateOf<String?>(null) }
                var query by remember { mutableStateOf("") }
                var input by remember { mutableStateOf("") }
                var output by remember { mutableStateOf("") }
                var hasRun by remember { mutableStateOf(false) }
                var problem by remember { mutableStateOf(false) }
                var history by remember { mutableStateOf(prefs.getString("last", "") ?: "") }
                val filtered = tools.filter { it.getString("name").contains(query, true) || it.getString("id").contains(query, true) }
                val clipboard = LocalClipboardManager.current
                val screenHeight = LocalConfiguration.current.screenHeightDp.dp
                Surface(Modifier.fillMaxSize()) {
                    LazyColumn(Modifier.fillMaxSize(), verticalArrangement = Arrangement.spacedBy(16.dp), contentPadding = PaddingValues(start = 20.dp, end = 20.dp, top = 26.dp, bottom = 30.dp)) {
                        item {
                            Row(Modifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.SpaceBetween) {
                                Column { Text("LR Toolbox X", style = MaterialTheme.typography.titleLarge); Text("YOUR PERSONAL PRODUCTIVITY SPACE", fontSize = 8.sp, color = scheme.onSurfaceVariant, letterSpacing = 1.sp) }
                                Text("v$version", fontSize = 10.sp, color = scheme.primary)
                            }
                        }
                        item {
                            Box(Modifier.fillMaxWidth().height(225.dp).clip(RoundedCornerShape(20.dp))) {
                                Image(backdrop, contentDescription = null, modifier = Modifier.fillMaxSize(), contentScale = ContentScale.Crop)
                                Box(Modifier.fillMaxSize().background(Brush.verticalGradient(listOf(Color(0x11202A46), Color(0xF00A172C)))))
                                Column(Modifier.align(Alignment.BottomStart).padding(22.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                                    Text("LOCAL FIRST · NATIVE ANDROID", fontSize = 9.sp, letterSpacing = 1.sp, color = Color(0xFFCBD5F5))
                                    Text("让一切更高效", style = MaterialTheme.typography.headlineMedium, color = Color.White)
                                    Text("${tools.size} 个原生工具，连接每一次灵感与行动。", fontSize = 11.sp, color = Color(0xFFD9E1FA))
                                }
                            }
                        }
                        item {
                            Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                                StatTile("${tools.size}", "原生工具", Modifier.weight(1f))
                                StatTile("100%", "离线计算", Modifier.weight(1f))
                                StatTile("0", "内容上传", Modifier.weight(1f))
                            }
                        }
                        item { OutlinedTextField(query, { query = it }, label = { Text("搜索工具 / Search") }, singleLine = true, shape = RoundedCornerShape(14.dp), modifier = Modifier.fillMaxWidth()) }
                        item { Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) { Text("精选实用工具", style = MaterialTheme.typography.titleMedium); Text("${filtered.size} 个可用", fontSize = 11.sp, color = scheme.onSurfaceVariant) } }
                        items(filtered.chunked(2)) { row ->
                            Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                                for (tool in row) ToolTile(tool, Modifier.weight(1f)) { selected = tool.getString("id"); input = tool.getJSONObject("example").getString("text"); output = ""; problem = false; hasRun = false }
                                if (row.size == 1) Spacer(Modifier.weight(1f))
                            }
                        }
                        if (filtered.isEmpty()) item { Text("没有匹配的工具，试试 Base64、SHA 或文本。", color = scheme.onSurfaceVariant) }
                        item {
                            Surface(shape = RoundedCornerShape(16.dp), color = scheme.surface) {
                                Column(Modifier.fillMaxWidth().padding(18.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                                    Text("最近执行", style = MaterialTheme.typography.titleSmall)
                                    Text(history.ifEmpty { "运行工具后，记录会显示在这里。" }, fontSize = 11.sp, color = scheme.onSurfaceVariant)
                                    if (history.isNotEmpty()) TextButton(onClick = { prefs.edit().remove("last").apply(); history = "" }) { Text("清空记录") }
                                }
                            }
                        }
                        item { Text("无需登录 · 无网络权限 · 输入与结果不写入历史", fontSize = 9.sp, color = scheme.onSurfaceVariant) }
                    }
                    if (selected != null) {
                        val tool = tools.first { it.getString("id") == selected }
                        Dialog(onDismissRequest = { selected = null }, properties = DialogProperties(usePlatformDefaultWidth = false)) {
                            Surface(Modifier.widthIn(max = 560.dp).fillMaxWidth(0.94f).heightIn(max = screenHeight * 0.86f).imePadding(), shape = RoundedCornerShape(22.dp), color = scheme.surface) {
                                Column(Modifier.verticalScroll(rememberScrollState()).padding(22.dp), verticalArrangement = Arrangement.spacedBy(14.dp)) {
                                    Row(Modifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically) {
                                        Image(painterResource(iconFor(tool)), contentDescription = null, modifier = Modifier.size(50.dp))
                                        Column(Modifier.weight(1f).padding(start = 10.dp)) { Text(tool.getString("name"), style = MaterialTheme.typography.titleMedium); Text(tool.getString("id"), fontSize = 9.sp, color = scheme.onSurfaceVariant) }
                                        TextButton(onClick = { selected = null }, contentPadding = PaddingValues(4.dp)) { Text("关闭") }
                                    }
                                    Text(tool.getString("description"), fontSize = 12.sp, color = scheme.onSurfaceVariant, lineHeight = 20.sp)
                                    OutlinedTextField(input, { input = it }, label = { Text("输入文本") }, modifier = Modifier.fillMaxWidth(), minLines = 4, maxLines = 7, shape = RoundedCornerShape(12.dp))
                                    Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                                        Button(onClick = {
                                            val start = System.nanoTime()
                                            val result = runCatching { Codec.run(selected!!, input) }
                                            hasRun = true
                                            problem = result.isFailure
                                            output = result.getOrElse { "ActionError · ${it.message ?: "Invalid input"}" }
                                            history = "${tool.getString("name")} · ${if (problem) "失败" else "成功"} · ${(System.nanoTime() - start) / 1000000} ms"
                                            prefs.edit().putString("last", history).apply()
                                        }, shape = RoundedCornerShape(10.dp)) { Text("运行工具") }
                                        OutlinedButton(onClick = { input = tool.getJSONObject("example").getString("text"); output = ""; problem = false; hasRun = false }, shape = RoundedCornerShape(10.dp)) { Text("填入示例") }
                                    }
                                    if (hasRun) {
                                        HorizontalDivider(color = scheme.outline)
                                        Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) { Text(if (problem) "执行错误" else "执行结果", style = MaterialTheme.typography.titleSmall); TextButton(onClick = { clipboard.setText(AnnotatedString(output)) }) { Text("复制") } }
                                        SelectionContainer { Text(output.ifEmpty { "（空文本）" }, color = if (problem) scheme.error else scheme.onSurface, fontFamily = FontFamily.Monospace, fontSize = 12.sp, lineHeight = 21.sp) }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}
private fun iconFor(tool: JSONObject): Int = when (tool.getString("category")) { "Hash", "Crypto" -> R.drawable.tool_shield; "Text" -> R.drawable.tool_document; else -> R.drawable.tool_encoding }
@Composable private fun ToolTile(tool: JSONObject, modifier: Modifier, onClick: () -> Unit) {
    Card(onClick = onClick, modifier = modifier.height(148.dp), shape = RoundedCornerShape(16.dp), colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface), border = androidx.compose.foundation.BorderStroke(1.dp, MaterialTheme.colorScheme.outline.copy(alpha = 0.6f))) {
        Column(Modifier.padding(15.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
            Image(painterResource(iconFor(tool)), contentDescription = null, modifier = Modifier.size(48.dp))
            Text(tool.getString("name"), fontSize = 13.sp, maxLines = 1, overflow = TextOverflow.Ellipsis)
            Text(tool.getString("description"), fontSize = 9.sp, lineHeight = 14.sp, color = MaterialTheme.colorScheme.onSurfaceVariant, maxLines = 2, overflow = TextOverflow.Ellipsis)
        }
    }
}
@Composable private fun StatTile(value: String, label: String, modifier: Modifier) {
    Surface(modifier, shape = RoundedCornerShape(12.dp), color = MaterialTheme.colorScheme.surface) {
        Column(Modifier.padding(vertical = 14.dp), horizontalAlignment = Alignment.CenterHorizontally, verticalArrangement = Arrangement.spacedBy(5.dp)) {
            Text(value, fontSize = 20.sp, color = MaterialTheme.colorScheme.primary)
            Text(label, fontSize = 9.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
        }
    }
}
