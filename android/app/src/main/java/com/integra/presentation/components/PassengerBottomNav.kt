package com.integra.presentation.components

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.integra.ui.theme.*

@Composable
fun PassengerBottomNav(
    currentRoute: String,
    onNavigate: (String) -> Unit
) {
    val items = listOf(
        Pair("passenger_home", "Início"),
        Pair("passenger_viagens", "Viagens"),
        Pair("passenger_bagagens", "Bagagens"),
        Pair("passenger_conta", "Conta")
    )

    Row(
        modifier = Modifier
            .fillMaxWidth()
            .background(DS_Surface)
            .padding(bottom = 18.dp, top = 11.dp),
        horizontalArrangement = Arrangement.SpaceEvenly
    ) {
        items.forEach { (route, label) ->
            val isSelected = currentRoute == route
            Column(
                horizontalAlignment = Alignment.CenterHorizontally,
                modifier = Modifier
                    .weight(1f)
                    .clickable { onNavigate(route) }
            ) {
                // Dummy Icon placeholder
                Text(
                    text = if (isSelected) "●" else "○",
                    color = if (isSelected) DS_Primary else DS_Text3,
                    fontSize = 22.sp,
                    modifier = Modifier.padding(bottom = 3.dp)
                )
                Text(
                    text = label,
                    fontSize = 10.sp,
                    fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium,
                    color = if (isSelected) DS_Primary else DS_Text3
                )
            }
        }
    }
}
