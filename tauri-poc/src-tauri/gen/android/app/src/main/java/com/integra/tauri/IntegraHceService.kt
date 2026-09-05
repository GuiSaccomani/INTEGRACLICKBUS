package com.integra.tauri

import android.nfc.cardemulation.HostApduService
import android.os.Bundle
import android.util.Log

/**
 * Serviço Host Card Emulation (HCE) da POC Tauri 2 — ÍNTEGRA
 * 
 * Permite que o celular Android do PASSAGEIRO emule um cartão inteligente NFC
 * respondendo ao comando APDU SELECT AID oficial (F0494E5445475241).
 */
class IntegraHceService : HostApduService() {

    companion object {
        private const val TAG = "IntegraHceService"

        // AID oficial do ÍNTEGRA: F0494E5445475241
        private const val INTEGRA_AID_HEX = "F0494E5445475241"

        // APDU Command Header para SELECT AID: 00 A4 04 00 [Length] [AID]
        private val SELECT_APDU_HEADER = byteArrayOf(0x00.toByte(), 0xA4.toByte(), 0x04.toByte(), 0x00.toByte())

        // Status Words (ISO 7816-4)
        private val SW_SUCCESS = byteArrayOf(0x90.toByte(), 0x00.toByte())
        private val SW_UNKNOWN_CMD = byteArrayOf(0x6F.toByte(), 0x00.toByte())

        // Referência da credencial ativa a ser transmitida via HCE
        @Volatile
        var currentCredentialPayload: String = "integra:cred:v1:CRED_ACTIVE_DEMO"
    }

    override fun processCommandApdu(commandApdu: ByteArray?, extras: Bundle?): ByteArray {
        if (commandApdu == null || commandApdu.size < 4) {
            return SW_UNKNOWN_CMD
        }

        // Verifica se é o comando SELECT AID
        val isSelect = commandApdu[0] == SELECT_APDU_HEADER[0] &&
                commandApdu[1] == SELECT_APDU_HEADER[1] &&
                commandApdu[2] == SELECT_APDU_HEADER[2] &&
                commandApdu[3] == SELECT_APDU_HEADER[3]

        if (isSelect) {
            Log.d(TAG, "APDU SELECT AID recebido. Transmitindo credencial do passageiro via HCE...")
            val payloadBytes = currentCredentialPayload.toByteArray(Charsets.UTF_8)
            // Retorna Payload + SW_SUCCESS (90 00)
            return payloadBytes + SW_SUCCESS
        }

        return SW_UNKNOWN_CMD
    }

    override fun onDeactivated(reason: Int) {
        val reasonStr = if (reason == DEACTIVATION_LINK_LOSS) "DEACTIVATION_LINK_LOSS" else "DEACTIVATION_DESELECTED"
        Log.d(TAG, "Sessão HCE desativada: $reasonStr")
    }
}
