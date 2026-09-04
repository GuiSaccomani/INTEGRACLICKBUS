package com.integra.data.repository

import com.integra.data.model.*
import com.integra.data.network.ApiService
import com.integra.data.network.RetrofitClient

class PassengerRepository(
    private val apiService: ApiService = RetrofitClient.getApiService()
) {
    suspend fun getUserTickets(userId: String): Result<List<TicketDetailsDto>> {
        return try {
            val response = apiService.getUserTickets(userId)
            if (response.isSuccessful && response.body() != null) {
                Result.success(response.body()!!)
            } else {
                val msg = RetrofitClient.parseErrorMessage(response)
                Result.failure(Exception(msg))
            }
        } catch (e: Exception) {
            Result.failure(Exception("Erro ao carregar passagens da API.", e))
        }
    }

    suspend fun getTicket(ticketId: String): Result<TicketResponseDto> {
        return try {
            val response = apiService.getTicket(ticketId)
            if (response.isSuccessful && response.body() != null) {
                Result.success(response.body()!!)
            } else {
                val msg = RetrofitClient.parseErrorMessage(response)
                Result.failure(Exception(msg))
            }
        } catch (e: Exception) {
            Result.failure(Exception("Erro ao consultar passagem.", e))
        }
    }

    suspend fun validateCredential(credentialRef: String, driverId: String? = null): Result<ValidatedTicketDataDto> {
        return try {
            val response = apiService.validateCredential(
                ValidateCredentialRequest(credentialRef = credentialRef, driverId = driverId)
            )
            if (response.isSuccessful && response.body() != null) {
                Result.success(response.body()!!.data)
            } else {
                val msg = RetrofitClient.parseErrorMessage(response)
                Result.failure(Exception(msg))
            }
        } catch (e: Exception) {
            Result.failure(Exception("Erro na validação da credencial via API.", e))
        }
    }

    suspend fun validateTicket(ticketId: String, driverId: String? = null): Result<ValidatedTicketDataDto> {
        return try {
            val response = apiService.validateTicket(
                ticketId = ticketId,
                request = ValidateTicketRequest(driverId = driverId)
            )
            if (response.isSuccessful && response.body() != null) {
                Result.success(response.body()!!.data)
            } else {
                val msg = RetrofitClient.parseErrorMessage(response)
                Result.failure(Exception(msg))
            }
        } catch (e: Exception) {
            Result.failure(Exception("Erro na validação da passagem via API.", e))
        }
    }
}
