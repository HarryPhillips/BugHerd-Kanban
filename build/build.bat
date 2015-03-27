@echo off

echo Building...
start /min "BUILDING_MAX" max.bat

echo Building minified...
start /min "BUILDING_MIN" min.bat

timeout 5

taskkill /fi "WINDOWTITLE eq BUILDING_MAX"
taskkill /fi "WINDOWTITLE eq BUILDING_MIN"