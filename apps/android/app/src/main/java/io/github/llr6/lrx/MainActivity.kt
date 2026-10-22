package io.github.llr6.lrx

import android.os.Bundle
import android.graphics.BitmapFactory
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.ui.Alignment
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.asImageBitmap
import androidx.compose.ui.layout.ContentScale
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import org.json.JSONArray

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        val catalog = JSONArray(assets.open("action-catalog.json").bufferedReader().use { it.readText() })
        val tools = (0 until catalog.length()).map { catalog.getJSONObject(it) }.filter { it.getString("id") in Codec.ids }
        val prefs = getSharedPreferences("lrx", MODE_PRIVATE)
        val backdrop = assets.open("alpine-dusk.png").use { BitmapFactory.decodeStream(it).asImageBitmap() }
        setContent {
            val scheme = darkColorScheme(primary = Color(0xFFA6B3FF), background = Color(0xFF0C1020), surface = Color(0xFF141C30), secondary = Color(0xFFC0A6EE))
            MaterialTheme(colorScheme = scheme) {
                var selected by remember { mutableStateOf<String?>(null) }
                var query by remember { mutableStateOf("") }
                var input by remember { mutableStateOf("") }
                var output by remember { mutableStateOf("") }
                var problem by remember { mutableStateOf(false) }
                var history by remember { mutableStateOf(prefs.getString("last", "") ?: "") }
                Surface(Modifier.fillMaxSize()) {
                    LazyColumn(Modifier.fillMaxSize().padding(24.dp), verticalArrangement = Arrangement.spacedBy(14.dp), contentPadding = PaddingValues(top = 24.dp, bottom = 24.dp)) {
                        item {
                            Box(Modifier.fillMaxWidth().height(225.dp).clip(RoundedCornerShape(20.dp))) {
                                Image(backdrop, contentDescription = null, modifier = Modifier.fillMaxSize(), contentScale = ContentScale.Crop)
                                Box(Modifier.fillMaxSize().background(Brush.verticalGradient(listOf(Color(0x22202A46), Color(0xEE0C142B)))))
                                Column(Modifier.align(Alignment.BottomStart).padding(22.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                                    Text("LR TOOLBOX X", style = MaterialTheme.typography.labelSmall, color = Color(0xFFCBD5F5))
                                    Text("让一切更高效", style = MaterialTheme.typography.headlineMedium, color = Color.White)
                                    Text("6 个原生工具 · 本地运行 · v0.2.0", style = MaterialTheme.typography.bodySmall, color = Color(0xFFD9E1FA))
                                }
                            }
                        }
                        item { Text("无需登录。无网络权限。所有计算在本机完成。", style = MaterialTheme.typography.bodySmall) }
                        item { OutlinedTextField(query, { query = it }, label = { Text("搜索工具 / Search") }, modifier = Modifier.fillMaxWidth()) }
                        items(tools.filter { it.getString("name").contains(query, true) || it.getString("id").contains(query, true) }) { tool ->
                            Card(shape = RoundedCornerShape(14.dp), colors = CardDefaults.cardColors(containerColor = scheme.surface), onClick = { selected = tool.getString("id"); input = tool.getJSONObject("example").getString("text"); output = ""; problem = false }, modifier = Modifier.fillMaxWidth()) {
                                Column(Modifier.padding(18.dp)) { Text(tool.getString("name"), style = MaterialTheme.typography.titleMedium); Text(tool.getString("id"), style = MaterialTheme.typography.bodySmall) }
                            }
                        }
                        if (selected != null) {
                            item { HorizontalDivider(); Text(selected!!, color = scheme.primary) }
                            item { OutlinedTextField(input, { input = it }, label = { Text("text") }, modifier = Modifier.fillMaxWidth(), minLines = 4) }
                            item { Button(onClick = {
                                val start = System.nanoTime()
                                val result = runCatching { Codec.run(selected!!, input) }
                                problem = result.isFailure
                                output = result.getOrElse { "ActionError · ${it.message ?: "Invalid input"}" }
                                history = "${selected!!} · ${if (problem) "error" else "success"} · ${(System.nanoTime() - start) / 1000000} ms"
                                prefs.edit().putString("last", history).apply()
                            }) { Text("运行工具 / Run action") } }
                            if (output.isNotEmpty()) item { Text(output, color = if (problem) scheme.error else scheme.onSurface) }
                        }
                        item { HorizontalDivider(); Text("最近执行 / Recent", style = MaterialTheme.typography.titleSmall); Text(history.ifEmpty { "还没有记录" }, style = MaterialTheme.typography.bodySmall) }
                        item { TextButton(onClick = { prefs.edit().clear().apply(); history = "" }) { Text("清空记录 / Clear history") } }
                    }
                }
            }
        }
    }
}
