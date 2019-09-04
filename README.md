# City weather data visualization
A beautiful weather data shows you what it feels like in different places all over the world for a whole year.

Choose climate station on the map and see the weather shot. It consists of 365 bars laying on the temperature scale. Bar base (closer to center) - is lowest day temperature, and top - highest. The color of bar shows the mean.

## [Live demo](http://daviste.com/demo/cityweather)

[![](https://raw.githubusercontent.com/Dmitra/cityweather/master/snapshot/SFvsNY.jpg)](http://daviste.com/demo/cityweather)

## Feature
  + weather visualization
    + Temperature
      + Bar for min, max
      + Graph for average
      + Color coding for average
  + prepared data from NOAA
  + city selection on the map
  + visualization transformation on city selection
  + Comparison visualization
  + clustering of points on the map
  + responsive
  - optimized for mobile

## Roadmap
### Visualize
  - Precipitation
  * Wind/Air stagnation
    * speed: peak, avg
    * direction (avg) 
  * Humidity
  * Sun
    * Insolation
    * daylight/night time
    * sunshine/cloudy

#### Interactive
  - default city should be defined by detecting browser geo-location
  - search by geocode
  - Realtime visualizaion on daily data from NOAA

### Improvement
  - highlight selected points on map
  - Calibrate temperature colors
  - show about info (year)

  - ? remove stations without TMIN, TMAX, PRCP
  - optimize chart size for various screens
  - switch places for compared cities
  - Choose font for visualization
  - limit map pan on world view (smallest zoom)
  - design better UI controls
