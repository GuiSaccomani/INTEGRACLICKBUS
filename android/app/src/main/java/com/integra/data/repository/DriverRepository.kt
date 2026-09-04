package com.integra.data.repository

import com.integra.data.model.*
import com.integra.data.network.ApiService
import com.integra.data.network.RetrofitClient

class DriverRepository(
    private val apiService: ApiService = RetrofitClient.getApiService()
) {
    suspend fun getTrips(driverId: String): Result<List<TripDto>> {
        return try {
            val response = apiService.getDriverTrips(driverId)
            if (response.isSuccessful && response.body() != null) {
                Result.success(response.body()!!.trips)
            } else {
                val msg = RetrofitClient.parseErrorMessage(response)
                Result.failure(Exception(msg))
            }
        } catch (e: Exception) {
            Result.failure(Exception("Erro ao buscar viagens do motorista.", e))
        }
    }

    suspend fun getTripPassengers(tripId: String): Result<List<TripPassengerDto>> {
        return try {
            val response = apiService.getTripPassengers(tripId)
            if (response.isSuccessful && response.body() != null) {
                Result.success(response.body()!!.passengers)
            } else {
                val msg = RetrofitClient.parseErrorMessage(response)
                Result.failure(Exception(msg))
            }
        } catch (e: Exception) {
            Result.failure(Exception("Erro ao buscar lista de passageiros.", e))
        }
    }

    suspend fun getTripSummary(tripId: String): Result<TripSummaryDto> {
        return try {
            val response = apiService.getTripSummary(tripId)
            if (response.isSuccessful && response.body() != null) {
                Result.success(response.body()!!)
            } else {
                val msg = RetrofitClient.parseErrorMessage(response)
                Result.failure(Exception(msg))
            }
        } catch (e: Exception) {
            Result.failure(Exception("Erro ao carregar resumo da viagem.", e))
        }
    }
}
