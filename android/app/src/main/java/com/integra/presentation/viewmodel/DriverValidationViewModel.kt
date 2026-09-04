package com.integra.presentation.viewmodel

import android.app.Activity
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.integra.data.model.ValidatedTicketDataDto
import com.integra.data.repository.PassengerRepository
import com.integra.nfc.NfcOperationMode
import com.integra.nfc.NfcReaderManager
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

sealed class DriverValidationUiState {
    object Idle : DriverValidationUiState()
    object ListeningNfc : DriverValidationUiState()
    object ShowingQrScanner : DriverValidationUiState()
    object Validating : DriverValidationUiState()
    data class Success(val ticket: ValidatedTicketDataDto) : DriverValidationUiState()
    data class InvalidTicket(val reason: String) : DriverValidationUiState()
    data class Error(val message: String) : DriverValidationUiState()
}

class DriverValidationViewModel(
    private val repository: PassengerRepository = PassengerRepository()
) : ViewModel() {

    private val _uiState = MutableStateFlow<DriverValidationUiState>(DriverValidationUiState.Idle)
    val uiState: StateFlow<DriverValidationUiState> = _uiState.asStateFlow()

    private var nfcReaderManager: NfcReaderManager? = null

    fun initializeNfc(activity: Activity) {
        if (nfcReaderManager == null) {
            nfcReaderManager = NfcReaderManager(activity)
        }
    }

    fun startNfcListening() {
        val reader = nfcReaderManager ?: return
        _uiState.value = DriverValidationUiState.ListeningNfc

        reader.startListening(
            mode = NfcOperationMode.READ_PASSENGER_HCE,
            onSuccess = { credentialRef ->
                validateCredentialOnApi(credentialRef)
            },
            onError = { err ->
                _uiState.value = DriverValidationUiState.Error(err)
            }
        )
    }

    fun stopNfcListening() {
        nfcReaderManager?.stopListening()
        if (_uiState.value == DriverValidationUiState.ListeningNfc) {
            _uiState.value = DriverValidationUiState.Idle
        }
    }

    fun openQrScanner() {
        stopNfcListening()
        _uiState.value = DriverValidationUiState.ShowingQrScanner
    }

    fun closeQrScanner() {
        _uiState.value = DriverValidationUiState.Idle
    }

    fun onQrCodeDetected(code: String) {
        _uiState.value = DriverValidationUiState.Validating
        validateCredentialOnApi(code)
    }

    fun validateCredentialOnApi(credentialRef: String) {
        stopNfcListening()
        _uiState.value = DriverValidationUiState.Validating

        viewModelScope.launch {
            val result = repository.validateCredential(credentialRef.trim())
            result.onSuccess { validatedData ->
                if (validatedData.validated) {
                    _uiState.value = DriverValidationUiState.Success(validatedData)
                } else {
                    _uiState.value = DriverValidationUiState.InvalidTicket("Passagem inválida ou já utilizada no sistema.")
                }
            }.onFailure { err ->
                val msg = err.message ?: "Falha ao validar credencial."
                if (msg.contains("já utilizada", ignoreCase = true) || msg.contains("não encontrada", ignoreCase = true)) {
                    _uiState.value = DriverValidationUiState.InvalidTicket(msg)
                } else {
                    _uiState.value = DriverValidationUiState.Error(msg)
                }
            }
        }
    }

    fun resetState() {
        stopNfcListening()
        _uiState.value = DriverValidationUiState.Idle
    }

    override fun onCleared() {
        super.onCleared()
        stopNfcListening()
    }
}
