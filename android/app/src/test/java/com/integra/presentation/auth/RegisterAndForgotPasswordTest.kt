package com.integra.presentation.auth

import com.integra.data.model.LoginRequest
import com.integra.data.model.LoginResponse
import com.integra.data.model.UserProfileDto
import com.integra.data.model.UserRoleDto
import com.integra.data.repository.AuthRepository
import com.integra.testutil.BaseFakeApiService
import com.integra.testutil.MainDispatcherRule
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.test.runTest
import okhttp3.MediaType.Companion.toMediaTypeOrNull
import okhttp3.ResponseBody.Companion.toResponseBody
import org.junit.Assert.*
import org.junit.Rule
import org.junit.Test
import retrofit2.Response

@OptIn(ExperimentalCoroutinesApi::class)
class RegisterAndForgotPasswordTest {

    @get:Rule
    val mainDispatcherRule = MainDispatcherRule()

    private val sampleUser = UserProfileDto(
        userId = "USR-REGISTERED-001",
        userName = "Guilherme Santos",
        userEmail = "guilherme@integra.com",
        roles = UserRoleDto(isPassenger = true, isDriver = false, isOperator = false)
    )

    private fun isValidEmail(email: String): Boolean {
        val emailRegex = "^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$".toRegex()
        return email.isNotBlank() && emailRegex.matches(email.trim())
    }

    @Test
    fun testLoginSuccessOnRegisterFlow() = runTest {
        val fakeApi = object : BaseFakeApiService() {
            override suspend fun login(request: LoginRequest): Response<LoginResponse> {
                return if (request.email == "guilherme@integra.com" && request.password == "senha123") {
                    Response.success(LoginResponse(message = "Login realizado com sucesso", user = sampleUser))
                } else {
                    Response.error(401, "Credenciais inválidas".toResponseBody("text/plain".toMediaTypeOrNull()))
                }
            }
        }

        val authRepository = AuthRepository(apiService = fakeApi, sessionManager = null)
        val result = authRepository.login("guilherme@integra.com", "senha123")

        assertTrue(result.isSuccess)
        val user = result.getOrNull()
        assertNotNull(user)
        assertEquals("USR-REGISTERED-001", user?.userId)
        assertEquals("Guilherme Santos", user?.userName)
    }

    @Test
    fun testLoginFailureOnRegisterFlowDoesNotCrash() = runTest {
        val fakeApi = object : BaseFakeApiService() {
            override suspend fun login(request: LoginRequest): Response<LoginResponse> {
                return Response.error(401, "Usuário não cadastrado".toResponseBody("text/plain".toMediaTypeOrNull()))
            }
        }

        val authRepository = AuthRepository(apiService = fakeApi, sessionManager = null)
        val result = authRepository.login("novo@teste.com", "senha123")

        assertTrue(result.isFailure)
        assertNull(result.getOrNull())
    }

    @Test
    fun testForgotPasswordEmailValidation() {
        // E-mails válidos
        assertTrue(isValidEmail("guilherme@integra.com"))
        assertTrue(isValidEmail("usuario.teste@empresa.com.br"))
        assertTrue(isValidEmail("passageiro+viagem@clickbus.com"))
        assertTrue(isValidEmail("  admin@integra.com.br  "))

        // E-mails inválidos
        assertFalse(isValidEmail(""))
        assertFalse(isValidEmail("   "))
        assertFalse(isValidEmail("sem_arroba.com"))
        assertFalse(isValidEmail("@sem_usuario.com"))
        assertFalse(isValidEmail("sem_dominio@"))
        assertFalse(isValidEmail("espaco no meio@dominio.com"))
        assertFalse(isValidEmail("usuario@dominio"))
    }
}
