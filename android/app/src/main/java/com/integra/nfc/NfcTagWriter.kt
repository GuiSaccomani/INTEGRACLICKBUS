package com.integra.nfc

import android.app.Activity
import android.nfc.NdefMessage
import android.nfc.NdefRecord
import android.nfc.NfcAdapter
import android.nfc.Tag
import android.nfc.tech.Ndef
import android.nfc.tech.NdefFormatable
import android.os.Bundle
import android.util.Log

class NfcTagWriter(private val activity: Activity) : NfcAdapter.ReaderCallback {

    companion object {
        private const val TAG = "NfcTagWriter"
        private const val MIME_TYPE = "application/vnd.integra.baggage"
    }

    private val nfcAdapter: NfcAdapter? = NfcAdapter.getDefaultAdapter(activity)
    private var pendingPayloadToWrite: String? = null
    private var isClearingTag: Boolean = false
    private var onSuccessCallback: (() -> Unit)? = null
    private var onErrorCallback: ((String) -> Unit)? = null

    fun startWriteSession(
        baggageId: String,
        onSuccess: () -> Unit,
        onError: (String) -> Unit
    ) {
        if (nfcAdapter == null || !nfcAdapter.isEnabled) {
            onError("NFC desativado ou não disponível neste dispositivo.")
            return
        }

        pendingPayloadToWrite = baggageId
        isClearingTag = false
        onSuccessCallback = onSuccess
        onErrorCallback = onError

        val flags = NfcAdapter.FLAG_READER_NFC_A or NfcAdapter.FLAG_READER_NFC_B
        nfcAdapter.enableReaderMode(activity, this, flags, null)
        Log.i(TAG, "Aguardando aproximação da tag para gravação do BAGGAGE_ID: $baggageId")
    }

    fun startClearSession(
        onSuccess: () -> Unit,
        onError: (String) -> Unit
    ) {
        if (nfcAdapter == null || !nfcAdapter.isEnabled) {
            onError("NFC desativado ou não disponível neste dispositivo.")
            return
        }

        pendingPayloadToWrite = null
        isClearingTag = true
        onSuccessCallback = onSuccess
        onErrorCallback = onError

        val flags = NfcAdapter.FLAG_READER_NFC_A or NfcAdapter.FLAG_READER_NFC_B
        nfcAdapter.enableReaderMode(activity, this, flags, null)
        Log.i(TAG, "Aguardando aproximação da tag física para limpeza/reset.")
    }

    fun stopSession() {
        try {
            nfcAdapter?.disableReaderMode(activity)
        } catch (e: Exception) {
            Log.w(TAG, "Erro ao desativar sessão de escrita NFC: ${e.message}")
        }
        pendingPayloadToWrite = null
        isClearingTag = false
        onSuccessCallback = null
        onErrorCallback = null
    }

    override fun onTagDiscovered(tag: Tag?) {
        if (tag == null) return
        Log.i(TAG, "Tag física detectada para escrita/limpeza.")

        if (isClearingTag) {
            performTagClear(tag)
        } else if (!pendingPayloadToWrite.isNullOrBlank()) {
            performTagWrite(tag, pendingPayloadToWrite!!)
        }
    }

    private fun performTagWrite(tag: Tag, payloadText: String) {
        try {
            val record = NdefRecord.createMime(MIME_TYPE, payloadText.toByteArray(Charsets.UTF_8))
            val message = NdefMessage(arrayOf(record))

            val ndef = Ndef.get(tag)
            if (ndef != null) {
                ndef.connect()
                if (!ndef.isWritable) {
                    notifyError("A etiqueta NFC está bloqueada para escrita (somente leitura).")
                    return
                }
                if (ndef.maxSize < message.byteArrayLength) {
                    notifyError("A capacidade da tag é insuficiente para armazenar o ID da bagagem.")
                    return
                }
                ndef.writeNdefMessage(message)
                ndef.close()
                Log.i(TAG, "BAGGAGE_ID gravado com sucesso na tag física.")
                notifySuccess()
            } else {
                // Tenta formatar caso a tag ainda não esteja formatada em NDEF
                val formatable = NdefFormatable.get(tag)
                if (formatable != null) {
                    formatable.connect()
                    formatable.format(message)
                    formatable.close()
                    Log.i(TAG, "Tag física formatada e gravada com sucesso.")
                    notifySuccess()
                } else {
                    notifyError("A tag aproximada não suporta gravação no padrão NDEF.")
                }
            }
        } catch (e: Exception) {
            Log.e(TAG, "Falha na gravação física da tag", e)
            notifyError("Falha na gravação física da tag: ${e.message}. Mantenha a tag imóvel.")
        }
    }

    private fun performTagClear(tag: Tag) {
        try {
            val emptyRecord = NdefRecord.createMime(MIME_TYPE, "".toByteArray(Charsets.UTF_8))
            val emptyMessage = NdefMessage(arrayOf(emptyRecord))

            val ndef = Ndef.get(tag)
            if (ndef != null) {
                ndef.connect()
                if (!ndef.isWritable) {
                    notifyError("A tag física está protegida e não pôde ser limpa.")
                    return
                }
                ndef.writeNdefMessage(emptyMessage)
                ndef.close()
                Log.i(TAG, "Tag física limpa com sucesso.")
                notifySuccess()
            } else {
                notifyError("Tag não compatível com limpeza NDEF.")
            }
        } catch (e: Exception) {
            Log.e(TAG, "Falha ao limpar a tag física", e)
            notifyError("Falha física ao limpar a tag: ${e.message}")
        }
    }

    private fun notifySuccess() {
        activity.runOnUiThread {
            onSuccessCallback?.invoke()
            stopSession()
        }
    }

    private fun notifyError(msg: String) {
        activity.runOnUiThread {
            onErrorCallback?.invoke(msg)
            stopSession()
        }
    }
}
