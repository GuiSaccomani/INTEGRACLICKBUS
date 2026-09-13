package com.integra.nfc

import android.nfc.cardemulation.HostApduService
import android.os.Bundle
import android.util.Log

class IntegraHceService : HostApduService() {

    companion object {
        private const val TAG = "IntegraHCE"

        // AID registrado: F0494E5445475241 ("F0" + ASCII "INTEGRA")
        val INTEGRA_AID_BYTES = byteArrayOf(
            0xF0.toByte(), 0x49.toByte(), 0x4E.toByte(), 0x54.toByte(),
            0x45.toByte(), 0x47.toByte(), 0x52.toByte(), 0x41.toByte()
        )

        // Status Words ISO 7816-4
        val SW_SUCCESS = byteArrayOf(0x90.toByte(), 0x00.toByte())
        val SW_FILE_NOT_FOUND = byteArrayOf(0x6A.toByte(), 0x82.toByte())
        val SW_UNKNOWN_ERROR = byteArrayOf(0x6F.toByte(), 0x00.toByte())

        // Credencial ativa estática para atualização em tempo de execução
        @Volatile
        var activeCredentialRef: String = "UT_7A9B2C4D8E1F3A5B"
    }

    private var currentFile: ByteArray? = null

    // NDEF Capability Container (CC) File
    private val CC_FILE = byteArrayOf(
        0x00, 0x0F,               // CCLEN: 15 bytes
        0x20,                     // Mapping Version 2.0
        0x00, 0x7F,               // Max R-APDU size
        0x00, 0x7F,               // Max C-APDU size
        0x04, 0x06,               // TLV NDEF File Control
        0xE1.toByte(), 0x04,      // File Identifier
        0x03, 0xFF.toByte(),      // Max NDEF size
        0x00,                     // Read access
        0xFF.toByte()             // Write access (deny)
    )

    private fun generateNdefFile(): ByteArray {
        val payloadString = "INTEGRA:V1:$activeCredentialRef"
        val payloadBytes = payloadString.toByteArray(Charsets.UTF_8)
        
        val recordSize = 1 + 1 + 1 + 1 + 1 + 2 + payloadBytes.size
        val record = ByteArray(recordSize)
        record[0] = 0xD1.toByte()
        record[1] = 0x01
        record[2] = (3 + payloadBytes.size).toByte()
        record[3] = 0x54.toByte()
        record[4] = 0x02
        record[5] = 0x65.toByte()
        record[6] = 0x6E.toByte()
        System.arraycopy(payloadBytes, 0, record, 7, payloadBytes.size)
        
        val ndefFile = ByteArray(record.size + 2)
        ndefFile[0] = ((record.size shr 8) and 0xFF).toByte()
        ndefFile[1] = (record.size and 0xFF).toByte()
        System.arraycopy(record, 0, ndefFile, 2, record.size)
        return ndefFile
    }

    override fun processCommandApdu(commandApdu: ByteArray?, extras: Bundle?): ByteArray {
        if (commandApdu == null || commandApdu.size < 4) {
            Log.w(TAG, "Comando APDU nulo ou incompleto recebido.")
            return SW_UNKNOWN_ERROR
        }

        val cla = commandApdu[0]
        val ins = commandApdu[1]
        val p1 = commandApdu[2]
        val p2 = commandApdu[3]

        if (cla == 0x00.toByte() && ins == 0xA4.toByte()) {
            if (p1 == 0x04.toByte() && p2 == 0x00.toByte()) {
                val aid = commandApdu.copyOfRange(5, commandApdu.size)
                
                if (aid.size >= INTEGRA_AID_BYTES.size && aid.take(INTEGRA_AID_BYTES.size).toByteArray().contentEquals(INTEGRA_AID_BYTES)) {
                    Log.i(TAG, "SELECT AID ÍNTEGRA (Legacy) recebido.")
                    val credential = activeCredentialRef
                    val payloadString = "INTEGRA:V1:$credential"
                    val payloadBytes = payloadString.toByteArray(Charsets.UTF_8)
                    val response = ByteArray(payloadBytes.size + SW_SUCCESS.size)
                    System.arraycopy(payloadBytes, 0, response, 0, payloadBytes.size)
                    System.arraycopy(SW_SUCCESS, 0, response, payloadBytes.size, SW_SUCCESS.size)
                    return response
                }
                
                val ndefAid = byteArrayOf(0xD2.toByte(), 0x76, 0x00, 0x00, 0x85.toByte(), 0x01, 0x01)
                if (aid.size >= ndefAid.size && aid.take(ndefAid.size).toByteArray().contentEquals(ndefAid)) {
                    Log.i(TAG, "SELECT AID NDEF recebido.")
                    currentFile = null
                    return SW_SUCCESS
                }
            } else if (p1 == 0x00.toByte() && p2 == 0x0C.toByte()) {
                if (commandApdu.size >= 7) {
                    val fileId = byteArrayOf(commandApdu[5], commandApdu[6])
                    if (fileId.contentEquals(byteArrayOf(0xE1.toByte(), 0x03.toByte()))) {
                        Log.i(TAG, "SELECT CC FILE.")
                        currentFile = CC_FILE
                        return SW_SUCCESS
                    } else if (fileId.contentEquals(byteArrayOf(0xE1.toByte(), 0x04.toByte()))) {
                        Log.i(TAG, "SELECT NDEF FILE.")
                        currentFile = generateNdefFile()
                        return SW_SUCCESS
                    }
                }
            }
        } else if (cla == 0x00.toByte() && ins == 0xB0.toByte()) {
            val offset = ((p1.toInt() and 0xFF) shl 8) or (p2.toInt() and 0xFF)
            val le = if (commandApdu.size > 4) {
                val l = commandApdu[4].toInt() and 0xFF
                if (l == 0) 256 else l
            } else 0
            
            val file = currentFile
            if (file != null) {
                if (offset <= file.size) {
                    val endOffset = if (le > 0) Math.min(offset + le, file.size) else file.size
                    val data = file.copyOfRange(offset, endOffset)
                    val response = ByteArray(data.size + SW_SUCCESS.size)
                    System.arraycopy(data, 0, response, 0, data.size)
                    System.arraycopy(SW_SUCCESS, 0, response, data.size, SW_SUCCESS.size)
                    return response
                }
            }
        }

        Log.w(TAG, "Comando APDU não reconhecido: CLA=${cla}, INS=${ins}")
        return SW_FILE_NOT_FOUND
    }

    override fun onDeactivated(reason: Int) {
        currentFile = null
        val reasonStr = when (reason) {
            DEACTIVATION_LINK_LOSS -> "Perda de link NFC"
            DEACTIVATION_DESELECTED -> "Deselecionado pelo leitor"
            else -> "Outro ($reason)"
        }
        Log.i(TAG, "Sessão HCE finalizada: $reasonStr")
    }
}
