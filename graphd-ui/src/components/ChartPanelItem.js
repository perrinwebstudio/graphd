import React from 'react'

import { ListItem, ListItemButton, ListItemText } from "@mui/material";
import { DeleteIconWithConfirmation } from "./system/DeleteIconWithConfirmation";

export default function ChartPanelItem({ chart, onClick, onDelete, activeChartId }) {
  const handleClick = () => {
    onClick(chart.id)
  }

  const handleDelete = () => {
    onDelete(chart.id)
  }

  return (
    <ListItem disablePadding secondaryAction={
      <DeleteIconWithConfirmation
        confirmationMessage={`Are you sure you want to remove chart '${chart.data?.metadata?.title || chart.id}'?`}
        onYes={handleDelete}
      />
    }>
      <ListItemButton onClick={handleClick} selected={chart.id === activeChartId}>
        <ListItemText primary={chart.data?.metadata?.title || chart.id} />
      </ListItemButton>
    </ListItem>
  )
}