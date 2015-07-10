#City weather data visualization
A beautiful weather data shows you what it feels like in different places all over the world for a whole year.

Choose climate station on the map and see the weather shot. It consists of 365 bars laying on the temperature scale. Bar base (closer to center) - is lowest day temperature, and top - highest. The color of bar shows the mean.

##Live Demo
[Click on image for live demo ![Live demo](https://raw.githubusercontent.com/Dmitra/cityweather/master/snapshot/sanfrancisco.jpg)](http://dmitra.com/vis/cityweather)

##Feature
  + weather visualization
    + Temperature
      + Bar for min, max
      + Graph for average
      + Color coding for average
  + prepared data from NOAA
  + city selection on the map
  + visualization transformation on city selection
  + optimized for mobile
  + responsive

##Roadmap
###Visualize
  - Precipitation
  * Wind/Air stagnation
    * speed: peak, avg
    * direction (avg) 
  * Humidity
  * Sun
    * Insolation
    * daylight/night time
    * sunshine/cloudy

####Interactive
  - Multi-visualization for cities comparison on the chart
  - clustering of points on the map
  - Realtime visualizaion on daily data from NOAA

###Improvement
  - remove stations without TMIN, TMAX, PRCP
  - Choose font for visualization
  - Calibrate temperature colors
  - Center month label
  - Draw axis at year start
  - Bold zero celcius radial tick
  - show chart in overlay 

