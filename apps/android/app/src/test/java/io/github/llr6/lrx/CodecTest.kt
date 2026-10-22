package io.github.llr6.lrx
import org.junit.Assert.*
import org.junit.Test
class CodecTest {
    @Test fun unicodeRoundTrip() { for (codec in listOf("base64", "hex", "base64url")) { val text = "中文 空格 🧪"; assertEquals(text, Codec.run("encoding.$codec.decode", Codec.run("encoding.$codec.encode", text))) } }
    @Test fun knownOutputs() { assertEquals("LR", Codec.run("text.trim", "\uFEFF LR \u00A0")); assertEquals("ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad", Codec.run("hash.sha256", "abc")) }
    @Test fun largeValidBase64DoesNotExhaustParserStack() { val text = "LR工具".repeat(30000); for (codec in listOf("base64", "base64url")) assertEquals(text, Codec.run("encoding.$codec.decode", Codec.run("encoding.$codec.encode", text))) }
    @Test fun base64urlValidation() { for (text in listOf("Zh", "Zg==", "!", "a", "_w")) assertTrue(runCatching { Codec.run("encoding.base64url.decode", text) }.isFailure) }
    @Test fun textConversions() { assertEquals("a\nb\nc", Codec.run("text.newlines.lf", "a\r\nb\rc")); assertEquals("&lt;&amp;&quot;&#39;&gt;", Codec.run("text.html.escape", "<&\"'>")) }
    @Test fun invalidInputRejected() { for (id in Codec.ids) assertTrue(runCatching { Codec.run(id, "a".repeat(1000001)) }.isFailure); for (id in listOf("encoding.hex.decode", "encoding.base64.decode")) assertTrue(runCatching { Codec.run(id, "!!!!") }.isFailure); assertTrue(runCatching { Codec.run("missing", "") }.isFailure) }
}
