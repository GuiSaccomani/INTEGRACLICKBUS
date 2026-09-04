package com.integra.data.local

import android.content.Context
import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.*
import androidx.datastore.preferences.preferencesDataStore
import com.integra.data.model.UserProfileDto
import com.integra.data.model.UserRoleDto
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.map

val Context.dataStore: DataStore<Preferences> by preferencesDataStore(name = "integra_session")

class SessionManager(private val context: Context) {

    companion object {
        val KEY_USER_ID = stringPreferencesKey("user_id")
        val KEY_USER_NAME = stringPreferencesKey("user_name")
        val KEY_USER_EMAIL = stringPreferencesKey("user_email")
        val KEY_IS_PASSENGER = booleanPreferencesKey("is_passenger")
        val KEY_IS_DRIVER = booleanPreferencesKey("is_driver")
        val KEY_IS_OPERATOR = booleanPreferencesKey("is_operator")
        val KEY_ACTIVE_TICKET_ID = stringPreferencesKey("active_ticket_id")
        val KEY_ACTIVE_CREDENTIAL_REF = stringPreferencesKey("active_credential_ref")
        val KEY_CUSTOM_SERVER_URL = stringPreferencesKey("custom_server_url")

        @Volatile
        private var INSTANCE: SessionManager? = null

        fun getInstance(context: Context): SessionManager {
            return INSTANCE ?: synchronized(this) {
                INSTANCE ?: SessionManager(context.applicationContext).also { INSTANCE = it }
            }
        }
    }

    val userProfileFlow: Flow<UserProfileDto?> = context.dataStore.data.map { prefs ->
        val userId = prefs[KEY_USER_ID] ?: return@map null
        val userName = prefs[KEY_USER_NAME] ?: ""
        val userEmail = prefs[KEY_USER_EMAIL] ?: ""
        val isPassenger = prefs[KEY_IS_PASSENGER] ?: true
        val isDriver = prefs[KEY_IS_DRIVER] ?: false
        val isOperator = prefs[KEY_IS_OPERATOR] ?: false

        UserProfileDto(
            userId = userId,
            userName = userName,
            userEmail = userEmail,
            roles = UserRoleDto(isPassenger, isDriver, isOperator)
        )
    }

    val activeCredentialRefFlow: Flow<String?> = context.dataStore.data.map { prefs ->
        prefs[KEY_ACTIVE_CREDENTIAL_REF]
    }

    suspend fun saveUserSession(user: UserProfileDto) {
        context.dataStore.edit { prefs ->
            prefs[KEY_USER_ID] = user.userId
            prefs[KEY_USER_NAME] = user.userName
            prefs[KEY_USER_EMAIL] = user.userEmail
            prefs[KEY_IS_PASSENGER] = user.roles.isPassenger
            prefs[KEY_IS_DRIVER] = user.roles.isDriver
            prefs[KEY_IS_OPERATOR] = user.roles.isOperator
        }
    }

    suspend fun setActiveTicket(ticketId: String, credentialRef: String) {
        context.dataStore.edit { prefs ->
            prefs[KEY_ACTIVE_TICKET_ID] = ticketId
            prefs[KEY_ACTIVE_CREDENTIAL_REF] = credentialRef
        }
    }

    suspend fun getActiveCredentialRef(): String? {
        val prefs = context.dataStore.data.first()
        return prefs[KEY_ACTIVE_CREDENTIAL_REF]
    }

    suspend fun clearSession() {
        context.dataStore.edit { prefs ->
            prefs.remove(KEY_USER_ID)
            prefs.remove(KEY_USER_NAME)
            prefs.remove(KEY_USER_EMAIL)
            prefs.remove(KEY_IS_PASSENGER)
            prefs.remove(KEY_IS_DRIVER)
            prefs.remove(KEY_IS_OPERATOR)
            prefs.remove(KEY_ACTIVE_TICKET_ID)
            prefs.remove(KEY_ACTIVE_CREDENTIAL_REF)
        }
    }

    suspend fun getUserId(): String? {
        val prefs = context.dataStore.data.first()
        return prefs[KEY_USER_ID]
    }
}
