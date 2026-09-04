package com.integra.nfc

import android.app.Activity
import android.nfc.NfcAdapter
import android.nfc.Tag
import android.nfc.tech.IsoDep
import android.nfc.tech.Ndef
import android.os.Bundle
import android.util.Log
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import java.io.IOException

class NfcReaderManager(private val activity: Activity) : NfcAdapter.ReaderCallback {

    companion object {
        private const val TAG = "NfcReaderManager"

        // Comando SELECT AID proprietário do ÍNTEGRA
        // CLA=00 INS=A4 P1=04 P2=00 Lc=08 DATA=F0494E5445475241 Le=00
        val SELECT_APDU = byteArrayOf(
            0x00.toByte(), 0xA4.toByte(), 0x04.toByte(), 0x00.toByte(),
            0x08.toByte(),
            0xF0.toByte(), 0x49.toByte(), 0x4E.toByte(), 0x54.toByte(),
            0x45.toByte(), 0x47.toByte(), 0x52.toByte(), 0x41.toByte(),
            0x00.toByte()
        )
    }

    private val nfcAdapter: NfcAdapter? = NfcAdapter.getDefaultAdapter(activity)
    private val _nfcState = MutableStateFlow<NfcState>(NfcState.Idle)
    val nfcState: StateFlow<NfcState> = _nfcState.asStateFlow()

    private var currentMode: NfcOperationMode = NfcOperationMode.READ_PASSENGER_HCE
    private var onPayloadReadCallback: ((String) -> Unit)? = null
    private var onErrorCallback: ((String) -> Unit)? = null

    fun checkSupport(): Boolean {
        _nfcState.value = NfcState.CheckingSupport
        if (nfcAdapter == null) {
            _nfcState.value = NfcState.Unsupported("Este dispositivo não possui hardware NFC integrado.")
            return false
        }
        if (!nfcAdapter.isEnabled) {
            _nfcState.value = NfcState.Unsupported("O NFC está desativado. Ative-o nas configurações do dispositivo.")
            return false
        }
        _nfcState.value = NfcState.Idle
        return true
    }

    fun startListening(
        mode: NfcOperationMode,
        onSuccess: (String) -> Unit,
        onError: (String) -> Unit
    ) {
        if (!checkSupport()) {
            onError("NFC indisponível ou desativado no aparelho.")
            return
        }

        currentMode = mode
        onPayloadReadCallback = onSuccess
        onErrorCallback = onError
        _nfcState.value = NfcState.WaitingForTag

        val flags = NfcAdapter.FLAG_READER_NFC_A or 
                    NfcAdapter.FLAG_READER_NFC_B or 
                    NfcAdapter.FLAG_READER_SKIP_NDEF_CHECK

        nfcAdapter?.enableReaderMode(
            activity,
            this,
            flags,
            Bundle().apply {
                putInt(NfcAdapter.EXTRA_READER_PRESENCE_CHECK_DELAY, 250)
            }
        )
        Log.i(TAG, "Modo Leitor NFC ativado para: $mode")
    }

    fun stopListening() {
        try {
            nfcAdapter?.disableReaderMode(activity)
            Log.i(TAG, "Modo Leitor NFC desativado.")
        } catch (e: Exception) {
            Log.w(TAG, "Erro ao desativar leitor NFC: ${e.message}")
        }
        _nfcState.value = NfcState.Idle
        onPayloadReadCallback = null
        onErrorCallback = null
    }

    override fun onTagDiscovered(tag: Tag?) {
        if (tag == null) return
        Log.i(TAG, "Tag/Aparelho detectado via NFC: techList=${tag.techList.joinToString()}")

        when (currentMode) {
            NfcOperationMode.READ_PASSENGER_HCE -> handleIsoDepCommunication(tag)
            NfcOperationMode.READ_BAGGAGE_TAG -> handleNdefBaggageRead(tag)
            else -> {}
        }
    }

