package com.integra.presentation.viewmodel

import android.app.Activity
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.integra.data.model.LuggageDetailDto
import com.integra.data.repository.LuggageRepository
import com.integra.nfc.NfcOperationMode
import com.integra.nfc.NfcReaderManager
import com.integra.nfc.NfcTagWriter
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

sealed class DriverDesembarqueUiState {
    object Idle : DriverDesembarqueUiState()
    object ReadingTag : DriverDesembarqueUiState()
    object LoadingDetails : DriverDesembarqueUiState()
    data class ConfirmDelivery(val luggage: LuggageDetailDto) : DriverDesembarqueUiState()
    object ReleasingInBackend : DriverDesembarqueUiState()
    object ClearingPhysicalTag : DriverDesembarqueUiState()
    data class Success(val physicalTagCleaned: Boolean) : DriverDesembarqueUiState()
    data class Error(val message: String) : DriverDesembarqueUiState()
}

class DriverDesembarqueViewModel(
    private val repository: LuggageRepository = LuggageRepository()
) : ViewModel() {

    private val _uiState = MutableStateFlow<DriverDesembarqueUiState>(DriverDesembarqueUiState.Idle)
    val uiState: StateFlow<DriverDesembarqueUiState> = _uiState.asStateFlow()

    private var nfcReaderManager: NfcReaderManager? = null
    private var nfcTagWriter: NfcTagWriter? = null
    private var currentLuggage: LuggageDetailDto? = null

    fun initializeNfc(activity: Activity) {
        if (nfcReaderManager == null) nfcReaderManager = NfcReaderManager(activity)
        if (nfcTagWriter == null) nfcTagWriter = NfcTagWriter(activity)
    }

    fun startReadingTag() {
        val reader = nfcReaderManager ?: return
        _uiState.value = DriverDesembarqueUiState.ReadingTag

        reader.startListening(
            mode = NfcOperationMode.READ_BAGGAGE_TAG,
            onSuccess = { baggageId ->
                fetchBaggageDetails(baggageId)
            },
            onError = { err ->
                _uiState.value = DriverDesembarqueUiState.Error(err)
            }
        )
    }

    fun fetchBaggageDetails(baggageId: String) {
        nfcReaderManager?.stopListening()
        _uiState.value = DriverDesembarqueUiState.LoadingDetails

        viewModelScope.launch {
            val result = repository.getLuggageById(baggageId.trim())
            result.onSuccess { luggage ->
                currentLuggage = luggage
                _uiState.value = DriverDesembarqueUiState.ConfirmDelivery(luggage)
            }.onFailure { err ->
                _uiState.value = DriverDesembarqueUiState.Error(err.message ?: "Bagagem não encontrada no sistema.")
            }
        }
    }

    fun confirmDeliveryAndClearTag() {
        val luggage = currentLuggage ?: return
        _uiState.value = DriverDesembarqueUiState.ReleasingInBackend

        viewModelScope.launch {
            // 1. Remove associação no Oracle via API (DELETE /luggages/:id)
            val result = repository.deleteLuggage(luggage.baggageId)
            result.onSuccess {
                // 2. Procede com a limpeza física da tag NFC
                _uiState.value = DriverDesembarqueUiState.ClearingPhysicalTag
                val writer = nfcTagWriter
                if (writer != null) {
                    writer.startClearSession(
                        onSuccess = {
                            _uiState.value = DriverDesembarqueUiState.Success(physicalTagCleaned = true)
                        },
                        onError = { clearError ->
                            // Se a limpeza física falhar: exibe o erro explícito conforme requisito 11
                            _uiState.value = DriverDesembarqueUiState.Error(
                                "Bagagem desvinculada no sistema, mas a limpeza física da tag falhou: $clearError"
                            )
                        }
                    )
                } else {
                    _uiState.value = DriverDesembarqueUiState.Success(physicalTagCleaned = false)
                }
            }.onFailure { err ->
                _uiState.value = DriverDesembarqueUiState.Error(err.message ?: "Erro ao desvincular bagagem no sistema.")
            }
        }
    }

    fun resetState() {
        nfcReaderManager?.stopListening()
        nfcTagWriter?.stopSession()
        currentLuggage = null
        _uiState.value = DriverDesembarqueUiState.Idle
    }

    override fun onCleared() {
        super.onCleared()
        nfcReaderManager?.stopListening()
        nfcTagWriter?.stopSession()
    }
}
