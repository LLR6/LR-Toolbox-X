package io.github.llr6.lrx
import org.junit.Assert.*
import org.junit.Test
class CodecTest {
    @Test fun unicodeRoundTrip() { for (codec in listOf("base64", "hex")) { val text = "中文 空格 🧪"; assertEquals(text, Codec.run("encoding.$codec.decode", Codec.run("encoding.$codec.encode", text))) } }
    @Test fun knownOutputs() { assertEquals("LR", Codec.run("text.trim", "\uFEFF LR \u00A0")); assertEquals("ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad", Codec.run("hash.sha256", "abc")) }
    @Test fun invalidInputRejected() { for (id in Codec.ids) assertTrue(runCatching { Codec.run(id, "a".repeat(1000001)) }.isFailure); for (id in listOf("encoding.hex.decode", "encoding.base64.decode")) assertTrue(runCatching { Codec.run(id, "!!!!") }.isFailure); assertTrue(runCatching { Codec.run("missing", "") }.isFailure) }
}
