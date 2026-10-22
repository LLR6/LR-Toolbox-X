package io.github.llr6.lrx

import java.nio.ByteBuffer
import java.nio.charset.CodingErrorAction
import java.security.MessageDigest
import java.util.Base64

/** Native implementations use the IDs and input contracts from the shared registry. */
object Codec {
    val ids = NativeActionIds.values
    private fun utf8(bytes: ByteArray): String = Charsets.UTF_8.newDecoder().onMalformedInput(CodingErrorAction.REPORT).onUnmappableCharacter(CodingErrorAction.REPORT).decode(ByteBuffer.wrap(bytes)).toString()
    fun run(id: String, text: String): String {
        require(text.length <= 1000000) { "Input exceeds 1,000,000 characters" }
        return when (id) {
            "encoding.base64.encode" -> Base64.getEncoder().encodeToString(text.toByteArray(Charsets.UTF_8))
            "encoding.base64.decode" -> {
                val core = text.trimEnd('=')
                val padding = text.length - core.length
                require(text.length % 4 == 0 && padding <= 2 && core.all { it in "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/" }) { "Invalid padded Base64" }
                utf8(Base64.getDecoder().decode(text))
            }
            "encoding.hex.encode" -> text.toByteArray(Charsets.UTF_8).joinToString("") { "%02x".format(it.toInt() and 255) }
            "encoding.hex.decode" -> {
                require(text.length % 2 == 0 && text.all { it in "0123456789abcdefABCDEF" }) { "Invalid hexadecimal value" }
                utf8(ByteArray(text.length / 2) { text.substring(it * 2, it * 2 + 2).toInt(16).toByte() })
            }
            "encoding.base64url.encode" -> Base64.getUrlEncoder().withoutPadding().encodeToString(text.toByteArray(Charsets.UTF_8))
            "encoding.base64url.decode" -> {
                require(text.all { it in "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_-" } && text.length % 4 != 1) { "Invalid unpadded Base64URL" }
                val bytes = Base64.getUrlDecoder().decode(text)
                require(Base64.getUrlEncoder().withoutPadding().encodeToString(bytes) == text) { "Noncanonical Base64URL" }
                utf8(bytes)
            }
            "hash.sha256", "hash.sha384", "hash.sha512" -> MessageDigest.getInstance(when(id) { "hash.sha384" -> "SHA-384"; "hash.sha512" -> "SHA-512"; else -> "SHA-256" }).digest(text.toByteArray(Charsets.UTF_8)).joinToString("") { "%02x".format(it.toInt() and 255) }
            "text.trim" -> text.trim { it in "\u0009\u000A\u000B\u000C\u000D\u0020\u00A0\u1680\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u2028\u2029\u202F\u205F\u3000\uFEFF" }
            "text.newlines.lf" -> text.replace("\r\n", "\n").replace("\r", "\n")
            "text.html.escape" -> buildString { for (character in text) append(when(character) { '&' -> "&amp;"; '<' -> "&lt;"; '>' -> "&gt;"; '"' -> "&quot;"; '\'' -> "&#39;"; else -> character.toString() }) }
            else -> error("Unknown action")
        }
    }
}
