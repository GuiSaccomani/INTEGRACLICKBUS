package com.integra.tauri

import android.nfc.NfcAdapter
import android.nfc.Tag
import android.nfc.tech.IsoDep
import android.os.Bundle
import android.util.Log
import android.webkit.PermissionRequest
import android.webkit.WebChromeClient
import android.webkit.WebView

/**
 * Atividade Principal da POC Tauri 2 — ÍNTEGRA
 * 
 * Gerencia:
 * 1. O WebView que renderiza o React com fidelidade visual idêntica à Web.
 * 2. As permissões de hardware (Câmera, Microfone) concedidas ao WebView.
 * 3. O NfcAdapter para o Reader Mode do MOTORISTA (comunicação com HCE do PASSAGEIRO).
 */
class MainActivity : app.tauri.plugin.PluginActivity() {

    companion object {
        private const val TAG = "IntegraMainActivity"
        // APDU Command SELECT AID F0494E5445475241: 00 A4 04 00 07 F0 49 4E 54 45 47 52 41 00
        private val SELECT_INTEGRA_AID_APDU = byteArrayOf(
            0x00.toByte(), 0xA4.toByte(), 0x04.toByte(), 0x00.toByte(),
            0x07.toByte(),
            0xF0.toByte(), 0x49.toByte(), 0x4E.toByte(), 0x54.toByte(), 0x45.toByte(), 0x47.toByte(), 0x52.toByte(), 0x41.toByte(),
            0x00.toByte()
        )
    }

    private var nfcAdapter: NfcAdapter? = null

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        nfcAdapter = NfcAdapter.getDefaultAdapter(this)
        Log.i(TAG, "MainActivity ÍNTEGRA Tauri 2 inicializada. NFC disponível: ${nfcAdapter != null}")
    }

    /**
     * Ativa o Reader Mode no celular do motorista para ler o HCE do passageiro
     */
    fun enableDriverReaderMode(onCredentialReceived: (String) -> Unit) {
        val adapter = nfcAdapter ?: return
        val flags = NfcAdapter.FLAG_READER_NFC_A or NfcAdapter.FLAG_READER_SKIP_NDEF_CHECK

        adapter.enableReaderMode(this, { tag: Tag ->
            val isoDep = IsoDep.get(tag)
            if (isoDep != null) {
                try {
                    isoDep.connect()
                    isoDep.timeout = 5000
                    val response = isoDep.transceive(SELECT_INTEGRA_AID_APDU)
                    if (response != null && response.size >= 2) {
                        val sw1 = response[response.size - 2]
                        val sw2 = response[response.size - 1]
                        if (sw1 == 0x90.toByte() && sw2 == 0x00.toByte()) {
                            val payloadBytes = response.copyOfRange(0, response.size - 2)
                            val payload = String(payloadBytes, Charsets.UTF_8)
                            Log.i(TAG, "Credencial lida via HCE IsoDep com sucesso: $payload")
                            runOnUiThread { onCredentialReceived(payload) }
                        }
                    }
                } catch (e: Exception) {
                    Log.e(TAG, "Erro na comunicação IsoDep Reader Mode: ${e.message}")
                } finally {
                    try { isoDep.close() } catch (_: Exception) {}
                }
            }
        }, flags, null)
    }

    /**
     * Desativa o Reader Mode
     */
    fun disableDriverReaderMode() {
        nfcAdapter?.disableReaderMode(this)
    }

    override fun onPause() {
        super.onPause()
        disableDriverReaderMode()
    }
}
