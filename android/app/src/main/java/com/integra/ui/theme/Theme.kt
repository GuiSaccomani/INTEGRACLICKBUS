package com.integra.ui.theme

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.graphics.Color

@Composable
fun IntegraTheme(
    content: @Composable () -> Unit
) {
    val mode by ThemeManager.themeMode.collectAsState()
    val isDark = when (mode) {
        ThemeMode.DARK -> true
        ThemeMode.LIGHT -> false
        ThemeMode.SYSTEM -> isSystemInDarkTheme()
    }

    val integraColors = IntegraColors(isDark = isDark)

    val colorScheme = if (isDark) {
        darkColorScheme(
            primary = integraColors.primary,
            onPrimary = Color.White,
            secondary = integraColors.secondary,
            background = integraColors.bg,
            surface = integraColors.surface,
            error = integraColors.error,
            onSurface = integraColors.text1,
            onBackground = integraColors.text1,
        )
    } else {
        lightColorScheme(
            primary = integraColors.primary,
            onPrimary = Color.White,
            secondary = integraColors.secondary,
            background = integraColors.bg,
            surface = integraColors.surface,
            error = integraColors.error,
            onSurface = integraColors.text1,
            onBackground = integraColors.text1,
        )
    }

    CompositionLocalProvider(LocalIntegraColors provides integraColors) {
        MaterialTheme(
            colorScheme = colorScheme,
            typography = Typography,
            content = content
        )
    }
}