    private fun handleIsoDepCommunication(tag: Tag) {
        _nfcState.value = NfcState.Reading
        val isoDep = IsoDep.get(tag)

        if (isoDep == null) {
            val err = "Dispositivo incompatível com o protocolo ISO-DEP de validação."
            _nfcState.value = NfcState.Error(err)
            activity.runOnUiThread { onErrorCallback?.invoke(err) }
            return
        }

        try {
            isoDep.connect()
            isoDep.timeout = 5000 // 5s timeout máximo de APDU

            _nfcState.value = NfcState.Processing
            val responseApdu = isoDep.transceive(SELECT_APDU)

            if (responseApdu.size >= 2) {
                val statusWord0 = responseApdu[responseApdu.size - 2]
                val statusWord1 = responseApdu[responseApdu.size - 1]

                if (statusWord0 == 0x90.toByte() && statusWord1 == 0x00.toByte()) {
                    // Extrai o payload de dados excluindo os 2 últimos bytes (status word)
                    val payloadBytes = responseApdu.copyOfRange(0, responseApdu.size - 2)
                    val payload = String(payloadBytes, Charsets.UTF_8)
                    Log.i(TAG, "Payload APDU recebido do passageiro: $payload")

                    // Protocolo ÍNTEGRA: INTEGRA:V1:<CREDENTIAL_REF>
                    val credentialRef = if (payload.startsWith("INTEGRA:V1:")) {
                        payload.removePrefix("INTEGRA:V1:")
                    } else {
                        payload
                    }

                    _nfcState.value = NfcState.Success("Credencial transmitida via NFC", credentialRef)
                    activity.runOnUiThread { onPayloadReadCallback?.invoke(credentialRef) }
                } else {
                    val err = "Passagem não autorizada pelo dispositivo (SW: %02X %02X)".format(statusWord0, statusWord1)
                    _nfcState.value = NfcState.Error(err)
                    activity.runOnUiThread { onErrorCallback?.invoke(err) }
                }
            } else {
                val err = "Resposta APDU vazia ou corrompida."
                _nfcState.value = NfcState.Error(err)
                activity.runOnUiThread { onErrorCallback?.invoke(err) }
            }
        } catch (e: IOException) {
            val err = "Conexão NFC perdida durante a leitura. Mantenha os celulares próximos."
            Log.e(TAG, err, e)
            _nfcState.value = NfcState.Error(err)
            activity.runOnUiThread { onErrorCallback?.invoke(err) }
        } finally {
            try { isoDep.close() } catch (ignored: Exception) {}
        }
    }

    private fun handleNdefBaggageRead(tag: Tag) {
        _nfcState.value = NfcState.Reading
        val ndef = Ndef.get(tag)

        if (ndef == null) {
            val err = "Tag de bagagem não formatada no padrão NDEF."
            _nfcState.value = NfcState.Error(err)
            activity.runOnUiThread { onErrorCallback?.invoke(err) }
            return
        }

        try {
            ndef.connect()
            val ndefMessage = ndef.ndefMessage
            if (ndefMessage == null || ndefMessage.records.isEmpty()) {
                val err = "Tag vazia. Nenhuma bagagem associada nesta etiqueta."
                _nfcState.value = NfcState.Error(err)
                activity.runOnUiThread { onErrorCallback?.invoke(err) }
                return
            }

            val record = ndefMessage.records[0]
            val rawPayload = String(record.payload, Charsets.UTF_8)
            Log.i(TAG, "Payload NDEF lido da tag: $rawPayload")

            // Extrai BAGGAGE_ID (se gravado como texto ou mime)
            val baggageId = rawPayload.replace(Regex("[^0-9A-Fa-f]"), "").uppercase()

            if (baggageId.length >= 32) {
                _nfcState.value = NfcState.Success("Tag de bagagem identificada", baggageId)
                activity.runOnUiThread { onPayloadReadCallback?.invoke(baggageId) }
            } else {
                val err = "Formato de tag inválido para bagagem ÍNTEGRA."
                _nfcState.value = NfcState.Error(err)
                activity.runOnUiThread { onErrorCallback?.invoke(err) }
            }
        } catch (e: Exception) {
            val err = "Falha ao ler dados da tag NFC: ${e.message}"
            _nfcState.value = NfcState.Error(err)
            activity.runOnUiThread { onErrorCallback?.invoke(err) }
        } finally {
            try { ndef.close() } catch (ignored: Exception) {}
        }
    }
}
