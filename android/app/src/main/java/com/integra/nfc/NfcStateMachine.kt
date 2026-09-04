package com.integra.nfc

/**
 * Máquina de estados oficial para operações NFC do ÍNTEGRA.
 * Representa com precisão o ciclo de vida de operações de leitura e gravação
 * sem simulações ou temporizadores artificiais.
 */
sealed class NfcState {
    object Idle : NfcState()
    object CheckingSupport : NfcState()
    data class Unsupported(val reason: String) : NfcState()
    object WaitingForTag : NfcState()
    object Reading : NfcState()
    object Writing : NfcState()
    object Processing : NfcState()
    data class Success(val message: String, val data: String? = null) : NfcState()
    data class Error(val message: String, val canRetry: Boolean = true) : NfcState()
}

enum class NfcOperationMode {
    READ_PASSENGER_HCE,     // Modo leitor motorista lendo celular do passageiro (IsoDep)
    READ_BAGGAGE_TAG,       // Modo leitor motorista lendo tag física de bagagem (Ndef)
    WRITE_BAGGAGE_TAG,      // Modo motorista gravando BAGGAGE_ID na tag física (Ndef)
    CLEAR_BAGGAGE_TAG       // Modo motorista limpando tag física no desembarque (Ndef)
}
