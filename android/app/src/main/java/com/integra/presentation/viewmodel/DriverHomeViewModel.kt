package com.integra.presentation.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.integra.data.model.TripSummaryDto
import com.integra.data.repository.DriverRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

sealed class DriverHomeUiState {
    object Loading : DriverHomeUiState()
    data class Success(val summary: TripSummaryDto) : DriverHomeUiState()
    data class Error(val message: String) : DriverHomeUiState()
}

class DriverHomeViewModel(
    private val repository: DriverRepository = DriverRepository()
) : ViewModel() {

    private val _uiState = MutableStateFlow<DriverHomeUiState>(DriverHomeUiState.Loading)
    val uiState: StateFlow<DriverHomeUiState> = _uiState.asStateFlow()

    init {
        loadTripSummary()
    }

    fun loadTripSummary(tripId: String = "A1B2C3D4E5F60123456789ABCDEF0123") {
        _uiState.value = DriverHomeUiState.Loading
        viewModelScope.launch {
            val result = repository.getTripSummary(tripId)
            result.onSuccess { summary ->
                _uiState.value = DriverHomeUiState.Success(summary)
            }.onFailure { err ->
                _uiState.value = DriverHomeUiState.Error(err.message ?: "Falha ao consultar resumo da viagem.")
            }
        }
    }
}
