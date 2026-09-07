package com.integra.qr

import android.graphics.Bitmap
import androidx.compose.ui.graphics.ImageBitmap
import androidx.compose.ui.graphics.asImageBitmap
import com.google.zxing.BarcodeFormat
import com.google.zxing.EncodeHintType
import com.google.zxing.qrcode.QRCodeWriter
import com.google.zxing.qrcode.decoder.ErrorCorrectionLevel
import java.util.EnumMap

object QrCodeGenerator {

    /**
     * Gera um Bitmap do Android representando o QR Code do conteúdo fornecido.
     * @param content Texto ou hash da credencial para codificação (ex: "INTEGRA:V1:UT_123")
     * @param size Largura e altura em pixels da imagem gerada
     * @return Bitmap nítido do QR Code gerado
     */
    fun generateBitmap(content: String, size: Int = 512): Bitmap {
        val hints = EnumMap<EncodeHintType, Any>(EncodeHintType::class.java).apply {
            put(EncodeHintType.CHARACTER_SET, "UTF-8")
            put(EncodeHintType.ERROR_CORRECTION, ErrorCorrectionLevel.M)
            put(EncodeHintType.MARGIN, 1)
        }

        val writer = QRCodeWriter()
        val bitMatrix = writer.encode(content, BarcodeFormat.QR_CODE, size, size, hints)
        val width = bitMatrix.width
        val height = bitMatrix.height
        val pixels = IntArray(width * height)

        val black = android.graphics.Color.BLACK
        val white = android.graphics.Color.WHITE

        for (y in 0 until height) {
            val offset = y * width
            for (x in 0 until width) {
                pixels[offset + x] = if (bitMatrix[x, y]) black else white
            }
        }

        val bitmap = Bitmap.createBitmap(width, height, Bitmap.Config.ARGB_8888)
        bitmap.setPixels(pixels, 0, width, 0, 0, width, height)
        return bitmap
    }

    /**
     * Helper para Compose: gera diretamente um ImageBitmap pronto para uso em Image(bitmap = ...).
     */
    fun generateImageBitmap(content: String, size: Int = 512): ImageBitmap {
        return generateBitmap(content, size).asImageBitmap()
    }
}
