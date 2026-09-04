package com.integra.nfc

import android.nfc.cardemulation.HostApduService
import android.os.Bundle
import android.util.Log
import com.integra.data.local.SessionManager
import kotlinx.coroutines.runBlocking

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

    override fun processCommandApdu(commandApdu: ByteArray?, extras: Bundle?): ByteArray {
        if (commandApdu == null || commandApdu.size < 4) {
            Log.w(TAG, "Comando APDU nulo ou incompleto recebido.")
            return SW_UNKNOWN_ERROR
        }

        // Verifica comando SELECT AID (CLA=0x00, INS=0xA4, P1=0x04, P2=0x00)
        val isSelect = commandApdu[0] == 0x00.toByte() &&
                       commandApdu[1] == 0xA4.toByte() &&
                       commandApdu[2] == 0x04.toByte() &&
                       commandApdu[3] == 0x00.toByte()

        if (isSelect) {
            Log.i(TAG, "Comando SELECT AID recebido com sucesso no HCE.")
            
            // Tenta obter a credencial ativa da sessão
            val credential = try {
                runBlocking {
                    SessionManager.getInstance(applicationContext).getActiveCredentialRef()
                } ?: activeCredentialRef
            } catch (e: Exception) {
                activeCredentialRef
            }

            // Protocolo ÍNTEGRA V1
            val payloadString = "INTEGRA:V1:$credential"
            val payloadBytes = payloadString.toByteArray(Charsets.UTF_8)

            // Resposta = Payload + SW_SUCCESS (90 00)
            val response = ByteArray(payloadBytes.size + SW_SUCCESS.size)
            System.arraycopy(payloadBytes, 0, response, 0, payloadBytes.size)
            System.arraycopy(SW_SUCCESS, 0, response, payloadBytes.size, SW_SUCCESS.size)

            Log.i(TAG, "Transmitindo credencial NFC HCE: $payloadString")
            return response
        }

        Log.w(TAG, "Comando APDU não reconhecido pelo serviço ÍNTEGRA.")
        return SW_FILE_NOT_FOUND
    }

    override fun onDeactivated(reason: Int) {
        val reasonStr = when (reason) {
            DEACTIVATION_LINK_LOSS -> "Perda de link NFC"
            DEACTIVATION_DESELECTED -> "Deselecionado pelo leitor"
            else -> "Outro ($reason)"
        }
        Log.i(TAG, "Sessão HCE finalizada: $reasonStr")
    }
}
