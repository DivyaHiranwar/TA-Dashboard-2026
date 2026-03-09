import { useState, useCallback, useEffect } from 'react'
import { processSheetData } from '../utils/dataProcessor'

const SHEET_ID = '1bOxEmh7iv2tE1qoPhHQBrRwZRr-IAtBi'
const GVIZ_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&t=${Date.now()}`

function buildUrl() {
  return `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&cachebust=${Date.now()}`
}

async function fetchSheetData() {
  const url = buildUrl()
  const response = await fetch(url)
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
  const text = await response.text()

  // Parse gviz JSONP response
  const match = text.match(/google\.visualization\.Query\.setResponse\(([\s\S]+)\)/)
  if (!match) throw new Error('Invalid gviz response format')

  const json = JSON.parse(match[1])
  if (json.status !== 'ok') throw new Error(`Gviz error: ${json.status}`)

  return json.table
}

export function useSheetData() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [lastRefresh, setLastRefresh] = useState(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const table = await fetchSheetData()
      const processed = processSheetData(table)
      setData(processed)
      setLastRefresh(new Date())
    } catch (err) {
      console.error('Failed to fetch sheet data:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  return { data, loading, error, refresh, lastRefresh }
}
