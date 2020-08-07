import React from 'react'

export const successMessage = (message) => (
    <div class="alert alert-success alert-dismissible ">
        <a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>
        {message}
    </div>
)
export const warningMessage = (message) => (
    <div class="alert alert-warning alert-dismissible ">
        <a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>
        {message}
    </div>
)
export const infoMessage = (message) => (
    <div class="alert alert-info alert-dismissible ">
        <a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>
        {message}
    </div>
)
export const dangerMessage = (message) => (
    <div class="alert alert-danger alert-dismissible ">
        <a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>
        {message}
    </div>
)