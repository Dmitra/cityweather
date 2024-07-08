import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import main from '../feature/main/state.js'

export const api = createApi({
  baseQuery: fetchBaseQuery({
    // Fill in your own server starting URL here
    baseUrl: main.baseUrl,
  }),
  endpoints: build => ({
    getStations: build.query({
      query: () => ({ url: './data/stations.csv', responseHandler: 'text' }),
      transformResponse: (response, meta, arg) => {
        return parseStations(response)
      },
    }),
    getStation: build.query({
      async queryFn ({ ids, year }, _queryApi, _extraOptions, fetchWithBQ) {
        const responses = await Promise.all(ids.map(id => (
          fetchWithBQ({ url: `./data/${year}/${id}.csv`, responseHandler: 'text' }))
        ))
        return { data: _.map(responses, (response, i) => {
          const weatherData = parse(year, response.data)
          return { id: ids[i], data: weatherData }
        })}
      }
    })
  })
})

const dateFormatter = d3.time.format('%Y%m%d')

export async function parseStations (csv) {
  const stations = {}
  const data = d3.csv.parse(csv)
  _.each(data, station => {
    stations[station.id] = station
  })
  return stations
}

/**
 * format weather json from server
 */
export function parse (year, csv) {
  const json = d3.csv.parse('date,attr,value\n' + csv)
  const data = d3.nest()
    .key(d => d.date)
    .rollup(leaves => {
      return leaves.reduce((p, d, i, arr) => {
        p[d.attr] = +d.value
        return p
      }, {})
    })
    .entries(json)

  for (let i = 0; i < data.length; i++) {
    const result = {}
    result.date = +dateFormatter.parse(`${year}${data[i].key}`)
    result.tmin = +data[i].values.TMIN / 10
    result.tmax = +data[i].values.TMAX / 10
    result.tavg = +data[i].values.TAVG / 10
    result.prcp = +data[i].values.PRCP / 10

    data[i] = result
  }
  return data
}

export const { useGetStationsQuery, useGetStationQuery } = api