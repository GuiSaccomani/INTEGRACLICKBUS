package com.integra.util

import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import org.junit.Assert.*
import org.junit.Test

class FakeNetworkConnectivityObserver(initialOnline: Boolean = true) : NetworkConnectivityObserver {
    private val _isOnline = MutableStateFlow(initialOnline)
    override val isOnline: StateFlow<Boolean> = _isOnline.asStateFlow()

    fun emitConnectivity(online: Boolean) {
        _isOnline.value = online
    }

    override fun refresh(): Boolean {
        return _isOnline.value
    }
}

class NetworkMonitorTest {

    @Test
    fun testInitialConnectivityStateOnline() {
        val observer = FakeNetworkConnectivityObserver(initialOnline = true)
        assertTrue(observer.isOnline.value)
        assertTrue(observer.refresh())
    }

    @Test
    fun testInitialConnectivityStateOffline() {
        val observer = FakeNetworkConnectivityObserver(initialOnline = false)
        assertFalse(observer.isOnline.value)
        assertFalse(observer.refresh())
    }

    @Test
    fun testTransitionsBetweenOnlineAndOffline() {
        val observer = FakeNetworkConnectivityObserver(initialOnline = true)
        assertEquals(true, observer.isOnline.value)

        // Simula queda de conexão
        observer.emitConnectivity(false)
        assertEquals(false, observer.isOnline.value)
        assertFalse(observer.refresh())

        // Simula reconexão
        observer.emitConnectivity(true)
        assertEquals(true, observer.isOnline.value)
        assertTrue(observer.refresh())
    }
}
