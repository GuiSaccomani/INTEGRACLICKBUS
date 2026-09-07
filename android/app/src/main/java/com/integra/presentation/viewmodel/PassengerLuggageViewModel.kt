package com.integra.presentation.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.integra.data.model.BaggageItemDto
import com.integra.data.model.LuggageDetailDto
import com.integra.data.repository.LuggageRepository
import com.integra.presentation.common.UiState
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

class PassengerLuggageViewModel(
    private val luggageRepository: LuggageRepository = LuggageRepository()
) : ViewModel() {

    private val _luggagesState = MutableStateFlow<UiState<List<BaggageItemDto>>>(UiState.Idle)
    val luggagesState: StateFlow<UiState<List<BaggageItemDto>>> = _luggagesState.asStateFlow()

    private val _detailState = MutableStateFlow<UiState<LuggageDetailDto>>(UiState.Idle)
    val detailState: StateFlow<UiState<LuggageDetailDto>> = _detailState.asStateFlow()

    private val _actionState = MutableStateFlow<UiState<String>>(UiState.Idle)
    val actionState: StateFlow<UiState<String>> = _actionState.asStateFlow()

    fun loadLuggages(ticketId: String) {
        _luggagesState.value = UiState.Loading
        viewModelScope.launch {
            val result = luggageRepository.getLuggagesByTicket(ticketId)
            result.onSuccess { list ->
                _luggagesState.value = UiState.Success(list)
            }.onFailure { err ->
                _luggagesState.value = UiState.Error(
                    err.message ?: "Não foi possível carregar as bagagens."
                )
            }
        }
    }

    fun loadLuggageDetail(baggageId: String) {
        _detailState.value = UiState.Loading
        viewModelScope.launch {
            val result = luggageRepository.getLuggageById(baggageId)
            result.onSuccess { detail ->
                _detailState.value = UiState.Success(detail)
            }.onFailure { err ->
                _detailState.value = UiState.Error(
                    err.message ?: "Bagagem não encontrada."
                )
            }
        }
    }

    fun addLuggage(ticketId: String, baggageId: String? = null, onSuccess: () -> Unit = {}) {
        _actionState.value = UiState.Loading
        viewModelScope.launch {
            val result = luggageRepository.addLuggage(ticketId, baggageId)
            result.onSuccess {
                _actionState.value = UiState.Success("Bagagem despachada com sucesso!")
                loadLuggages(ticketId)
                onSuccess()
            }.onFailure { err ->
                _actionState.value = UiState.Error(
                    err.message ?: "Falha ao registrar bagagem."
                )
            }
        }
    }

    fun deleteLuggage(baggageId: String, ticketId: String, onSuccess: () -> Unit = {}) {
        _actionState.value = UiState.Loading
        viewModelScope.launch {
            val result = luggageRepository.deleteLuggage(baggageId)
            result.onSuccess {
                _actionState.value = UiState.Success("Bagagem retirada com sucesso.")
                loadLuggages(ticketId)
                onSuccess()
            }.onFailure { err ->
                _actionState.value = UiState.Error(
                    err.message ?: "Falha ao retirar bagagem."
                )
            }
        }
    }
}
