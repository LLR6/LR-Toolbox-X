package io.github.llr6.lrx

import java.nio.ByteBuffer
import java.nio.charset.CodingErrorAction
import java.security.MessageDigest
import java.util.Base64

/** Native implementations use the IDs and input contracts from the shared registry. */
object Codec {
    val ids = setOf("encoding.base64.encode", "encoding.base64.decode", "encoding.hex.encode", "encoding.hex.decode", "hash.sha256", "text.trim")
    private fun utf8(bytes: ByteArray): String = Charsets.UTF_8.newDecoder().onMalformedInput(CodingErrorAction.REPORT).onUnmappableCharacter(CodingErrorAction.REPORT).decode(ByteBuffer.wrap(bytes)).toString()
    fun run(id: String, text: String): String {
        require(text.length <= 1000000) { "Input exceeds 1,000,000 characters" }
        return when (id) {
            "encoding.base64.encode" -> Base64.getEncoder().encodeToString(text.toByteArray(Charsets.UTF_8))
            "encoding.base64.decode" -> {
                require(text.length % 4 == 0 && Regex("^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$").matches(text)) { "Invalid padded Base64" }
                utf8(Base64.getDecoder().decode(text))
            }
            "encoding.hex.encode" -> text.toByteArray(Charsets.UTF_8).joinToString("") { "%02x".format(it.toInt() and 255) }
            "encoding.hex.decode" -> {
                require(text.length % 2 == 0 && text.all { it in "0123456789abcdefABCDEF" }) { "Invalid hexadecimal value" }
                utf8(ByteArray(text.length / 2) { text.substring(it * 2, it * 2 + 2).toInt(16).toByte() })
            }
            "hash.sha256" -> MessageDigest.getInstance("SHA-256").digest(text.toByteArray(Charsets.UTF_8)).joinToString("") { "%02x".format(it.toInt() and 255) }
            "text.trim" -> text.trim { it in "\u0009\u000A\u000B\u000C\u000D\u0020\u00A0\u1680\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u2028\u2029\u202F\u205F\u3000\uFEFF" }
            else -> error("Unknown action")
        }
    }
}
