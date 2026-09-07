package com.integra.ui.theme

import androidx.compose.ui.graphics.Color
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow

data class OperatorInfo(
    val id: String,
    val name: String,
    val primaryColor: Color,
    val primaryDarkColor: Color,
    val logoUrl: String? = null
)

object OperatorManager {

    val CLICKBUS = OperatorInfo(
        id = "clickbus",
        name = "ClickBus",
        primaryColor = Color(0xFF7B2CBF),
        primaryDarkColor = Color(0xFF5B1A9F)
    )

    val INTEGRA = OperatorInfo(
        id = "integra",
        name = "ÍNTEGRA",
        primaryColor = Color(0xFF7B2CBF),
        primaryDarkColor = Color(0xFF5B1A9F)
    )

    private val _currentOperator = MutableStateFlow(CLICKBUS)
    val currentOperator: StateFlow<OperatorInfo> = _currentOperator.asStateFlow()

    fun setOperator(operator: OperatorInfo) {
        _currentOperator.value = operator
    }

    fun setOperatorById(id: String) {
        when (id.lowercase()) {
            "clickbus" -> setOperator(CLICKBUS)
            "integra" -> setOperator(INTEGRA)
            else -> setOperator(CLICKBUS)
        }
    }
}
