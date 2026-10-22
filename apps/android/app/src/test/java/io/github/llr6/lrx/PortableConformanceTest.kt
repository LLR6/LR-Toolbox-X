// Generated against the executable portable registry by npm run catalog.
package io.github.llr6.lrx
import org.junit.Assert.assertEquals
import org.junit.Test
class PortableConformanceTest {
    @Test fun sharedExamplesMatchNativeHandlers() {
        val fixtures = listOf(
            Triple("encoding.base64.encode", "你好", "5L2g5aW9"),
            Triple("encoding.base64.decode", "5L2g5aW9", "你好"),
            Triple("encoding.hex.encode", "LR", "4c52"),
            Triple("encoding.hex.decode", "4c52", "LR"),
            Triple("encoding.base64url.encode", "Hello?", "SGVsbG8_"),
            Triple("encoding.base64url.decode", "SGVsbG8_", "Hello?"),
            Triple("hash.sha256", "abc", "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad"),
            Triple("hash.sha384", "abc", "cb00753f45a35e8bb5a03d699ac65007272c32ab0eded1631a8b605a43ff5bed8086072ba1e7cc2358baeca134c825a7"),
            Triple("hash.sha512", "abc", "ddaf35a193617abacc417349ae20413112e6fa4e89a97ea20a9eeee64b55d39a2192992a274fc1a836ba3c23a3feebbd454d4423643ce80e2a9ac94fa54ca49f"),
            Triple("text.trim", "  你好  ", "你好"),
            Triple("text.newlines.lf", "a\r\nb\rc", "a\nb\nc"),
            Triple("text.html.escape", "<b>&\"", "&lt;b&gt;&amp;&quot;")
        )
        assertEquals(Codec.ids, fixtures.map { it.first }.toSet())
        for ((id, input, expected) in fixtures) assertEquals(id, expected, Codec.run(id, input))
    }
}
