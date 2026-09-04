package com.integra.data.repository

import com.integra.data.model.*
import com.integra.data.network.ApiService
import com.integra.data.network.RetrofitClient

class LuggageRepository(
    private val apiService: ApiService = RetrofitClient.getApiService()
) {
    suspend fun addLuggage(ticketId: String, baggageId: String? = null): Result<BaggageItemDto> {
        return try {
            val response = apiService.addLuggage(CreateLuggageRequest(ticketId, baggageId))
            if (response.isSuccessful && response.body() != null) {
                Result.success(response.body()!!.luggage)
            } else {
                val msg = RetrofitClient.parseErrorMessage(response)
                Result.failure(Exception(msg))
            }
        } catch (e: Exception) {
            Result.failure(Exception("Erro ao cadastrar bagagem na API.", e))
        }
    }

    suspend fun getLuggagesByTicket(ticketId: String): Result<List<BaggageItemDto>> {
        return try {
            val response = apiService.getLuggagesByTicket(ticketId)
            if (response.isSuccessful && response.body() != null) {
                Result.success(response.body()!!.luggages)
            } else {
                val msg = RetrofitClient.parseErrorMessage(response)
                Result.failure(Exception(msg))
            }
        } catch (e: Exception) {
            Result.failure(Exception("Erro ao buscar bagagens da passagem.", e))
        }
    }

    suspend fun getLuggageById(baggageId: String): Result<LuggageDetailDto> {
        return try {
            val response = apiService.getLuggageById(baggageId)
            if (response.isSuccessful && response.body() != null) {
                Result.success(response.body()!!.luggage)
            } else {
                val msg = RetrofitClient.parseErrorMessage(response)
                Result.failure(Exception(msg))
            }
        } catch (e: Exception) {
            Result.failure(Exception("Bagagem não encontrada no sistema.", e))
        }
    }

    suspend fun deleteLuggage(baggageId: String): Result<Boolean> {
        return try {
            val response = apiService.deleteLuggage(baggageId)
            if (response.isSuccessful && response.body() != null) {
                Result.success(response.body()!!.deleted)
            } else {
                val msg = RetrofitClient.parseErrorMessage(response)
                Result.failure(Exception(msg))
            }
        } catch (e: Exception) {
            Result.failure(Exception("Erro ao desvincular bagagem na API.", e))
        }
    }
}
