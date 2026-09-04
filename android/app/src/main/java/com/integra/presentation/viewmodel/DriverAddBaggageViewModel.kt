package com.integra.presentation.viewmodel

import android.app.Activity
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.integra.data.model.BaggageItemDto
import com.integra.data.repository.LuggageRepository
import com.integra.nfc.NfcTagWriter
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import java.security.SecureRandom

sealed class DriverAddBaggageUiState {
    object Idle : DriverAddBaggageUiState()
    object SavingOnApi : DriverAddBaggageUiState()
    data class WaitingForNfcTag(val baggageId: String) : DriverAddBaggageUiState()
    data class Success(val baggage: BaggageItemDto) : DriverAddBaggageUiState()
    data class Error(val message: String) : DriverAddBaggageUiState()
}

class DriverAddBaggageViewModel(
    private val repository: LuggageRepository = LuggageRepository()
) : ViewModel() {

    private val _uiState = MutableStateFlow<DriverAddBaggageUiState>(DriverAddBaggageUiState.Idle)
    val uiState: StateFlow<DriverAddBaggageUiState> = _uiState.asStateFlow()

    private var nfcTagWriter: NfcTagWriter? = null

    fun initializeNfc(activity: Activity) {
        if (nfcTagWriter == null) nfcTagWriter = NfcTagWriter(activity)
    }

    /**
     * Gera um BAGGAGE_ID RAW(32) criptograficamente seguro (64 caracteres hexadecimais).
     */
    fun generateSecureBaggageId(): String {
        val bytes = ByteArray(32)
        SecureRandom().nextBytes(bytes)
        return bytes.joinToString("") { "%02X".format(it) }
    }

    fun associateBaggage(ticketId: String, baggageId: String) {
        if (ticketId.isBlank()) {
            _uiState.value = DriverAddBaggageUiState.Error("Selecione ou informe a passagem do passageiro.")
            return
        }

        _uiState.value = DriverAddBaggageUiState.SavingOnApi

        viewModelScope.launch {
            // 1. Registra no Oracle via API
            val result = repository.addLuggage(ticketId.trim(), baggageId.trim())
            result.onSuccess { createdLuggage ->
                // 2. Aciona o gravador de tag NFC física
                _uiState.value = DriverAddBaggageUiState.WaitingForNfcTag(createdLuggage.baggageId)
                val writer = nfcTagWriter
                if (writer != null) {
                    writer.startWriteSession(
                        baggageId = createdLuggage.baggageId,
                        onSuccess = {
                            _uiState.value = DriverAddBaggageUiState.Success(createdLuggage)
                        },
                        onError = { err ->
                            _uiState.value = DriverAddBaggageUiState.Error(
                                "Bagagem registrada no sistema, mas a gravação na tag física falhou: $err"
                            )
                        }
                    )
                } else {
                    _uiState.value = DriverAddBaggageUiState.Success(createdLuggage)
                }
            }.onFailure { err ->
                _uiState.value = DriverAddBaggageUiState.Error(err.message ?: "Erro ao registrar bagagem na API.")
            }
        }
    }

    fun resetState() {
        nfcTagWriter?.stopSession()
        _uiState.value = DriverAddBaggageUiState.Idle
    }

    override fun onCleared() {
        super.onCleared()
        nfcTagWriter?.stopSession()
    }
}
