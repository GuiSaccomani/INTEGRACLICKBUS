package com.integra

import android.content.Intent
import android.nfc.NdefMessage
import android.nfc.NfcAdapter
import android.nfc.Tag
import android.nfc.tech.IsoDep
import android.os.Bundle
import android.util.Log
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import com.integra.ui.theme.IntegraTheme
import com.integra.navigation.AppNavigation
import com.integra.nfc.NfcReaderManager
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow

class MainActivity : ComponentActivity() {

    companion object {
        private const val TAG = "IntegraMainActivity"

        // Credential detectada via NFC intent (compartilhada com a navegação)
        private val _pendingNfcCredential = MutableStateFlow<String?>(null)
        val pendingNfcCredential: StateFlow<String?> = _pendingNfcCredential.asStateFlow()

        fun consumeNfcCredential(): String? {
            val value = _pendingNfcCredential.value
            _pendingNfcCredential.value = null
            return value
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // Processa o intent NFC que abriu o app
        handleNfcIntent(intent)

        setContent {
            IntegraTheme {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background
                ) {
                    AppNavigation()
                }
            }
        }
    }

    override fun onNewIntent(intent: Intent) {
        super.onNewIntent(intent)
        setIntent(intent)
        handleNfcIntent(intent)
    }

    /**
     * Processa intents NFC recebidos pelo sistema Android.
     * Extrai a credencial do payload NDEF ou via APDU IsoDep
     * e a disponibiliza para a tela de validação do motorista.
     */
    private fun handleNfcIntent(intent: Intent?) {
        if (intent == null) return

        val action = intent.action ?: return
        if (action != NfcAdapter.ACTION_NDEF_DISCOVERED &&
            action != NfcAdapter.ACTION_TECH_DISCOVERED &&
            action != NfcAdapter.ACTION_TAG_DISCOVERED) {
            return
        }

        Log.i(TAG, "Intent NFC recebido: action=$action")

        // 1. Tenta extrair de mensagens NDEF (tags físicas de bagagem ou NDEF emulado)
        val ndefMessages = intent.getParcelableArrayExtra(NfcAdapter.EXTRA_NDEF_MESSAGES)
        if (ndefMessages != null && ndefMessages.isNotEmpty()) {
            for (rawMsg in ndefMessages) {
                val ndefMessage = rawMsg as? NdefMessage ?: continue
                for (record in ndefMessage.records) {
                    val payload = String(record.payload, Charsets.UTF_8)
                    Log.i(TAG, "Payload NDEF recebido: $payload")

                    // Payload de texto NDEF tem prefixo de language code (ex: 2 bytes "en")
                    // Tenta encontrar "INTEGRA:V1:" no payload
                    val integraIndex = payload.indexOf("INTEGRA:V1:")
                    if (integraIndex >= 0) {
                        val credential = payload.substring(integraIndex + "INTEGRA:V1:".length)
                        Log.i(TAG, "Credencial extraída de NDEF: $credential")
                        _pendingNfcCredential.value = credential
                        return
                    }
                }
            }
        }

        // 2. Tenta comunicação IsoDep direta (celular HCE do passageiro)
        val tag = intent.getParcelableExtra<Tag>(NfcAdapter.EXTRA_TAG)
        if (tag != null && tag.techList.contains("android.nfc.tech.IsoDep")) {
            Thread {
                try {
                    val isoDep = IsoDep.get(tag)
                    isoDep.connect()
                    isoDep.timeout = 5000

                    val responseApdu = isoDep.transceive(NfcReaderManager.SELECT_APDU)

                    if (responseApdu.size >= 2) {
                        val sw0 = responseApdu[responseApdu.size - 2]
                        val sw1 = responseApdu[responseApdu.size - 1]

                        if (sw0 == 0x90.toByte() && sw1 == 0x00.toByte()) {
                            val payloadBytes = responseApdu.copyOfRange(0, responseApdu.size - 2)
                            val payload = String(payloadBytes, Charsets.UTF_8)
                            Log.i(TAG, "Payload HCE APDU recebido: $payload")

                            val credentialRef = if (payload.startsWith("INTEGRA:V1:")) {
                                payload.removePrefix("INTEGRA:V1:")
                            } else {
                                payload
                            }

                            _pendingNfcCredential.value = credentialRef
                        }
                    }

                    isoDep.close()
                } catch (e: Exception) {
                    Log.e(TAG, "Erro ao ler IsoDep via intent NFC", e)
                }
            }.start()
        }
    }
}
