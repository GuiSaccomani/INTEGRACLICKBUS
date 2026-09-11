package com.integra.data.network

import com.google.gson.Gson
import com.google.gson.GsonBuilder
import com.integra.data.model.ApiErrorResponse
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Response
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import java.util.concurrent.TimeUnit

object RetrofitClient {

    // URL de Produção na Nuvem (Render). Funciona tanto em dispositivos físicos (4G/Wi-Fi) quanto no Emulador.
    private const val PRODUCTION_BASE_URL = "https://integraclickbus.onrender.com/"
    
    private var currentBaseUrl: String = PRODUCTION_BASE_URL
    private var apiServiceInstance: ApiService? = null

    val gson: Gson = GsonBuilder()
        .setLenient()
        .create()

    fun getBaseUrl(): String = currentBaseUrl

    fun setBaseUrl(newUrl: String) {
        val sanitized = if (newUrl.endsWith("/")) newUrl else "$newUrl/"
        if (currentBaseUrl != sanitized) {
            currentBaseUrl = sanitized
            apiServiceInstance = null
        }
    }

    private fun buildOkHttpClient(): OkHttpClient {
        val logging = HttpLoggingInterceptor().apply {
            level = HttpLoggingInterceptor.Level.BODY
        }

        return OkHttpClient.Builder()
            .addInterceptor(logging)
            .connectTimeout(15, TimeUnit.SECONDS)
            .readTimeout(15, TimeUnit.SECONDS)
            .writeTimeout(15, TimeUnit.SECONDS)
            .retryOnConnectionFailure(true)
            .build()
    }

    fun getApiService(): ApiService {
        return apiServiceInstance ?: synchronized(this) {
            apiServiceInstance ?: buildRetrofit().create(ApiService::class.java).also {
                apiServiceInstance = it
            }
        }
    }

    private fun buildRetrofit(): Retrofit {
        return Retrofit.Builder()
            .baseUrl(currentBaseUrl)
            .client(buildOkHttpClient())
            .addConverterFactory(GsonConverterFactory.create(gson))
            .build()
    }

    /**
     * Extrai a mensagem de erro amigável retornada pela API ou pelo HTTP status.
     */
    fun parseErrorMessage(response: Response<*>): String {
        return try {
            val errorBody = response.errorBody()?.string()
            if (!errorBody.isNullOrBlank()) {
                val errorObj = gson.fromJson(errorBody, ApiErrorResponse::class.java)
                errorObj.error ?: errorObj.message ?: "Erro HTTP ${response.code()}"
            } else {
                "Erro HTTP ${response.code()}: ${response.message()}"
            }
        } catch (e: Exception) {
            "Erro de comunicação com o servidor (${response.code()})"
        }
    }
}
