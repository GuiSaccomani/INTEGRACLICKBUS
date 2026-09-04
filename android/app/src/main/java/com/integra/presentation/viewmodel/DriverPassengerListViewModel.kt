package com.integra.presentation.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.integra.data.model.TripPassengerDto
import com.integra.data.repository.DriverRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

sealed class DriverPassengerListUiState {
    object Loading : DriverPassengerListUiState()
    data class Success(val passengers: List<TripPassengerDto>) : DriverPassengerListUiState()
    data class Error(val message: String) : DriverPassengerListUiState()
}

class DriverPassengerListViewModel(
    private val repository: DriverRepository = DriverRepository()
) : ViewModel() {

    private val _uiState = MutableStateFlow<DriverPassengerListUiState>(DriverPassengerListUiState.Loading)
    val uiState: StateFlow<DriverPassengerListUiState> = _uiState.asStateFlow()

    fun loadPassengers(tripId: String = "A1B2C3D4E5F60123456789ABCDEF0123") {
        _uiState.value = DriverPassengerListUiState.Loading
        viewModelScope.launch {
            val result = repository.getTripPassengers(tripId)
            result.onSuccess { passengers ->
                _uiState.value = DriverPassengerListUiState.Success(passengers)
            }.onFailure { err ->
                _uiState.value = DriverPassengerListUiState.Error(err.message ?: "Erro ao carregar lista de passageiros.")
            }
        }
    }
}
