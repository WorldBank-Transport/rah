'use strict'

export function toTimeStr (value) {
  if (isNaN(value) || value === null) {
    return 'n/a'
  }

  let remainder = value
  let hours = Math.floor(remainder / 3600)
  remainder %= 3600
  let minutes = Math.round(remainder / 60)

  let pieces = []
  if (hours) {
    pieces.push(hours < 10 ? `0${hours}H` : `${hours}H`)
    pieces.push(minutes < 10 ? `0${minutes}M` : `${minutes}M`)
  } else if (minutes) {
    pieces.push(minutes < 10 ? `0${minutes}M` : `${minutes}M`)
  } else {
    return '<1M'
  }

  return pieces.join(' ')
}
