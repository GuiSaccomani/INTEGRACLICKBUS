package com.integra.ui.theme

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.runtime.*
import androidx.compose.ui.graphics.Color
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow

enum class ThemeMode {
    LIGHT,
    DARK,
    SYSTEM
}

object ThemeManager {
    private val _themeMode = MutableStateFlow(ThemeMode.DARK) // Padrão identidade dark mode ÍNTEGRA
    val themeMode = _themeMode.asStateFlow()

    fun setTheme(mode: ThemeMode) {
        _themeMode.value = mode
    }

    val currentMode: ThemeMode get() = _themeMode.value
}

// Cores dinâmicas por tema
class IntegraColors(
    val isDark: Boolean,
    val primary: Color = Color(0xFF7B2CBF),
    val primaryDark: Color = Color(0xFF5B1A9F),
    val primaryLight: Color = if (isDark) Color(0xFF261338) else Color(0xFFF5F0FF),
    val primaryMid: Color = if (isDark) Color(0xFF4C1D95) else Color(0xFFDDD6FE),
    val secondary: Color = Color(0xFF9D4EDD),
    val bg: Color = if (isDark) Color(0xFF0F172A) else Color(0xFFF9FAFB),
    val surface: Color = if (isDark) Color(0xFF1E293B) else Color(0xFFFFFFFF),
    val text1: Color = if (isDark) Color(0xFFF8FAFC) else Color(0xFF111827),
    val text2: Color = if (isDark) Color(0xFFCBD5E1) else Color(0xFF6B7280),
    val text3: Color = if (isDark) Color(0xFF94A3B8) else Color(0xFF9CA3AF),
    val border: Color = if (isDark) Color(0xFF334155) else Color(0xFFF3F4F6),
    val borderMd: Color = if (isDark) Color(0xFF475569) else Color(0xFFE5E7EB),
    val success: Color = Color(0xFF10B981),
    val successLight: Color = if (isDark) Color(0xFF064E3B) else Color(0xFFECFDF5),
    val warning: Color = Color(0xFFF59E0B),
    val warningLight: Color = if (isDark) Color(0xFF78350F) else Color(0xFFFFF7ED),
    val error: Color = Color(0xFFEF4444),
    val errorLight: Color = if (isDark) Color(0xFF7F1D1D) else Color(0xFFFEF2F2)
)

val LocalIntegraColors = staticCompositionLocalOf { IntegraColors(isDark = true) }
